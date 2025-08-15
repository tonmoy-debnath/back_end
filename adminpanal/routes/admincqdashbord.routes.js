// routes/admin.js
import express from "express";
import { getDailyStats, getGroupedStats , cqsearch , cqdelete } from "../controllers/admincqdashbord.Controller.js";
import isAuthenticated from "../../middlewares/Authenticated.js";
import  isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/creative/daily",isAuthenticated , isAdmin , getDailyStats);
router.get("/creative/grouped",isAuthenticated , isAdmin , getGroupedStats);
router.get("/creative/search",isAuthenticated , isAdmin , cqsearch);
router.delete("/creative/:id",isAuthenticated , isAdmin , cqdelete);

export default router;
