import express from "express";
import { createNotice, getNotices } from "../controllers/noticeController.js";
import isAuthenticated from "../middlewares/Authenticated.js";

const router = express.Router();

router.post("/createNotice",isAuthenticated , createNotice);
router.get("/getNotices", isAuthenticated , getNotices);

export default router;
