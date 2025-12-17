import { Request, Response } from "express";
import { prismadb } from "../../index";

interface BatchItemData {
  type: "assignment" | "material" | "recording";
  data: any;
  topicIds: string[]; // Array of topic IDs to add the item to
}

interface BatchTopicData {
  title: string;
  description?: string;
  isPinned?: boolean;
  cohortCourseIds: string[]; // Array of cohort course IDs to create topics in
}

export const addBatchItem = async (req: Request, res: Response) => {
  try {
    const { type, data, topicIds }: BatchItemData = req.body;

    if (!type || !data || !topicIds || !Array.isArray(topicIds)) {
      return res.status(400).json({ 
        error: "Type, data, and topicIds array are required" 
      });
    }

    // Validate all topics exist and get their cohortCourseIds
    const topics = await prismadb.classroomTopic.findMany({
      where: {
        id: { in: topicIds }
      },
      include: {
        cohortCourse: {
          select: {
            id: true,
            cohortId: true
          }
        }
      }
    });

    if (topics.length !== topicIds.length) {
      const foundIds = topics.map(t => t.id);
      const missingIds = topicIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({ 
        error: "Some topics not found", 
        missingIds 
      });
    }

    const results = [];
    const errors = [];

    // Create item for each topic
    for (const topic of topics) {
      try {
        let result;
        
        switch (type) {
          case "assignment":
            result = await prismadb.assignment.create({
              data: {
                ...data,
                classroomTopicId: topic.id,
                cohortCourseId: topic.cohortCourseId,
              },
              include: {
                classroomTopic: true,
                cohortCourse: {
                  include: {
                    cohort: true
                  }
                }
              }
            });
            break;
          case "material":
            result = await prismadb.classMaterial.create({
              data: {
                ...data,
                classroomTopicId: topic.id,
                cohortCourseId: topic.cohortCourseId,
              },
              include: {
                classroomTopic: true,
                cohortCourse: {
                  include: {
                    cohort: true
                  }
                }
              }
            });
            break;
          case "recording":
            result = await prismadb.classRecording.create({
              data: {
                ...data,
                classroomTopicId: topic.id,
                cohortCourseId: topic.cohortCourseId,
              },
              include: {
                classroomTopic: true,
                cohortCourse: {
                  include: {
                    cohort: true
                  }
                }
              }
            });
            break;
          default:
            errors.push({
              topicId: topic.id,
              error: "Invalid item type"
            });
            continue;
        }
        
        results.push({
          topicId: topic.id,
          topicTitle: topic.title,
          cohortName: topic.cohortCourse,
          item: result
        });
      } catch (error) {
        errors.push({
          topicId: topic.id,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    res.json({ 
      success: results.length > 0,
      results,
      errors,
      summary: {
        total: topicIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Batch add item error:", error);
    res.status(500).json({ error: "Failed to add batch items" });
  }
};

export const createBatchTopics = async (req: Request, res: Response) => {
  try {
    const { title, description, isPinned, cohortCourseIds }: BatchTopicData = req.body;

    if (!title || !cohortCourseIds || !Array.isArray(cohortCourseIds)) {
      return res.status(400).json({ 
        error: "Title and cohortCourseIds array are required" 
      });
    }

    // Validate all cohort courses exist
    const cohortCourses = await prismadb.cohortCourse.findMany({
      where: {
        id: { in: cohortCourseIds }
      },
      include: {
        cohort: true,
        course: true
      }
    });

    if (cohortCourses.length !== cohortCourseIds.length) {
      const foundIds = cohortCourses.map(cc => cc.id);
      const missingIds = cohortCourseIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({ 
        error: "Some cohort courses not found", 
        missingIds 
      });
    }

    const results = [];
    const errors = [];

    // Create topic in each cohort course
    for (const cohortCourse of cohortCourses) {
      try {
        // Get the highest order number for this cohort course
        const highestOrderTopic = await prismadb.classroomTopic.findFirst({
          where: { cohortCourseId: cohortCourse.id },
          orderBy: { order: "desc" },
        });

        const topic = await prismadb.classroomTopic.create({
          data: {
            title,
            description,
            isPinned: isPinned || false,
            order: (highestOrderTopic?.order || 0) + 1,
            cohortCourseId: cohortCourse.id,
          },
          include: {
            cohortCourse: {
              include: {
                cohort: true,
                course: true
              }
            }
          }
        });
        
        results.push({
          cohortCourseId: cohortCourse.id,
          cohortName: cohortCourse.cohort.name,
          courseName: cohortCourse.course.title,
          topic
        });
      } catch (error) {
        errors.push({
          cohortCourseId: cohortCourse.id,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    res.json({ 
      success: results.length > 0,
      results,
      errors,
      summary: {
        total: cohortCourseIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Create batch topics error:", error);
    res.status(500).json({ error: "Failed to create batch topics" });
  }
};

// Get all topics across multiple cohorts for selection
export const getTopicsForCohorts = async (req: Request, res: Response) => {
  try {
    const { cohortIds } = req.query;
    
    if (!cohortIds || typeof cohortIds !== 'string') {
      return res.status(400).json({ error: "cohortIds query parameter is required" });
    }

    const cohortIdsArray = cohortIds.split(',');

    const topics = await prismadb.classroomTopic.findMany({
      where: {
        cohortCourse: {
          cohortId: { in: cohortIdsArray }
        }
      },
      include: {
        cohortCourse: {
          include: {
            cohort: true,
            course: true
          }
        },
        _count: {
          select: {
            assignments: true,
            classMaterials: true,
            classRecordings: true
          }
        }
      },
      orderBy: [
        { isPinned: "desc" },
        { order: "asc" }
      ]
    });

    // Group topics by cohort for easier frontend display
    const groupedByCohort = topics.reduce((acc, topic) => {
      const cohortId = topic.cohortCourse.cohortId;
      if (!acc[cohortId]) {
        acc[cohortId] = {
          cohort: topic.cohortCourse.cohort,
          course: topic.cohortCourse.course,
          topics: []
        };
      }
      acc[cohortId].topics.push(topic);
      return acc;
    }, {} as any);

    res.json({ 
      topics: groupedByCohort,
      total: topics.length
    });
  } catch (error) {
    console.error("Get topics for cohorts error:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};