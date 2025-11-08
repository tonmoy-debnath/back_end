import SubscriptionRequest from "../model/subscription.request.model.js"
import tSubscriptionRequest from "../model/Tsubscription.request.model.js"
import tSubscription from "../model/Tsubscription.model.js";
import Subscription from "../model/subscription.model.js";

// 🟢 Admin: Get all subscription requests


// 🟢 User: Get their own subscription request
export const getUserSubscriptionRequest = async (req, res) => {
  try {
    const { type, PaymentMethod, trxid, amount, endDate } = req.body;
    const author = req.id;

    // prevent duplicate pending request
    const existing = await SubscriptionRequest.findOne({ author });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending request" });
    }

    const request = new SubscriptionRequest({
      author,
      type,
      PaymentMethod,
      trxid,
      amount,
      endDate,
      status: "pending",
    });

    await request.save();

    res.status(201).json({ message: "Subscription request submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const gettUserSubscriptionRequest = async (req, res) => {
  try {
    const { PaymentMethod, trxid, amount } = req.body;
    const author = req.id;

    // prevent duplicate pending request
    const existing = await tSubscriptionRequest.findOne({ author });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending request" });
    }

    const request = new tSubscriptionRequest({
      author,
      PaymentMethod,
      trxid,
      amount,
      status: "pending",
    });

    await request.save();

    res.status(201).json({ message: "Subscription request submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};





export const approveSubscription = async (req, res) => {
  try {
    const { duration } = req.body;
    const requestId = req.params.id;

    const request = await SubscriptionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const authorId = request.author;
    if (!authorId) {
      return res.status(400).json({ message: "Invalid request: author ID missing" });
    }

    // Duration অনুযায়ী দিন নির্ধারণ
    const durations = { "1month": 30, "3month": 90, "6month": 180, "1year": 365 };
    const daysToAdd = durations[duration];
    if (!daysToAdd) return res.status(400).json({ message: "Invalid duration" });

    // আগের Subscription চেক করা
    const existingSub = await Subscription.findOne({ author: authorId });

    let newEndDate = new Date();
    if (existingSub && existingSub.endDate > new Date()) {
      newEndDate = new Date(existingSub.endDate);
    }
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    // Subscription create বা update
    await Subscription.findOneAndUpdate(
      { author: authorId },
      { endDate: newEndDate, status: "active" },
      { upsert: true, new: true }
    );

    // Request মুছে ফেলা
    await SubscriptionRequest.findByIdAndDelete(requestId);

    res.json({ message: "Subscription approved successfully", endDate: newEndDate });
  } catch (err) {
    console.error("Subscription approval error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const tapproveSubscription = async (req, res) => {
  try {
    const { amount } = req.body;
    const requestId = req.params.id;


    const request = await tSubscriptionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const authorId = request.author;
    if (!authorId) {
      return res.status(400).json({ message: "Invalid request: author ID missing" });
    }

    // আগের Subscription চেক করা
    const existingSub = await tSubscription.findOne({ author: authorId });

    let totalAmount = Number(amount);
    if (existingSub && existingSub.amount) {
      totalAmount += Number(existingSub.amount); // 💰 আগের টাকার সাথে যোগ
    }

    // Subscription create বা update (শুধু টাকা ও স্ট্যাটাস রাখবে)
    await tSubscription.findOneAndUpdate(
      { author: authorId },
      {
        amount: totalAmount, // ✅ যোগফল টাকা সংরক্ষণ
        status: "active"
      },
      { upsert: true, new: true }
    );

    // Request মুছে ফেলা
    await tSubscriptionRequest.findByIdAndDelete(requestId);

    res.json({ message: "Subscription approved successfully", totalAmount });
  } catch (err) {
    console.error("Subscription approval error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};







// 🔴 Reject Subscription Request
export const rejectSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SubscriptionRequest.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Subscription request rejected and deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const trejectSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await tSubscriptionRequest.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Subscription request rejected and deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};








