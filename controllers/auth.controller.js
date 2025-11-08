import User from "../model/Users.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Subscription from "../model/subscription.model.js";
import tsubscription from "../model/Tsubscription.model.js"; 

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Now from .env

async function generateUniqueReferralCode() {
  let code;
  let exists = true;

  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase(); // যেমন: "A1B2C3"
    const existingUser = await User.findOne({ referralCode: code });
    if (!existingUser) exists = false;
  }

  return code;
}



export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    if (!first_name || !last_name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "All required fields must be provided." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ success: false, message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ ইউনিক রেফার কোড তৈরি
    const referralCode = await generateUniqueReferralCode();

    const newUser = new User({
      name: { first_name, last_name },
      email,
      password: hashedPassword,
      phone,
      referralCode,
    });

    await newUser.save();

    // ✅ ৭ দিনের subscription তৈরি
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    await Subscription.create({
      author: newUser._id,
      endDate,
      status: "active",
    });

    // ✅ ১০ টাকার tsubscription যুক্ত করা
    await tsubscription.create({
      author: newUser._id,
      amount: 10,
      status: "active",
    });

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .header("Authorization", `Bearer ${token}`)
      .status(201)
      .json({
        success: true,
        message: "User registered successfully with 7-day subscription & 10 taka balance",
        user: newUser,
        token,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid password or email." });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .header("Authorization", `Bearer ${token}`)
      .status(200)
      .json({ success: true, message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed." });
  }
};

export const sessionCheck = (req, res) => {
  // ১) কুকি থেকে token নাও
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    // ২) verify করে দেখো JWT সঠিক কিনা
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // (optional) এখানে decoded এর মধ্যে ইউজার আইডি, ইমেইল ইত্যাদি থাকবে
    return res.status(200).json({
      loggedIn: true,
      user: {
        id: decoded.id,
        email: decoded.email,
      },
    });
  } catch (err) {
    // টোকেন মেয়াদ উত্তীর্ণ বা ফেক হলে
    return res.status(401).json({ loggedIn: false });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ success: true, message: "Logged out successfully" });
};



export const changepassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.id;

    // ১. ইউজার খুঁজে আনা
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "ইউজার খুঁজে পাওয়া যায়নি" });
    }

    // ২. পুরনো পাসওয়ার্ড যাচাই
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "পুরনো পাসওয়ার্ড ভুল" });
    }

    // ৩. নতুন পাসওয়ার্ড hash করে সেভ করা
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে" });
  } catch (err) {
    console.error("Error while changing password:", err);
    res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে" });
  }
};





