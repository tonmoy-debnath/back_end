// middleware/isAdmin.js
import Admin from "../model/Admin.model.js";

const isAdmin = async (req, res, next) => {
  // Multer দিয়ে handle করার পরে multipart/form-data এর সব field req.body তেই থাকবে
  const userId = req.id;
  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID missing in request body." });
  }

  try {
    // শুধু Admin collection-এ ওই userId আছে কি না চেক কর
    const exists = await Admin.exists({ user: userId });
    if (!exists) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not an admin." });
    }

    // যদি থাকে, তাহলে পরবর্তী হ্যান্ডলারে যাও
    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default isAdmin;
