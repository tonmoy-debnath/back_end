import express from "express";
import isAuthenticated from "../middlewares/Authenticated.js";
import subscriptionrequest from "../model/subscription.request.model.js";
import tsubscriptionrequest from "../model/Tsubscription.request.model.js";
import subscription from "../model/subscription.model.js";
import tsubscription from "../model/Tsubscription.model.js";
import  isAdmin from "../middlewares/isAdmin.js";


import { getUserSubscriptionRequest, approveSubscription, rejectSubscription, gettUserSubscriptionRequest, tapproveSubscription, trejectSubscription } from "../controllers/subscriptionRequestController.js";


const router = express.Router();






// User Route
router.post("/subscription-request", isAuthenticated, getUserSubscriptionRequest);

router.get("/subscription-requests", isAuthenticated,isAdmin , async (req, res) => {
  const requests = await subscriptionrequest.find().populate("author", "name email").sort({ createdAt: -1 });
  res.json(requests);
});

// 🟢 Approve Request
router.post("/subscription-requests/approve/:id",isAuthenticated,isAdmin, approveSubscription);



// 🔴 Reject Request
router.delete("/subscription-requests/reject/:id", isAuthenticated,isAdmin, rejectSubscription);



router.get("/check-subscription", isAuthenticated, async (req, res) => {
  try {
    const subscription = await subscription.findOne({
      author: req.user.id,
      status: "active",
    }).sort({ endDate: -1 });

    const now = new Date();
    const isSubscribed = subscription && subscription.endDate > now;

    res.json({ isSubscribed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/tsubscription-request", isAuthenticated, gettUserSubscriptionRequest);

router.get("/tsubscription-requests", isAuthenticated,isAdmin, async (req, res) => {
  const requests = await tsubscriptionrequest.find().populate("author", "name email").sort({ createdAt: -1 });
  res.json(requests);
});

// 🟢 Approve Request
router.post("/tsubscription-requests/approve/:id",isAuthenticated ,isAdmin, tapproveSubscription);



// 🔴 Reject Request
router.delete("/tsubscription-requests/reject/:id", isAuthenticated,isAdmin, trejectSubscription);



router.get("/tcheck-subscription", isAuthenticated, async (req, res) => {
  try {
    const subscription = await subscription.findOne({
      author: req.user.id,
      status: "active",
    }).sort({ endDate: -1 });

    const now = new Date();
    const isSubscribed = subscription && subscription.endDate > now;

    res.json({ isSubscribed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// router.get("/subscription-status", isAuthenticated, async (req, res) => {
//   try {
//     const userId = req.id;

//     // ১. টাকা অবশিষ্ট
//     const tSub = await tsubscriptionrequest.findOne({ author: userId });
//     const remainingAmount = tSub ? tSub.amount : 0;

//     // ২. দিন অবশিষ্ট
//     const sub = await subscriptionrequest.findOne({ author: userId });
//     let remainingDays = 0;
//     if (sub && sub.endDate) {
//       const now = new Date();
//       const diffMs = sub.endDate.getTime() - now.getTime();
//       remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
//       if (remainingDays < 0) remainingDays = 0;
//     }

//     return res.json({
//       remainingAmount,
//       remainingDays,
//       status: sub?.status || "No active subscription",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


router.get("/subscription-status", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?._id || req.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tSub = await tsubscription.findOne({ author: userId });
    const remainingAmount = tSub ? tSub.amount : 0;

    const sub = await subscription.findOne({ author: userId });
    let remainingDays = 0;
    if (sub?.endDate) {
      const diffMs = new Date(sub.endDate) - new Date();
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    res.json({
      remainingAmount,
      remainingDays,
      status: sub?.status || "No active subscription",
    });
  } catch (err) {
    console.error("Subscription status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
