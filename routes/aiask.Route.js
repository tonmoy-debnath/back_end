import express from "express";
import isAuthenticated from "../middlewares/Authenticated.js";
import { handleAsk ,rateAnswer } from "../controllers/aiaskController.js";
import  {checkSubscription}  from "../middlewares/subscription.js"

const router = express.Router();

router.post("/ask",isAuthenticated, checkSubscription, handleAsk);
router.post("/rate",isAuthenticated, checkSubscription , rateAnswer);

export default router;
