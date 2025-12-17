import { getMasterClassApplicants, registerMasterclass } from "../controllers/masterclass";
import express from "express";

export default (router: express.Router) => {
  router.post("/masterclass/register", registerMasterclass);
  router.get("/masterclass/applicants", getMasterClassApplicants);
};
