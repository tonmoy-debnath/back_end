import express from "express";
import { getSummary, getDateSummary, getByChapter, getByDate ,searchMcqs, updateMcq, deleteMcq } from "../controllers/adminmcqController.js";
import isAuthenticated from "../../middlewares/Authenticated.js";
import  isAdmin from "../../middlewares/isAdmin.js";
const router = express.Router();

router.get("/summary",isAuthenticated , isAdmin , getSummary);
router.get("/dates",isAuthenticated , isAdmin , getDateSummary);
router.get("/chapter/:chapter",isAuthenticated , isAdmin , getByChapter);
router.get("/date/:date",isAuthenticated , isAdmin , getByDate);
router.get("/search",isAuthenticated , isAdmin , searchMcqs);
router.put("/update/:id",isAuthenticated , isAdmin , updateMcq);
router.delete("/delete/:id",isAuthenticated , isAdmin , deleteMcq);

export default router;