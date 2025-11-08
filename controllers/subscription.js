import User from "../model/Users.model.js";
import subscriptionModel from "../model/subscription.model.js";


export const Subscriptionchak = async (req, res) => {
  try {
    const { userId } = req.query; // ফ্রন্টএন্ড থেকে userId পাঠানো হবে
    if (!userId) return res.json({ active: false });

    const sub = await subscriptionModel.findOne({ author: userId });

    if (!sub) return res.json({ active: false });

    const now = new Date();
    const active = new Date(sub.endDate) > now;

    res.json({ active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ active: false });
  }
};