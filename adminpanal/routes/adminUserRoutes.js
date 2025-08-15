import express from "express";
import {
  getAllUsers,
  getUserStats,
  searchUsers,
  getUserById,
  deleteUser,
  useractivity
} from "../controllers/adminUser.Controller.js";

import isAuthenticated from "../../middlewares/Authenticated.js";
import  isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();


router.get("/all",isAuthenticated , isAdmin , getAllUsers);
router.get("/stats",isAuthenticated , isAdmin , getUserStats);
router.get("/search", isAuthenticated , isAdmin , searchUsers);
router.get("/user-activity",isAuthenticated ,isAdmin , useractivity);
router.get("/:id", isAuthenticated , isAdmin , getUserById);
router.delete("/:id",isAuthenticated ,isAdmin , deleteUser);

export default router;
