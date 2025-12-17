import express from "express";
import { isCourseAdmin } from "../middleware";
import { getOverview } from "../controllers/overview";

export default (router: express.Router) => {
  router.get("/overview", isCourseAdmin, getOverview);
};
