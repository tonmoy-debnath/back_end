import express from 'express';
import isAuthenticated from "../middlewares/Authenticated.js";
import  {checkSubscription}  from "../middlewares/subscription.js"
import  isAdmin from "../middlewares/isAdmin.js";
import { getRandomQuestions, submitAnswers , createQuestion } from '../controllers/mcq.exam.controller.js';

const router = express.Router();
router.post('/submit',isAuthenticated, checkSubscription , submitAnswers);
router.get('/questions',isAuthenticated,checkSubscription, getRandomQuestions);
router.post('/addquestions',isAuthenticated, isAdmin , createQuestion);

export default router;









