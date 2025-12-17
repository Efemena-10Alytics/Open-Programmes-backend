import express from "express";
import {
  createProgramLead,
  getProgramLeads,
  getProgramLeadsCount,
  exportProgramLeads,
} from "../controllers/program-leads";
import { isCourseAdmin } from "../middleware";

export default (router: express.Router) => {
  router.post("/program-leads", createProgramLead);
  router.get("/program-leads", isCourseAdmin, getProgramLeads);
  router.get("/program-leads/count", isCourseAdmin, getProgramLeadsCount);
  router.get("/program-leads/export", isCourseAdmin, exportProgramLeads);
};
