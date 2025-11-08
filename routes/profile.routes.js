import express from "express";
import isAuthenticated from "../middlewares/Authenticated.js";
import upload  from "../middlewares/upload.js";
import { getMyProfile , updateProfile ,getAllAskedByUser , getUserFeedAnswers ,useReferralCode } from "../controllers/profile.controller.js";
import  {checkSubscription}  from "../middlewares/subscription.js"

const router = express.Router();

// ✅ GET /api/user/me → Get own profile
router.get("/me", isAuthenticated, getMyProfile);

// ✅ PUT /api/user/update → Update own profile
// router.put("/update", isAuthenticated, upload.singleWithPathFix("profile_picture"), updateProfile);

router.put("/update", isAuthenticated, upload.single("profile_picture"), updateProfile);


router.get("/allasked",isAuthenticated, getAllAskedByUser);

router.get("/feed", isAuthenticated,  getUserFeedAnswers);

router.post("/usereferral",isAuthenticated , useReferralCode);

export default router;
