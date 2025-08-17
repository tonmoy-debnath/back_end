import User from "../model/Users.model.js";
import Report from "../model/Report.model.js";

// ✅ রিপোর্ট তৈরি করা
export const createReport = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.id;

    // ফাইল থেকে S3 URL নাও
    // const imageUrl = req.file ? req.file.location : null;

    const newReport = new Report({
      title,
      reason: description,
      author: userId,
      image: req.file ? req.file.key : null,
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      report: newReport
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to create report" });
  }
};
