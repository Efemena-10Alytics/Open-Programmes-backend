import express from "express";
import { getCurrentWeek } from "../controllers/events";

export default (router: express.Router) => {
  router.get("/users/:userId/courses/:courseId/current-week", getCurrentWeek);
};