import express from "express";
import isAuthenticated from "../middlewares/Authenticated.js";
import { handleAsk ,rateAnswer } from "../controllers/aiaskController.js";

const router = express.Router();

router.post("/ask",isAuthenticated, handleAsk);
router.post("/rate",isAuthenticated, rateAnswer);

export default router;
