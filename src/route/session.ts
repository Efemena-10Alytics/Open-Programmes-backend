import express from "express";
import { createSession, getActiveSessions } from "../controllers/session";
import { isCourseAdmin } from "../middleware";

export default (router: express.Router) => {
  router.post("/sessions", isCourseAdmin, createSession);

  router.get("/sessions/active", getActiveSessions);
};
