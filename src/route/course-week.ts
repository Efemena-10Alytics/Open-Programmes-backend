import express from "express";
import { isAdmin, isCourseAdmin } from "../middleware";
import {
  createCourseWeek,
  getCourseWeek,
  getCourseWeeks,
  updateCourseWeek,
  deleteCourseWeek,
  publishCourseWeek,
  unPublishCourseWeek,
} from "../controllers/course-week";

export default (router: express.Router) => {
  router.get("/courses/:courseId/weeks", getCourseWeeks);
  router.get("/courses/:courseId/weeks/:weekId", getCourseWeek);
  router.post(
    "/courses/:courseId/weeks/",
    isCourseAdmin,
    createCourseWeek
  );
  router.patch(
    "/courses/:courseId/weeks/:weekId",
    isCourseAdmin,
    updateCourseWeek
  );
  router.delete("/courses/:courseId/weeks/:weekId", isAdmin, deleteCourseWeek);
  router.patch(
    "/courses/:courseId/weeks/:weekId/publish",
    isCourseAdmin,
    publishCourseWeek
  );
  router.patch(
    "/courses/:courseId/weeks/:weekId/unPublish",
    isCourseAdmin,
    unPublishCourseWeek
  );
};
