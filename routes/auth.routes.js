import express from "express";
import { login, register, logout ,sessionCheck , changepassword } from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/Authenticated.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/session-check", sessionCheck);
router.post("/changepassword", isAuthenticated , changepassword);

export default router;
