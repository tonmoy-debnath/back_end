// controllers/mcqResultController.js
import McqResult from "../../model/McqResult.model.js";
import User from "../../model/Users.model.js"; // যদি ইউজার মডেল আলাদা থাকে

// গতকাল রাত ১২টা থেকে আজ রাত ১২টা পর্যন্ত রিপোর্ট
export const getYesterdayMcqResults = async (req, res) => {
  try {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayMidnight = new Date(todayMidnight.getTime() - 24 * 60 * 60 * 1000);

    const results = await McqResult.find({
      createdAt: {
        $gte: yesterdayMidnight,
        $lt: todayMidnight,
      },
    })
      .populate("author", "email name")
      .populate("answers.questionId", "chapter") // যদি chapter থাকে প্রশ্নে
      .sort({ createdAt: -1 });

    const total = results.length;

    res.json({ total, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// নির্দিষ্ট ইউজারের সকল পরীক্ষার রিপোর্ট
export const getUserMcqResults = async (req, res) => {
  try {
    const userId = req.params.userId;

    const results = await McqResult.find({ author: userId })
      .populate("author", "email name")
      .populate("answers.questionId", "chapter")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
