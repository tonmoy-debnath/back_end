// routes/mcqResultRoutes.js
import express from "express";
import {
  getYesterdayMcqResults,
  getUserMcqResults,
} from "../controllers/adminmcqResultController.js";
import isAuthenticated from "../../middlewares/Authenticated.js";
import  isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/yesterdayresults",isAuthenticated , isAdmin , getYesterdayMcqResults); // গতকালের সব রিপোর্ট
router.get("/user/:userId",isAuthenticated , isAdmin , getUserMcqResults); // নির্দিষ্ট ইউজারের রিপোর্ট

export default router;
