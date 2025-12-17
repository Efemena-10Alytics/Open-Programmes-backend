import express from "express";
import {
  getCourseAdminStudents,
  getCourseAdminStudentEngagement,
  getCourseAdminDashboard,
} from "../controllers/courseAdminTracking";
import { isAdmin, isCourseAdmin } from "../middleware";

export default (router: express.Router) => {
  // Course admin routes
  router.get(
    "/engagement/course-admin/dashboard",
    isCourseAdmin,
    getCourseAdminDashboard
  );
  router.get(
    "/engagement/course-admin/:courseId/students",
    isCourseAdmin,
    getCourseAdminStudents
  );
  router.get(
    "/engagement/course-admin/:courseId/student/:studentId",
    isCourseAdmin,
    getCourseAdminStudentEngagement
  );
};
