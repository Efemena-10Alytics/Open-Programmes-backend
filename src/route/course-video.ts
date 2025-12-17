import express from "express";
import { isCourseAdmin } from "../middleware";
import {
createCourseVideo,
deleteCourseVideo,
getCourseVideo,
getCourseVideos,
getCourseVideosByCourseId,
updateCourseVideo
} from "../controllers/course-video";

export default (router: express.Router) => {
  router.get("/courses/:courseId/weeks/:weekId/modules/:moduleId/videos", getCourseVideos);
  router.get("/courses/:courseId/weeks/:weekId/modules/:moduleId/videos/:videoId", getCourseVideo);
  router.get("/course-videos/:courseId", getCourseVideosByCourseId);
  router.post(
    "/courses/:courseId/weeks/:weekId/modules/:moduleId/videos",
    isCourseAdmin,
    createCourseVideo
  );
  router.patch(
    "/courses/:courseId/weeks/:weekId/modules/:moduleId/videos/:videoId",
    isCourseAdmin,
    updateCourseVideo
  );
  router.delete(
    "/courses/:courseId/weeks/:weekId/modules/:moduleId/videos/:videoId",
    isCourseAdmin,
    deleteCourseVideo
  );
};
