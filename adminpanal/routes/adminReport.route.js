import express from "express";
import {
  getallreport,
  getonereport
} from "../controllers/adminReport.Controller.js";
import isAuthenticated from "../../middlewares/Authenticated.js";
import  isAdmin from "../../middlewares/isAdmin.js";


const router = express.Router();

router.get("/allreport",isAuthenticated , isAdmin , getallreport )
router.get("/onereport/:id",isAuthenticated , isAdmin , getonereport)




export default router;