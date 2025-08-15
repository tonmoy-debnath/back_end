import User from "../model/Users.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    if (!first_name || !last_name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "All required fields must be provided." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: { first_name, last_name },
      email,
      password: hashedPassword,
      phone
    });

    await newUser.save();

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
      .json({ success: true, user: newUser, token });
  } catch {
    res.status(500).json({ success: false, message: "Registration failed." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid credentials." });

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
      .json({ success: true, user, token });
  } catch {
    res.status(500).json({ success: false, message: "Login failed." });
  }
};

export const sessionCheck = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ loggedIn: true, user: { id: decoded.id } });
  } catch {
    return res.status(401).json({ loggedIn: false });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ success: true });
};

export const changepassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch {
    res.status(500).json({ message: "Server error." });
  }
};
