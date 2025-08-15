import express from "express";
import upload from "../middlewares/creativeQuestionupload.js";
import isAuthenticated from "../middlewares/Authenticated.js";
import  isAdmin from "../middlewares/isAdmin.js";
import {
  createCreativeQuestion,
  getCreativeQuestions,
  selectQuestion,
  deselectQuestion,
  getSelectedQuestions,
  saveFinalSelection,
} from "../controllers/creativeQuestion.Controller.js";

const router = express.Router();

router.post("/create", upload.single("stimulusImage"), isAuthenticated,isAdmin , createCreativeQuestion);
router.get("/getCreativeQuestions",isAuthenticated, getCreativeQuestions);
router.post("/select" , isAuthenticated, selectQuestion);
router.post("/deselect",isAuthenticated, deselectQuestion);
router.get("/all",isAuthenticated, getSelectedQuestions);
router.post("/save-final",isAuthenticated, saveFinalSelection);

export default router;
