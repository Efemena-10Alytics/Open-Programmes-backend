import express from "express";
import {
  toggleUserAccountStatus,
  getUserAccountStatus,
} from "../controllers/account-status";
import { isCourseAdmin, isLoggedIn } from "../middleware";

export default (router: express.Router) => {
  // GET /api/account-status/:userId/status - Get user account status
  router.get(
    "/account-status/:userId/status",
    isCourseAdmin,
    getUserAccountStatus
  );

  // PATCH /api/account-status/:userId/toggle-status - Toggle user account status (suspend/activate)
  router.patch(
    "/account-status/:userId/toggle-status",
    isCourseAdmin,
    toggleUserAccountStatus
  );
};
