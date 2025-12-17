import express from "express";
import {
  createQuiz,
  deleteQuiz,
  getQuiz,
  getQuizzes,
  getQuizzesByWeek,
  updateQuiz,
  submitQuizAnswer,
  getUserQuizAnswers,
} from "../controllers/quiz";
import { isCourseAdmin, isLoggedIn } from "../middleware";

export default (router: express.Router) => {
  // Quiz CRUD operations
  router.post("/quiz", isLoggedIn, isCourseAdmin, createQuiz);
  router.patch("/quiz/:quizId", isLoggedIn, isCourseAdmin, updateQuiz);
  router.delete("/quiz/:quizId", isLoggedIn, isCourseAdmin, deleteQuiz);
  // Quiz access
  router.get("/quiz/:quizId", isLoggedIn, getQuiz);
  router.get("/quiz", isLoggedIn, getQuizzes);
  router.get("/quiz/week/:weekId", isLoggedIn, getQuizzesByWeek);

  // Quiz submission
  router.post("/quiz/submit", isLoggedIn, submitQuizAnswer);
  router.get("/quiz/answers/user", isLoggedIn, getUserQuizAnswers);
};
