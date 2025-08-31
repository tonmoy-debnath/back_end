import express from "express";
import { getUnusedQuestions, saveQuestion, deleteUnused } from "../controllers/adminai.comtrollar.js";

const router = express.Router();

router.get("/unused", getUnusedQuestions);       // সব unused প্রশ্ন
router.post("/unused/save/:id", saveQuestion);   // সেভ → Answer
router.delete("/unused/:id", deleteUnused);      // Unused থেকে delete

export default router; 
