import express from "express";
import isAuthenticated from "../middlewares/Authenticated.js";
import reportupload from "../middlewares/reportupload.js";
import { createReport } from "../controllers/report.controller.js";


const router = express.Router();

router.post("/create", isAuthenticated, reportupload.single("image"), createReport);

export default router;
