import express from "express";
import { generatePDF } from "../controllers/createQuestion.controller.js";
import isAuthenticated from "../middlewares/Authenticated.js";

const router = express.Router();

router.post("/createpdf", isAuthenticated,  generatePDF);

export default router;
