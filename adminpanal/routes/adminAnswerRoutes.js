import express from "express";
import {
  getStatsByClassSubject,
  getAnswersBySubject,
  getStatsByDate,
  getAnswersByDate,
  deleteAnswer,
  aiansadd
} from "../controllers/adminAnswerController.js";
import isAuthenticated from "../../middlewares/Authenticated.js";
import  isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/stats/class-subject",isAuthenticated , isAdmin , getStatsByClassSubject);
router.get("/answers/subject/:subject",isAuthenticated , isAdmin , getAnswersBySubject);
router.get("/stats/by-date",isAuthenticated , isAdmin , getStatsByDate);
router.get("/answers/by-date/:date",isAuthenticated , isAdmin , getAnswersByDate);
router.post("/aiansadd",isAuthenticated , isAdmin , aiansadd);
router.delete("/answer/:id",isAuthenticated , isAdmin , deleteAnswer);

export default router;
