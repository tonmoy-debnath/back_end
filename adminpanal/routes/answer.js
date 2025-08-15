import express from 'express';
import Answer from '../../model/AIAnswer.js';
import {
  getStats,

} from '../controllers/answer.js';
import isAuthenticated from "../../middlewares/Authenticated.js";
import  isAdmin from "../../middlewares/isAdmin.js";


const router = express.Router();

// Stats for given period (day/week/month/year)
router.get('/stats/:period', isAuthenticated , isAdmin , getStats);
// আজকের প্রশ্ন লিস্ট
router.get('/today', isAuthenticated , isAdmin , async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const answers = await Answer.find({
    createdAt: { $gte: today }
  }).sort({ createdAt: -1 });

  res.json(answers);
});

// প্রশ্ন ডিলিট
router.delete('/today/:id', isAuthenticated , isAdmin , async (req, res) => {
  await Answer.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

export default router;