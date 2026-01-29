import { Request, Response } from "express";
import { prismadb } from "../../index";
import { User } from "../../middleware/index";
import { Purchase } from "@prisma/client";

const handleServerError = (error: any, res: Response) => {
  console.error({ error_server: error });
  res.status(500).json({ message: "Internal Server Error" });
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prismadb.course.findMany({
      include: {
        skills_you_will_learn: true,
        learning_Outcomes: true,
        prerequisites: true,
        tags: true,
        catalog_header_tags: true,
        course_weeks: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            courseModules: {
              orderBy: {
                createdAt: "asc",
              },
              include: {
                projectVideos: {
                  select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    duration: true,
                    moduleId: true,
                    courseId: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
                quizzes: {
                  orderBy: {
                    createdAt: "asc",
                  },
                  include: {
                    answers: true,
                  },
                },
              },
            },
          },
        },
        cohorts: true, // Modified from select: { id: true } to true
        timetable: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res
      .status(200)
      .json({ status: "success", message: null, data: courses });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const getCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const user = req.user as User;
    const userId = user?.id;
    const isAdmin = user?.role === "ADMIN" || user?.role === "COURSE_ADMIN";

    if (!userId) {
      throw new Error(
        "UserId not detected, cannot check if course has been purchased yet"
      );
    }

    if (!courseId) {
      return res.status(400).json({ message: "CourseId is required" });
    }

    let coursePurchased: Purchase = null!;
    let isCoursePurchased: boolean = false;

    if (userId) {
      const currentUser = await prismadb.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          course_purchased: true,
        },
      });

      if (!currentUser) {
        return res.status(400).json({ message: "User does not exist" });
      }

      coursePurchased = currentUser.course_purchased.find(
        (course) => course?.courseId === courseId && course.userId === userId
      )!;

      isCoursePurchased = coursePurchased || isAdmin ? true : false;
    }

    const course = await prismadb.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        skills_you_will_learn: true,
        learning_Outcomes: true,
        prerequisites: true,
        tags: true,
        catalog_header_tags: true,
        course_weeks: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            attachments: isCoursePurchased ? true : false,
            courseModules: {
              orderBy: {
                createdAt: "asc",
              },
              include: {
                projectVideos: {
                  select: {
                    id: true,
                    title: true,
                    videoUrl: isCoursePurchased ? true : false,
                    thumbnailUrl: true,
                    duration: true,
                    moduleId: true,
                    courseId: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
                quizzes: {
                  orderBy: {
                    createdAt: "asc",
                  },
                  include: {
                    answers: true,
                  },
                },
              },
            },
          },
        },
        timetable: true,
        cohorts: true,
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course does not exist" });
    }

    return res.status(200).json({
      status: "success",
      message: `${user?.role === "USER" &&
        !coursePurchased &&
        "Course purchase not found, weekly attachments and video url is disabled"
        }`,
      data: course,
    });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title }: { title: string } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const course = await prismadb.course.create({
      data: {
        title,
      },
      select: {
        id: true,
        title: true,
      },
    });

    return res
      .status(201)
      .json({ status: "Course created", message: null, data: course });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "CourseId is required" });
    }

    const existingCourse = await prismadb.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Course does not exist" });
    }

    const course = await prismadb.course.update({
      where: {
        id: courseId,
      },
      data: {
        ...body,
      },
    });

    return res
      .status(200)
      .json({ status: "Course updated", message: null, data: course });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "CourseId is required" });
    }

    const existingCourse = await prismadb.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Course does not exist" });
    }

    // Delete related records manually to avoid foreign key constraints if cascade delete is not set up perfectly in DB
    // 1. Delete Purchase
    await prismadb.purchase.deleteMany({
      where: {
        courseId: courseId
      }
    });

    // 2. Delete Cohorts
    await prismadb.cohort.deleteMany({
      where: {
        courseId: courseId
      }
    });

    // 3. Delete TimeTables
    await prismadb.timeTable.deleteMany({
      where: {
        courseId: courseId
      }
    });

    // 4. Delete CourseWeeks
    await prismadb.courseWeek.deleteMany({
      where: {
        courseId: courseId
      }
    });

    // 5. Delete Other Related Models...
    await prismadb.skillsYouWillLearn.deleteMany({ where: { courseId } });
    await prismadb.learningOutcome.deleteMany({ where: { courseId } });
    await prismadb.prerequisite.deleteMany({ where: { courseId } });
    await prismadb.tag.deleteMany({ where: { courseId } });
    await prismadb.catalogHeaderTags.deleteMany({ where: { courseId } });
    await prismadb.projectVideo.deleteMany({ where: { courseId } });
    await prismadb.userProgress.deleteMany({ where: { courseId } });
    await prismadb.paymentStatus.deleteMany({ where: { courseId } });
    await prismadb.paystackTransaction.deleteMany({ where: { courseId } });

    await prismadb.course.delete({
      where: {
        id: courseId,
      },
    });

    return res.status(200).json({ status: "Course deleted" });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const getCourseWithoutAuth = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "CourseId is required" });
    }

    const course = await prismadb.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        skills_you_will_learn: true,
        learning_Outcomes: true,
        prerequisites: true,
        tags: true,
        catalog_header_tags: true,
        course_weeks: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            courseModules: {
              orderBy: {
                createdAt: "asc",
              },
              include: {
                projectVideos: {
                  select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    duration: true,
                    moduleId: true,
                    courseId: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
                quizzes: {
                  orderBy: {
                    createdAt: "asc",
                  },
                  include: {
                    answers: true,
                  },
                },
              },
            },
          },
        },
        timetable: true,
        cohorts: true,
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course does not exist" });
    }

    return res.status(200).json({
      status: "success",
      message: null,
      data: course,
    });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const getCourseWithoutAuthWithSlug = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    const course = await prismadb.course.findFirst({
      where: {
        slug,
      },
      include: {
        skills_you_will_learn: true,
        learning_Outcomes: true,
        prerequisites: true,
        tags: true,
        catalog_header_tags: true,
        course_weeks: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            courseModules: {
              orderBy: {
                createdAt: "asc",
              },
              include: {
                projectVideos: {
                  select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    duration: true,
                    moduleId: true,
                    courseId: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
                quizzes: {
                  orderBy: {
                    createdAt: "asc",
                  },
                  include: {
                    answers: true,
                  },
                },
              },
            },
          },
        },
        timetable: true,
        cohorts: true,
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course does not exist" });
    }

    return res.status(200).json({
      status: "success",
      message: null,
      data: course,
    });
  } catch (error) {
    handleServerError(error, res);
  }
};

export const getCourseCohorts = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "CourseId is required" });
    }

    // Verifying course exists
    const course = await prismadb.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get cohorts for this course
    const cohorts = await prismadb.cohort.findMany({
      where: { courseId },
      orderBy: {
        startDate: "desc",
      },
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: null,
      data: cohorts,
    });
  } catch (error) {
    handleServerError(error, res);
  }
};
