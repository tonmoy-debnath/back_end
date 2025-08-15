import User from "../model/Users.model.js";
import aiallasked from "../model/Allaiasked.model.js";
import Answer from '../model/AIAnswer.js';

// ✅ ইউজারের প্রোফাইল দেখা
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
};

// ✅ ইউজারের প্রোফাইল আপডেট
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { first_name, last_name, email, phone, profation, school, street, city, state, class: userClass } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

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
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};

// ✅ ইউজারের সব জিজ্ঞাসা দেখানো
export const getAllAskedByUser = async (req, res) => {
  try {
    const userId = req.id;
    const allAsked = await aiallasked.find({ author: userId })
      .populate("question")
      .populate("answer")
      .sort({ createdAt: -1 });

    if (!allAsked || allAsked.length === 0) {
      return res.status(404).json({ message: "এই ইউজার এখনো কিছু জিজ্ঞাসা করেনি।" });
    }

    res.json(allAsked);
  } catch {
    res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে।" });
  }
};

// ✅ ইউজারের ফিডে প্রশ্ন/উত্তর দেখানো
export const getUserFeedAnswers = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let answers = [];

    if (user.class) {
      answers = await Answer.aggregate([
        { $match: { className: user.class } },
        { $sample: { size: 100 } },
      ]);
      if (answers.length > 0) return res.status(200).json({ answers });
    }

    // fallback: র‍্যান্ডম প্রশ্ন
    const count = await Answer.estimatedDocumentCount();
    const randomSkip = Math.max(0, Math.floor(Math.random() * (count - 100)));
    answers = await Answer.find().skip(randomSkip).limit(100);

    res.status(200).json({ answers });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
