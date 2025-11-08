



import User from "../model/Users.model.js";
import Report from "../model/Report.model.js";


export const createReport = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.id;

    // S3 থেকে আসা URL ব্যবহার করা
    // const imageUrl = req.file ? req.file.location : null;

    const newReport = new Report({
      title,
      reason: description,
      author: userId,
      image: req.file ? req.file.key : null, // Assuming req.file.filename is the filename stored in S3
    });

    await newReport.save();

    res.status(201).json({ success: true, message: "Report created successfully", report: newReport });
  } catch (err) {
    console.error("Report creation error:", err);
    res.status(500).json({ success: false, message: "Failed to create report" });
  }
};
