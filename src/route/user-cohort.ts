import express from "express";
import { isAdmin } from "../middleware";
import { updateUserCohort } from "../controllers/user-cohort";

export default (router: express.Router) => {
  router.patch("/user-cohort/:cohortId", isAdmin, updateUserCohort);
};
