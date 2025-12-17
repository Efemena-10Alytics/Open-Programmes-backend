import { applyForCourse, exportFreeCourseApplicantsPDF, getFreeCourseApplicants } from "../controllers/free-course";
import express from "express";

export default (router: express.Router) => {
  router.post("/free-course/apply", applyForCourse);
  router.get("/free-course/applicants", getFreeCourseApplicants);
  router.get('/export-pdf', exportFreeCourseApplicantsPDF);
};
