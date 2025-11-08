import Subscription from "../model/subscription.model.js";

export const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.id; // req.user.id ধরছি JWT auth থেকে আসছে

    const subscription = await Subscription.findOne({ 
      author: userId, 
      status: "active" // status "pending" হলে access denied
    }).sort({ endDate: -1 });

    const now = new Date();

    if (!subscription || subscription.endDate < now) {
      return res.status(403).json({
        message: "You need an active subscription to access this page."
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
