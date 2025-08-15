import express from "express";
import User from "../../model/Users.model.js";
import Admin from "../../model/Admin.model.js";
import bcrypt from "bcryptjs";
import { isSuperAdmin  } from "../../middlewares/isSuperAdmin.js";


const router = express.Router();

// ✅ Make Admin
router.post("/make-admin", isSuperAdmin, async (req, res) => {
  const { targetEmail } = req.body;

  try {
    const user = await User.findOne({ email: targetEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyAdmin = await Admin.findOne({ user: user._id });
    if (alreadyAdmin) return res.status(400).json({ message: "User already an admin" });

    const newAdmin = new Admin({ user: user._id });
    await newAdmin.save();
    res.status(201).json({ message: "User is now an admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Remove Admin
router.post("/remove-admin", isSuperAdmin, async (req, res) => {
  const { targetEmail } = req.body;

  try {
    const user = await User.findOne({ email: targetEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const removed = await Admin.findOneAndDelete({ user: user._id });
    if (!removed) return res.status(404).json({ message: "User is not an admin" });

    res.status(200).json({ message: "User removed from admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin-list",  async (req, res) => {
  try {
    const admins = await Admin.find().populate("user", "email name");
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;




