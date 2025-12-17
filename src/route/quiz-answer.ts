import express from "express";
import { isAdmin, isAuthorized, isCourseAdmin, isLoggedIn } from "../middleware";
import { submitAnswer } from "../controllers/quiz-answer";

export default (router: express.Router) => {
  router.post("/quiz/submit-answer", isLoggedIn, submitAnswer);
  router.delete(
    "/quiz/:quizId/quiz-answer/:quizAnswerId",
    isCourseAdmin,
    submitAnswer
  );
};
