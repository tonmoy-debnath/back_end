
import express from "express";
import isAuthenticated from "../middlewares/Authenticated.js";
import { versitytest , versitytestAnswers  } from "../controllers/versitytest.controlar.js";
import { checkSubscription } from "../middlewares/subscription.js";

const router = express.Router();

// ✅ GET (important change)
router.get("/versitytest", isAuthenticated, checkSubscription, versitytest);

// ✅ correct submit route
router.post("/versitytestAnswers", isAuthenticated, checkSubscription, versitytestAnswers);

export default router;