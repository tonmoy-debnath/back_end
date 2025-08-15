// middleware/isAdmin.js
import Admin from "../model/Admin.model.js";

const isAdmin = async (req, res, next) => {
  const userId = req.id; // JWT বা session থেকে set করা user ID

  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID missing in request." });
  }

  try {
    // Admin collection-এ user ID আছে কিনা চেক
    const exists = await Admin.exists({ user: userId });
    if (!exists) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not an admin." });
    }

    // থাকলে পরবর্তী middleware বা controller এ যাও
    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default isAdmin;
