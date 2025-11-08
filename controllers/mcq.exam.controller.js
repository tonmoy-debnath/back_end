import McqQushean from "../model/McqQuestion.model.js";
import McqResult from '../model/McqResult.model.js';




export const getRandomQuestions = async (req, res) => {
  try {
    /* -------- ১) পাই‑প্যারাম পাড়া ------------ */
    const count   = Math.min(parseInt(req.query.count) || 30, 100); // ✔️ হার্ড‑লিমিট
    const cls     = req.query.class?.trim();       // উদাহরণ: "৯ম"
    const subject = req.query.subject?.trim();     // উদাহরণ: "গণিত"

    /*  🟡 chapter একাধিক হলে array বানানো
        ────────────────────────────────────── */
    let chapters = req.query.chapter;
    if (typeof chapters === "string") {
      // কমা দিয়ে দিলেও, একবারেই দিলেও—দুটোকেই array বানাবো
      chapters = chapters.split(",").map(c => c.trim()).filter(Boolean);
    } else if (Array.isArray(chapters)) {
      chapters = chapters.map(c => c.trim()).filter(Boolean);
    } else {
      chapters = undefined; // query param ই ছিল না
    }

    /* -------- ২) ডায়নামিক ম্যাচ অবজেক্ট -------- */
    const match = {};
    if (cls)     match.class_name = cls;  
    if (subject) match.subject    = subject;
    if (chapters?.length) {
      // একাধিক chapter থাকলে সবসময় $in ব্যবহার
      match.chapter = { $in: chapters };
    }

    /* -------- ৩) অ্যাগ্রিগেশন পাইপলাইন -------- */
    const questions = await McqQushean.aggregate([
      { $match: match },
      { $sample: { size: count } },
    ]);

    return res.json(questions);
  } catch (err) {
    console.error("Random question fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "কিছু ভুল হয়েছে",
    });
  }
};









export const createQuestion = async (req, res) => {
  try {
    const { queston, options, correctIndex, class_name, subject, chapter } = req.body;

    // Validate fields
    if (
      !queston ||
      !Array.isArray(options) ||
      options.length < 4 ||
      correctIndex === undefined ||
      !subject ||
      !chapter
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 🔍 Check for existing question
    const existingQuestion = await McqQushean.findOne({
      queston: queston.trim(),
      options,
      class_name: class_name || "",
      subject,
      chapter
    });

    if (existingQuestion) {
      // 👉 যদি প্রশ্ন আগে থাকে, তাহলে error নয়, success সহ alert মেসেজ
      return res.status(200).json({ 
        alert: true, 
        message: "এই প্রশ্নটি ইতিমধ্যে যুক্ত করা হয়েছে।", 
        question: existingQuestion 
      });
    }

    // ✅ Create new question
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
  } catch (error) {
    console.error("❌ Question creation failed:", error.message);
    res.status(500).json({ error: error.message });
  }
};






export const submitAnswers = async (req, res) => {
  try {
    const { studentName, answers, subject, className } = req.body;
    const userId = req.id;

    // Validation check
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

    // ✅ এখন subject, class, studentName সহ সব পাঠানো হচ্ছে
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
  } catch (err) {
    console.error("Report creation error:", err);
    res.status(500).json({ success: false, message: "something is wrong" });
  }
};






