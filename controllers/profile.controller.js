import User from "../model/Users.model.js";
import aiallasked from "../model/Allaiasked.model.js";
import Subscription from "../model/subscription.model.js";

import Answer from '../model/AIAnswer.js';

import TSubscription from "../model/Tsubscription.model.js";

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password");
    // console.log("User ID:", req.id); // Debugging line to check the user ID
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
};

// export const getMyProfile = async (req, res) => {
//   try {
//     const users = await User.find().select("-password"); // সব ইউজার

//     const result = await Promise.all(
//       users.map(async (user) => {
//         const sub = await Subscription.findOne({ author: user._id });
//         const tsub = await TSubscription.findOne({ author: user._id });

//         return {
//           userId: user._id,
//           name: user.name,
//           email: user.email,
//           subscriptionEnd: sub ? sub.endDate : null,
//           subscriptionStatus: sub ? sub.status : "no subscription",
//           amountPaid: tsub ? tsub.amount : 0,
//           paymentStatus: tsub ? tsub.status : "no payment",
//         };
//       })
//     );

//     res.status(200).json({ success: true, data: result });
//   } catch (err) {
//     console.error("Fetch all subscriptions error:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch subscriptions" });
//   }
// };


export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { first_name, last_name, email, phone, profation, school, street, city, state , class: userClass } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Name and Address nested update
    user.name.first_name = first_name || user.name.first_name;
    user.name.last_name = last_name || user.name.last_name;

    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profation = profation || user.profation;
    user.school = school || user.school;
    user.class = userClass || user.class;
    user.address.street = street || user.address.street;
    user.address.city = city || user.address.city;
    user.address.state = state || user.address.state;

    if (req.file) {
      user.profile_picture = `/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

export const getAllAskedByUser = async (req, res) => {
  // const userId = req.params.userId; // URL থেকে userId নিচ্ছে
  try {
    const userId = req.id;
    const allAsked = await aiallasked.find({ author: userId })
      .populate("question") // প্রশ্নের পূর্ণ ডেটা আনবে
      .populate("answer")   // উত্তরের পূর্ণ ডেটা আনবে
      .sort({ createdAt: -1 }); // সর্বশেষ প্রশ্ন আগে দেখাবে

    if (!allAsked || allAsked.length === 0) {
      return res.status(404).json({ message: "এই ইউজার এখনো কিছু জিজ্ঞাসা করেনি।" });
    }

    res.json(allAsked);
  } catch (err) {
    console.error("ডেটা আনতে সমস্যা হয়েছে:", err);
    res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে।" });
  }
};



export const getUserFeedAnswers = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let answers = [];

    // User.class অনুযায়ী প্রশ্ন
    if (user.class) {
      answers = await Answer.aggregate([
        { $match: { className: user.class } },
        { $sample: { size: 300 } },
      ]);
      if (answers.length > 0) return res.status(200).json({ answers });
    }

    // ⚡️ fallback — র‍্যান্ডম প্রশ্ন দ্রুতগতিতে
    const count = await Answer.estimatedDocumentCount(); // total document সংখ্যা
    const randomSkip = Math.max(0, Math.floor(Math.random() * (count - 100)));

    answers = await Answer.find().skip(randomSkip).limit(100);

    return res.status(200).json({ answers });
  } catch (err) {
    console.error("Feed fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



async function addOrExtendSubscription(userId, days) {
  const extraTime = days * 24 * 60 * 60 * 1000; // দিনকে ms এ রূপান্তর
  let sub = await Subscription.findOne({ author: userId });

  if (sub) {
    sub.endDate = new Date(sub.endDate.getTime() + extraTime);
    await sub.save();
  } else {
    await Subscription.create({
      author: userId,
      endDate: new Date(Date.now() + extraTime),
      status: "active",
    });
  }
}

export const useReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body; // যেটা ইনপুট আসবে
    const currentUserId = req.id; // ✅ ধরে নিচ্ছি JWT থেকে পাওয়া ইউজার আইডি

    // নিজের রেফার কোড নিজেরা ব্যবহার করতে পারবে না
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    if (currentUser.referralCode === referralCode)
      return res.status(400).json({ message: "You cannot use your own referral code" });

    // একই ইউজার একবারের বেশি রেফার কোড ব্যবহার করতে পারবে না
    if (currentUser.referralingCode)
      return res.status(400).json({ message: "You have already used a referral code" });

    // রেফার কোড যার সেটা খুঁজে বের করা
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return res.status(404).json({ message: "Invalid referral code" });

    // ✅ রেফারাল তথ্য সেভ করা
    currentUser.referralingCode = referralCode;
    await currentUser.save();

    // ✅ সাবস্ক্রিপশন যোগ করা
    await addOrExtendSubscription(referrer._id, 4); // রেফারার +৪ দিন
    await addOrExtendSubscription(currentUserId, 2); // ব্যবহারকারী +২ দিন

    res.json({
      message: "Referral applied successfully! ৪ দিন রেফারারকে, ২ দিন তোমাকে যোগ হয়েছে।",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};