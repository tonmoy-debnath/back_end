import express from 'express';
import isAuthenticated from "../middlewares/Authenticated.js";
import  {checkSubscription}  from "../middlewares/subscription.js"
import  isAdmin from "../middlewares/isAdmin.js";
import McqQushean from "../model/McqQuestion.model.js";
import { getRandomQuestions,getMcqCountBySubject,updateMcq, submitAnswers , createQuestion , getMcqCountByDate } from '../controllers/mcq.exam.controller.js';

const router = express.Router();
router.post('/submit',isAuthenticated, checkSubscription , submitAnswers);
router.get('/questions',isAuthenticated,checkSubscription, getRandomQuestions);
router.post('/addquestions',isAuthenticated, isAdmin , createQuestion);
router.get("/stats/date", isAuthenticated, isAdmin , getMcqCountByDate);
router.get("/stats/subject", isAuthenticated, isAdmin , getMcqCountBySubject);
router.get("/my", isAuthenticated, isAdmin , async (req, res) => {
  try {
    const data = await McqQushean.find({ author: req.id });
    res.json(data);
  } catch (err) {
    console.error("🔥 ERROR:", err); // 👈 এটা add করো
    res.status(500).json({ message: err.message });
  }
});
router.put("/update/:id", isAuthenticated, isAdmin , updateMcq);

export default router;









