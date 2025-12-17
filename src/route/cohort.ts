import express from "express";
import {
  getCohorts,
  getCohort,
  createCohort,
  updateCohort,
  deleteCohort,
  updateCohortCourseWeekPublishStatus,
  updateCohortCourseTimeTable,
  uploadOnboardingBrochure,
  upload,
  getCohortsForChangeRequests, // Add this import
} from "../controllers/cohort";
import { isCourseAdmin, isLoggedIn } from "../middleware";

export default (router: express.Router) => {
  router.get("/cohorts", getCohorts);
  router.get("/cohorts/change-requests", getCohortsForChangeRequests);
  router.get("/cohorts/:cohortId", isLoggedIn, getCohort);
  router.post("/cohorts", isCourseAdmin, createCohort);
  router.patch("/cohorts/:cohortId", isCourseAdmin, updateCohort);
  router.delete("/cohorts/:cohortId", isCourseAdmin, deleteCohort);
  router.patch(
    "/cohorts/:cohortId/update-cohort-course-week",
    isCourseAdmin,
    updateCohortCourseWeekPublishStatus
  );
  router.patch(
    "/cohorts/:cohortId/update-cohort-course-timetable",
    isCourseAdmin,
    updateCohortCourseTimeTable
  );
  router.post(
    "/cohorts/:cohortId/brochure",
    upload.single("brochure"),
    uploadOnboardingBrochure
  );
};
