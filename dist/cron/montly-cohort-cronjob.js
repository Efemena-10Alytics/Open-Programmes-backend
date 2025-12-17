"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-nocheck
const { PrismaClient } = require("@prisma/client");
// const Queue = require("bull");
// const { config } = require("dotenv");
// config();
const prismadb = new PrismaClient();
// Create a new Bull queue
// const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
// const cohortQueue = new Queue("cohort-creation", redisUrl);
// Create Cohort
const createCohort = async (name, startDate, endDate, courseId) => {
    try {
        console.log("Began cohort transaction");
        const cohort = await prismadb.$transaction(async (prisma) => {
            // Step 1: Create a new Cohort
            const cohort = await prisma.cohort.create({
                data: {
                    name,
                    startDate,
                    endDate,
                    courseId,
                },
            });
            console.log("Fetching course");
            // Step 2: Fetch the course and its related data
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                include: {
                    timetable: true,
                    course_weeks: {
                        include: {
                            courseModules: {
                                include: {
                                    projectVideos: true,
                                    quizzes: {
                                        include: {
                                            answers: true,
                                        },
                                    },
                                },
                            },
                            attachments: true,
                        },
                    },
                },
            });
            if (!course) {
                throw new Error("Course not found");
            }
            console.log("Course found");
            // Step 3: Create a CohortCourse instance with the course data
            const cohortCourse = await prisma.cohortCourse.create({
                data: {
                    cohortId: cohort.id,
                    courseId: course.id,
                    title: course.title,
                    description: course.description,
                    price: course.price,
                    imageUrl: course.imageUrl,
                    course_duration: course.course_duration,
                    course_instructor_name: course.course_instructor_name,
                    course_instructor_image: course.course_instructor_image,
                    course_instructor_title: course.course_instructor_title,
                    course_instructor_description: course.course_instructor_description,
                    brochureUrl: course.brochureUrl,
                    course_preview_video: course.course_preview_video,
                },
            });
            console.log("Cohort course instance created");
            // Step 4: Copy weeks, modules, videos, attachments, and quizzes to cohort-specific models
            for (const timetable of course.timetable) {
                await prisma.cohortCourseTimeTable.create({
                    data: {
                        name: timetable.name,
                        category: timetable.category,
                        date: timetable.date ? new Date(timetable.date) : new Date(),
                        cohortCourse: {
                            connect: {
                                id: cohortCourse.id,
                            },
                        },
                    },
                });
            }
            for (const week of course.course_weeks) {
                const cohortCourseWeek = await prisma.cohortCourseWeek.create({
                    data: {
                        title: week.title,
                        iconUrl: week.iconUrl,
                        cohortCourseId: cohortCourse.id,
                        isPublished: week.isPublished,
                    },
                });
                for (const attachment of week.attachments) {
                    await prisma.cohortAttachment.create({
                        data: {
                            name: attachment.name,
                            url: attachment.url,
                            cohortCourseWeekId: cohortCourseWeek.id,
                        },
                    });
                }
                for (const module of week.courseModules) {
                    const cohortCourseModule = await prisma.cohortCourseModule.create({
                        data: {
                            title: module.title,
                            description: module.description,
                            iconUrl: module.iconUrl,
                            cohortCourseWeekId: cohortCourseWeek.id,
                            cohortCourseId: cohortCourse.id,
                        },
                    });
                    for (const video of module.projectVideos) {
                        await prisma.cohortProjectVideo.create({
                            data: {
                                title: video.title,
                                videoUrl: video.videoUrl,
                                thumbnailUrl: video.thumbnailUrl,
                                duration: video.duration,
                                cohortCourseModuleId: cohortCourseModule.id,
                                cohortCourseId: cohortCourse.id,
                            },
                        });
                    }
                    for (const quiz of module.quizzes) {
                        const cohortQuiz = await prisma.cohortQuiz.create({
                            data: {
                                question: quiz.question,
                                cohortCourseModuleId: cohortCourseModule.id,
                                cohortCourseId: cohortCourse.id,
                                originalQuizId: quiz.id,
                            },
                        });
                        for (const answer of quiz.answers) {
                            await prisma.cohortQuizAnswer.create({
                                data: {
                                    answer: answer.name,
                                    isCorrect: answer.isCorrect,
                                    cohortQuizId: cohortQuiz.id,
                                    originalAnswerId: answer.id,
                                },
                            });
                        }
                    }
                }
            }
            console.log("Cohort transaction completed");
            return cohort;
        }, {
            maxWait: 15000, // 15 seconds
            timeout: 60000, // 60 seconds
        });
        console.log("Cohort created");
    }
    catch (error) {
        console.error("Detailed error for creating cohort with cron:", error);
    }
};
// Function to generate the cohort name
function generateCohortName() {
    const now = new Date();
    const month = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();
    return `${month} ${year} Cohort`;
}
// Function to create a new cohort
async function createMonthlyCohort() {
    try {
        const name = generateCohortName();
        const startDate = new Date(); // Today's date
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3); // End date is three months from now
        // courseId for data analysis
        const courseIdDA = "clycxjlec00015a7iycm2cbdn";
        // courseId for data science
        const courseIdDS = "clycxjxdz00025a7isah5z5yb";
        // courseId for business analysis
        const courseIdBA = "clycxiomd00005a7ifv6t8r5o";
        // Call the createCohort function
        console.log("createCohort function called for DA");
        await createCohort(name, startDate, endDate, courseIdDA);
        console.log("createCohort function successful for DA");
        console.log("createCohort function called for DS");
        await createCohort(name, startDate, endDate, courseIdDS);
        console.log("createCohort function successful for DS");
        console.log("createCohort function called for BA");
        await createCohort(name, startDate, endDate, courseIdBA);
        console.log("createCohort function successful for BA");
    }
    catch (error) {
        console.error("Error creating monthly cohort:", error);
    }
}
console.log("Initiate monthly cohort creation");
createMonthlyCohort();
console.log("Monthly cohort creation completed");
console.log("Cohort creation job scheduled");
// Define the job processor
// cohortQueue.process(async (job) => {
//   await createMonthlyCohort();
// });
// Schedule the job to run at 12:00 AM on the first day of every month
// cohortQueue.add(
//   {},
//   {
//     repeat: {
//       cron: "0 0 1 * *", // At 12:00 AM on the first day of every month
//       tz: "UTC", // Adjust the timezone as needed
//     },
//   }
// );
// console.log("Cohort creation Bull job scheduled");
// cohortQueue.on("completed", (job) => {
//   console.log(`Job ${job.id} completed successfully`);
// });
// cohortQueue.on("failed", (job, err) => {
//   console.log(`Job ${job.id} failed with error: ${err.message}`);
// });
//# sourceMappingURL=montly-cohort-cronJob.js.map