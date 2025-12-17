import express from "express";
import {
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetable,
  getTimetables,
} from "../controllers/timetable";
import { isCourseAdmin, isLoggedIn } from "../middleware";

export default (router: express.Router) => {
  router.post("/timetable", isCourseAdmin, createTimetable);
  router.get("/timetables", isLoggedIn, getTimetables);
  router.get("/timetables/:timetableId", isLoggedIn, getTimetable);
  router.patch("/timetables/:timetableId", isCourseAdmin, updateTimetable);
  router.delete("/timetables/:timetableId", isCourseAdmin, deleteTimetable);
};
