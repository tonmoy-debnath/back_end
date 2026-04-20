import CreativeQuestion from "../model/CreativeQuestion.model.js";
import SelectedQuestion from "../model/SelectedQuestion.model.js";


export const createCreativeQuestion = async (req, res) => {
  try {
    const author = req.id;
    const { class: cls, subject, chapter, stimulusText, questions, answers } = req.body;

    const newQuestion = new CreativeQuestion({
      author,
      class: cls,
      subject,
      chapter,
      stimulusText,
      stimulusImage: req.file ? req.file.key : null,
      questions: typeof questions === "string" ? JSON.parse(questions) : questions,
      answers: answers ? (typeof answers === "string" ? JSON.parse(answers) : answers) : {},
    });

    await newQuestion.save();
    res.status(201).json({ success: true, question: newQuestion });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// 📖 প্রশ্ন পড়া
export const getCreativeQuestions = async (req, res) => {
  const { class: cls, subject, chapter } = req.query;
  const filter = {};
  if (cls) filter.class = cls;
  if (subject) filter.subject = subject;
  if (chapter) filter.chapter = chapter;

  try {
    const questions = await CreativeQuestion.find(filter);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const selectQuestion = async (req, res) => {
  const { questionId } = req.body;
  const userId = req.id;
  try {
    let selection = await SelectedQuestion.findOne({ userId });

    if (!selection) {
      selection = new SelectedQuestion({
        userId,
        questionIds: [questionId],
      });
    } else if (!selection.questionIds.includes(questionId)) {
      selection.questionIds.push(questionId);
    }

    await selection.save();
    res.json({ status: "added", questionIds: selection.questionIds });
  } catch (err) {
    console.error("Error selecting question:", err.message);
    res.status(500).json({ error: err.message });
  }
};










export const deselectQuestion = async (req, res) => {
  const { questionId } = req.body;
  const userId = req.id;
  try {
    const selection = await SelectedQuestion.findOne({ userId });
    if (selection) {
      selection.questionIds = selection.questionIds.filter(
        (id) => id.toString() !== questionId
      );
      await selection.save();
    }

    res.json({ status: "removed" });
  } catch (err) {
    console.error("Error deselecting question:", err.message);
    res.status(500).json({ error: err.message });
  }
};




export const getSelectedQuestions = async (req, res) => {
  const userId = req.id;

  try {
    const selection = await SelectedQuestion.findOne({ userId });
    if (selection) {
      res.json(selection.questionIds.map((id) => id.toString()));
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error("Error fetching selection:", err.message);
    res.status(500).json({ error: err.message });
  }
};



// ✅ Final Submit (যেমন: PDF তৈরির আগেই confirm)
export const saveFinalSelection = async (req, res) => {
  const { selectedIds } = req.body;
  const userId = req.id;

  try {
    // এখানে আপনি PDF তৈরি বা অন্য কাজ করতে পারেন

    res.json({
      status: "final selection saved",
      count: selectedIds.length,
    });
  } catch (err) {
    console.error("Error in final submit:", err.message);
    res.status(500).json({ error: err.message });
  }
};

