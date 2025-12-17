import express from "express";
import {
  createFacilitator,
  getFacilitators,
  updateFacilitator,
  deleteFacilitator,
  assignFacilitatorToCourse,
} from "../controllers/facilitator";
import { isCourseAdmin, isLoggedIn } from "../middleware";

export default (router: express.Router) => {
  router.post("/facilitators",  createFacilitator);
  router.get("/facilitators",  getFacilitators);
  router.put("/facilitators/:id", isCourseAdmin, updateFacilitator);
  router.delete("/facilitators/:id", isCourseAdmin, deleteFacilitator);
  router.post(
    "/facilitators/:facilitatorId/courses/:courseId",
    isCourseAdmin,
    assignFacilitatorToCourse
  );
};
