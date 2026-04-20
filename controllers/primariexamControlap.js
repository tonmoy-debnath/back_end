


export const getRandomQuestions = async (req, res) => {
  try {
    const TOTAL = 75;
    const MIN = 18;
    const MAX = 25;

    const sections = [
      { key: "বাংলা", subject: "বাংলা" },
      { key: "গণিত", subject: "গণিত" },
      { key: "ইংরেজি", subject: "ইংরেজি" },
      { key: "সাধারণ জ্ঞান", subject: "সাধারণ জ্ঞান" },
    ];

    // ১) প্রথমে প্রত্যেকটাকে ১৮ করে
    const counts = {
      "বাংলা": 18,
      "গণিত": 18,
      "ইংরেজি": 18,
      "সাধারণ জ্ঞান": 18,
    };

    // ২) বাকি প্রশ্ন (75 - 72 = 3)
    let remaining = TOTAL - MIN * sections.length;

    while (remaining > 0) {
      const sec = sections[Math.floor(Math.random() * sections.length)].key;
      if (counts[sec] < MAX) {
        counts[sec]++;
        remaining--;
      }
    }

    // ৩) প্রশ্ন তোলা + section title যুক্ত করা
    const finalQuestions = [];

    for (const sec of sections) {
      const qs = await McqQushean.aggregate([
        { $match: { subject: sec.subject } },
        { $sample: { size: counts[sec.key] } },
      ]);

      finalQuestions.push({
        sectionTitle: sec.key, // 🔥 হেডিং
        questions: qs,
      });
    }

    return res.json({
      total: 75,
      sections: finalQuestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "প্রশ্ন লোড করতে সমস্যা হয়েছে" });
  }
};



export const submitAnswers = async (req, res) => {
  try {
    const { studentName, answers, subject, className } = req.body;
    const userId = req.id;

    if (!studentName || !answers || answers.length !== 75) {
      return res.status(400).json({
        message: "পরীক্ষায় অবশ্যই ৭৫টি প্রশ্নের উত্তর দিতে হবে",
      });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await McqQushean.find({ _id: { $in: questionIds } });

    const qMap = {};
    questions.forEach(q => (qMap[q._id] = q));

    let score = 0;
    const correctAnswers = [];

    answers.forEach(ans => {
      const q = qMap[ans.questionId];
      const correct = q?.correctIndex ?? null;
      if (ans.answer === correct) score++;
      correctAnswers.push(correct);
    });

    await McqResult.create({
      author: userId,
      studentName,
      subject,
      class: className,
      answers,
      correctAnswers,
      score,
      total: 75,
    });

    res.json({
      score,
      total: 75,
      correctAnswers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "রেজাল্ট সাবমিট করা যায়নি" });
  }
};
