import express from "express";
import { isAdmin, isCourseAdmin, isLoggedIn } from "../middleware";
import {
  createChangeRequest,
  getUserChangeRequests,
  getAllChangeRequests,
  getChangeRequestsCount,
  updateChangeRequest,
  handlePaymentVerification
} from "../controllers/changeRequest";

export default (router: express.Router) => {
  router.post("/change-request", isLoggedIn, createChangeRequest);
  router.get("/change-requests", isLoggedIn, getUserChangeRequests);
  router.get("/admin/change-requests", isAdmin, getAllChangeRequests);
  router.get("/admin/change-requests/count", isAdmin, getChangeRequestsCount);
  router.patch("/admin/change-requests/:requestId", isAdmin, updateChangeRequest);
  router.post("/change-request/verify-payment", isLoggedIn, handlePaymentVerification);
};