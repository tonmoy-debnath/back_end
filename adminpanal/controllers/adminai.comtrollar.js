import Aiunused from "../../model/Aiunused.model.js";
import Answer from "../../model/AIAnswer.js";

// সব unused প্রশ্ন তারিখ অনুসারে আনো
export const getUnusedQuestions = async (req, res) => {
  try {
    const questions = await Aiunused.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unused questions" });
  }
};

// Unused → Answer এ সেভ করো
export const saveQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const questionDoc = await Aiunused.findById(id);
    if (!questionDoc) return res.status(404).json({ error: "Question not found" });

    const newAnswer = new Answer(questionDoc.toObject());
    await newAnswer.save();

    await Aiunused.findByIdAndDelete(id);

    res.json({ message: "Question saved successfully", newAnswer });
  } catch (err) {
    res.status(500).json({ error: "Failed to save question" });
  }
};

// Unused থেকে Delete
export const deleteUnused = async (req, res) => {
  try {
    const { id } = req.params;
    await Aiunused.findByIdAndDelete(id);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
};
