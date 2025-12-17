//@ts-nocheck
const { PrismaClient } = require("@prisma/client");
const Queue = require("bull");
const { config } = require("dotenv");

config();

const prismadb = new PrismaClient();

// Create a new Bull queue
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const cohortQueue = new Queue("cohort-creation", redisUrl);

// Function to update cohort course week publish status
const updateCohortCourseWeekPublishStatus = async (cohortId) => {
  try {
    console.log(`Began cohort course week update for cohort ID: ${cohortId}`);

    // Find the last unpublished CohortCourseWeek for the given cohort
    const lastUnpublishedWeek = await prismadb.cohortCourseWeek.findFirst({
      where: {
        cohortCourse: {
          cohortId: cohortId,
        },
        isPublished: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (lastUnpublishedWeek) {
      const updatedCohortCourseWeek = await prismadb.cohortCourseWeek.update({
        where: {
          id: lastUnpublishedWeek.id,
        },
        data: {
          isPublished: true,
        },
      });

      console.log(
        `Course week updated for cohort course week ID: ${lastUnpublishedWeek.id}`
      );
    } else {
      console.log(
        `No unpublished cohort course weeks found for cohort ID: ${cohortId}`
      );
    }
  } catch (error) {
    console.error(
      "Detailed error for publishing course cohort weekly with cron:",
      error
    );
    return;
  }
};

// Function to update weekly publish status for all active cohorts
async function updateWeeklyPublishStatus() {
  try {
    console.log("Update week function called");

    // Fetch all active cohorts
    const activeCohorts = await prismadb.cohort.findMany();

    // Iterate over each active cohort
    for (const cohort of activeCohorts) {
      await updateCohortCourseWeekPublishStatus(cohort.id);
    }

    console.log("Update week function success");
  } catch (error) {
    console.error("Error updating weekly cohort publish status:", error);
  }
}

// Define the job processor
cohortQueue.process(async (job) => {
  await updateWeeklyPublishStatus();
});

// Schedule the job to run at 12am every Sunday
cohortQueue.add(
  {},
  {
    repeat: {
      cron: "0 0 * * 0", // At 00:00 on Sunday
    },
  }
);

console.log("Update cohort course week status Bull job scheduled");

cohortQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

cohortQueue.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed with error: ${err.message}`);
});
