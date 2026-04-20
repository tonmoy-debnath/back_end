// import express from "express";
// import isAuthenticated from "../middlewares/Authenticated.js";
// import { primarijobQuestions ,jobsubmitAnswers } from "../controllers/jobController.js";
// import  {checkSubscription}  from "../middlewares/subscription.js"

// const router = express.Router();
// router.post('/jobresult',isAuthenticated, checkSubscription , jobsubmitAnswers);
// router.get('/jobexam',isAuthenticated,checkSubscription, primarijobQuestions);


// export default router;




import express from "express";
import isAuthenticated from "../middlewares/Authenticated.js";
import { primarijobQuestions, jobsubmitAnswers } from "../controllers/jobController.js";
import { checkSubscription } from "../middlewares/subscription.js";

const router = express.Router();

// ✅ GET (important change)
router.get("/jobexam", isAuthenticated, checkSubscription, primarijobQuestions);

// ✅ correct submit route
router.post("/jobresult", isAuthenticated, checkSubscription, jobsubmitAnswers);

export default router;