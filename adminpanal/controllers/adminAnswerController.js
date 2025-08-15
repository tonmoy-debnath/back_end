import Answer from "../../model/AIAnswer.js";


// Group by class & subject
export const getStatsByClassSubject = async (req, res) => {
  try {
    const result = await Answer.aggregate([
      {
        $group: {
          _id: { className: "$className", subject: "$subject" },
          total: { $sum: 1 },
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all answers by subject
export const getAnswersBySubject = async (req, res) => {
  const { subject } = req.params;
  try {
    const answers = await Answer.find({ subject });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Group by date
export const getStatsByDate = async (req, res) => {
  try {
    const result = await Answer.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            className: "$className",
            subject: "$subject",
          },
          total: { $sum: 1 },
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get answers by date
export const getAnswersByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const answers = await Answer.find({
      createdAt: {
        $gte: new Date(date + "T00:00:00.000Z"),
        $lte: new Date(date + "T23:59:59.999Z"),
      },
    });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete answer
export const deleteAnswer = async (req, res) => {
  const { id } = req.params;
  try {
    await Answer.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const aiansadd = async (req, res) => {
  try {
    const { question, className, subject, answer , ratings ,avgRating } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    const newAnswer = new Answer({
      question,
      className,
      subject,
      answer,
      ratings: [ratings],
      avgRating
    });

    await newAnswer.save();
    res.status(201).json({ message: "Answer saved successfully", data: newAnswer });
  } catch (error) {
    res.status(500).json({ error: "Failed to save answer" });
  }
};
