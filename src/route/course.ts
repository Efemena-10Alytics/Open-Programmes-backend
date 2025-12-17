import express from "express";
import { isAdmin, isCourseAdmin, isLoggedIn } from "../middleware";
import {
  createCourse,
  deleteCourse,
  getCourse,
  getCourses,
  getCourseWithoutAuth,
  getCourseWithoutAuthWithSlug,
  updateCourse,
  getCourseCohorts
} from "../controllers/course";

export default (router: express.Router) => {
  router.get("/courses", getCourses);
  router.get("/courses/:courseId", isLoggedIn, getCourse);
  router.post("/courses", isCourseAdmin, createCourse);
  router.patch("/courses/:courseId", isCourseAdmin, updateCourse);
  router.delete("/courses/:courseId", isAdmin, deleteCourse);
  router.get("/courses/:courseId/no-auth", getCourseWithoutAuth);
  router.get("/courses/slug/:slug", getCourseWithoutAuthWithSlug);
  router.get("/courses/:courseId/cohorts", isLoggedIn, getCourseCohorts);
};
