import express from 'express';
import isAuthenticated from "../middlewares/Authenticated.js";
import  isAdmin from "../middlewares/isAdmin.js";
import { getRandomQuestions, submitAnswers , createQuestion } from '../controllers/mcq.exam.controller.js';

const router = express.Router();
router.post('/submit',isAuthenticated, submitAnswers);
router.get('/questions',isAuthenticated, getRandomQuestions);
router.post('/addquestions',isAuthenticated, isAdmin , createQuestion);

export default router;









