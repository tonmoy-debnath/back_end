import McqQushean from "../model/McqQuestion.model.js";
import McqResult from '../model/McqResult.model.js';

// 🎲 র‍্যান্ডম প্রশ্ন নেওয়া
export const getRandomQuestions = async (req, res) => {
  try {
    const count   = Math.min(parseInt(req.query.count) || 30, 100);
    const cls     = req.query.class?.trim();
    const subject = req.query.subject?.trim();

    let chapters = req.query.chapter;
    if (typeof chapters === "string") {
      chapters = chapters.split(",").map(c => c.trim()).filter(Boolean);
    } else if (Array.isArray(chapters)) {
      chapters = chapters.map(c => c.trim()).filter(Boolean);
    } else {
      chapters = undefined;
    }

    const match = {};
    if (cls) match.class_name = cls;
    if (subject) match.subject = subject;
    if (chapters?.length) match.chapter = { $in: chapters };

    const questions = await McqQushean.aggregate([
      { $match: match },
      { $sample: { size: count } },
    ]);

    res.json(questions);
  } catch {
    res.status(500).json({ success: false, message: "কিছু ভুল হয়েছে" });
  }
};

// ➕ নতুন প্রশ্ন তৈরি
export const createQuestion = async (req, res) => {
  try {
    const { queston, options, correctIndex, class_name, subject, chapter } = req.body;

    if (!queston || !Array.isArray(options) || options.length < 4 || correctIndex === undefined || !subject || !chapter) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingQuestion = await McqQushean.findOne({
      queston: queston.trim(),
      options,
      class_name: class_name || "",
      subject,
      chapter
    });

    if (existingQuestion) {
      return res.status(200).json({ 
        alert: true, 
        message: "এই প্রশ্নটি ইতিমধ্যে যুক্ত করা হয়েছে।", 
        question: existingQuestion 
      });
    }

    const newQ = new McqQushean({
      queston: queston.trim(),
      options,
      correctIndex,
      class_name: class_name || "",
      subject,
      chapter
    });

    await newQ.save();
    res.status(201).json({ message: "প্রশ্ন সফলভাবে যুক্ত হয়েছে।", question: newQ });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ উত্তর জমা দেওয়া
export const submitAnswers = async (req, res) => {
  try {
    const { studentName, answers, subject, className } = req.body;
    const userId = req.id;

    if (!subject || !className) {
      return res.status(400).json({ message: "subject এবং class প্রয়োজনীয়" });
    }

    const questionIds = answers.map(ans => ans.questionId);
    const questions = await McqQushean.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    let score = 0;
    const correctAnswers = [];

    answers.forEach(ans => {
      const q = questionMap[ans.questionId];
      const correctIndex = q ? q.correctIndex : null;
      const isCorrect = q && ans.answer === correctIndex;
      if (isCorrect) score++;
      correctAnswers.push(correctIndex);
    });

    await McqResult.create({
      author: userId,
      studentName,
      subject,
      class: className,
      answers,
      correctAnswers,
      score,
    });

    res.json({ score, correctAnswers });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
