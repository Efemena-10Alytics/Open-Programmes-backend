import express from "express";
import { createUser, createBulkUsers, communityLinkChange } from "../controllers/admin";
import { isCourseAdmin} from "../middleware";

export default (router: express.Router) => {
  router.post("/admin/users", isCourseAdmin, createUser);
  router.post("/admin/users/bulk", isCourseAdmin, createBulkUsers);
  router.put("/admin/community-link", isCourseAdmin, communityLinkChange);
};
