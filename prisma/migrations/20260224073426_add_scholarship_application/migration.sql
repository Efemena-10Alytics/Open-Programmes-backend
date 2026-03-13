-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_cohortCourseId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_cohortCourseId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_cohortCourseModuleId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentAttachment" DROP CONSTRAINT "AssignmentAttachment_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentQuizAnswer" DROP CONSTRAINT "AssignmentQuizAnswer_assignmentQuizQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentQuizAnswer" DROP CONSTRAINT "AssignmentQuizAnswer_selectedAssignmentQuizOptionId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentQuizSubmission" DROP CONSTRAINT "AssignmentQuizSubmission_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentSubmission" DROP CONSTRAINT "AssignmentSubmission_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "ClassMaterial" DROP CONSTRAINT "ClassMaterial_cohortCourseId_fkey";

-- DropForeignKey
ALTER TABLE "ClassRecording" DROP CONSTRAINT "ClassRecording_cohortCourseId_fkey";

-- DropForeignKey
ALTER TABLE "Cohort" DROP CONSTRAINT "Cohort_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CohortAttachment" DROP CONSTRAINT "CohortAttachment_cohortCourseId_fkey";

-- DropForeignKey
ALTER TABLE "CohortQuiz" DROP CONSTRAINT "CohortQuiz_cohortCourseId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_announcementId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_streamPostId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_courseWeekId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentInstallment" DROP CONSTRAINT "PaymentInstallment_paymentStatusId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentStatus" DROP CONSTRAINT "PaymentStatus_cohortId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentStatus" DROP CONSTRAINT "PaymentStatus_courseId_fkey";

-- DropForeignKey
ALTER TABLE "classroom_topics" DROP CONSTRAINT "classroom_topics_cohortCourseId_fkey";

-- DropForeignKey
ALTER TABLE "stream_posts" DROP CONSTRAINT "stream_posts_cohortCourseId_fkey";

-- CreateTable
CREATE TABLE "ScholarshipApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "cohort" TEXT NOT NULL,
    "discountCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "ScholarshipApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentInstallment" ADD CONSTRAINT "PaymentInstallment_paymentStatusId_fkey" FOREIGN KEY ("paymentStatusId") REFERENCES "PaymentStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentStatus" ADD CONSTRAINT "PaymentStatus_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentStatus" ADD CONSTRAINT "PaymentStatus_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortAttachment" ADD CONSTRAINT "CohortAttachment_cohortCourseId_fkey" FOREIGN KEY ("cohortCourseId") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortQuiz" ADD CONSTRAINT "CohortQuiz_cohortCourseId_fkey" FOREIGN KEY ("cohortCourseId") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseWeekId_fkey" FOREIGN KEY ("courseWeekId") REFERENCES "CourseWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_cohortCourseId_fkey" FOREIGN KEY ("cohortCourseId") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_cohortCourseModuleId_fkey" FOREIGN KEY ("cohortCourseModuleId") REFERENCES "CohortCourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentQuizSubmission" ADD CONSTRAINT "AssignmentQuizSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentQuizAnswer" ADD CONSTRAINT "AssignmentQuizAnswer_assignmentQuizQuestionId_fkey" FOREIGN KEY ("assignmentQuizQuestionId") REFERENCES "AssignmentQuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentQuizAnswer" ADD CONSTRAINT "AssignmentQuizAnswer_selectedAssignmentQuizOptionId_fkey" FOREIGN KEY ("selectedAssignmentQuizOptionId") REFERENCES "AssignmentQuizOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentAttachment" ADD CONSTRAINT "AssignmentAttachment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_cohortCourseId_fkey" FOREIGN KEY ("cohortCourseId") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_streamPostId_fkey" FOREIGN KEY ("streamPostId") REFERENCES "stream_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_topics" ADD CONSTRAINT "classroom_topics_cohortCourseId_fkey" FOREIGN KEY ("cohortCourseId") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMaterial" ADD CONSTRAINT "ClassMaterial_cohortCourseId_fkey" FOREIGN KEY ("cohortCourseId") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRecording" ADD CONSTRAINT "ClassRecording_cohortCourseId_fkey" FOREIGN KEY ("cohortCourseId") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_posts" ADD CONSTRAINT "stream_posts_cohortCourseId_fkey" FOREIGN KEY ("cohortCourseId") REFERENCES "CohortCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScholarshipApplication" ADD CONSTRAINT "ScholarshipApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
