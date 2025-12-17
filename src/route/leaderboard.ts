import express from "express";
import {
  getCohortLeaderboard
} from "../controllers/leaderboard";
import { isLoggedIn } from "../middleware";

export default (router: express.Router) => {
  router.get("/leaderboard-ranking/:cohortId", isLoggedIn, getCohortLeaderboard);
};
