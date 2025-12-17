import express from "express";
import {
  getStudentEngagement,
  getVideoEngagementDetails,
  getCourseEngagementOverview,
  getCourseVideos,
  getUserCourseVideos
} from "../controllers/engagement";
import { isCourseAdmin, isAdmin,  } from "../middleware";

export default (router: express.Router) => {
  router.get("/engagement/:userId", isAdmin, getStudentEngagement);
  router.get("/engagement/video/:videoId", isAdmin, getVideoEngagementDetails);
  router.get(
    "/engagement/course/:courseId",
    isAdmin,
    getCourseEngagementOverview
  );
  router.get("/engagement/course/:courseId/videos", isAdmin, getCourseVideos);
  router.get("/engagement/:userId/course/:courseId/videos", isCourseAdmin, getUserCourseVideos);
};
