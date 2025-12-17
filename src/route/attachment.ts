import express from "express";
import { isCourseAdmin } from "../middleware";
import { createAttachment, deleteAttachment } from "../controllers/attachment";

export default (router: express.Router) => {
  router.post(
    "/courses/:courseId/weeks/:weekId/attachments",
    isCourseAdmin,
    createAttachment
  );
  router.delete(
    "/courses/:courseId/weeks/:weekId/attachments/:attachmentId",
    isCourseAdmin,
    deleteAttachment
  );
};
