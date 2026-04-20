import express from "express";
import {
  getUserResults,
  getSingleResult
} from "../controllers/result.controller.js";

import isAuthenticated from "../middlewares/Authenticated.js";

const router = express.Router();

router.get("/all", isAuthenticated, getUserResults);
router.get("/:type/:id", isAuthenticated, getSingleResult);

export default router;