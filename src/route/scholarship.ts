import express from "express";
import { applyForScholarship, getScholarshipApplications } from "../controllers/scholarship";
import { isCourseAdmin } from "../middleware";

export default (router: express.Router) => {
    router.post("/scholarship/apply", applyForScholarship);
    router.get("/scholarship", isCourseAdmin, getScholarshipApplications);
};
