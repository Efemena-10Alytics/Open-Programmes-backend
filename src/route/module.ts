import express from "express";
import {
  createModule,
  getModulesByWeek,
} from "../controllers/module";
import { isCourseAdmin } from "../middleware";

export default (router: express.Router) => {
  // Get all modules for a specific week
  router.get("/module/week/:weekId", getModulesByWeek);
  
  // Create a new module
  router.post("/module", isCourseAdmin, createModule);
};