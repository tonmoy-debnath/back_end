import VersityResult from "../model/Versity.test.model.js";
import JobResult from "../model/Jobexamresult.model.js";
import McqResult from "../model/McqResult.model.js";

/* =========================
   ✅ ALL RESULTS (3 TYPES)
========================= */
export const getUserResults = async (req, res) => {
  try {
    const userId = req.id;

    const [versity, job, mcq] = await Promise.all([
      VersityResult.find({ author: userId }).sort({ createdAt: -1 }),
      JobResult.find({ author: userId }).sort({ createdAt: -1 }),
      McqResult.find({ author: userId }).sort({ createdAt: -1 }),
    ]);

    res.json({ versity, job, mcq });

  } catch (err) {
    res.status(500).json({ message: "Failed to load results" });
  }
};

/* =========================
   ✅ SINGLE RESULT DETAILS
========================= */
export const getSingleResult = async (req, res) => {
  try {
    const { id, type } = req.params;

    let Model;

    if (type === "versity") Model = VersityResult;
    else if (type === "job") Model = JobResult;
    else if (type === "mcq") Model = McqResult;

    if (!Model) {
      return res.status(400).json({ message: "Invalid type" });
    }

    const result = await Model.findById(id)
      .populate("answers.questionId");

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: "Error loading details" });
  }
};