// routes/admin.js বা controller
import CreativeQuestion from "../../model/CreativeQuestion.model.js";


export const getDailyStats = async (req, res) => {
  try {
    const stats = await CreativeQuestion.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getGroupedStats = async (req, res) => {
  try {
    const stats = await CreativeQuestion.aggregate([
      {
        $group: {
          _id: {
            class: "$class",
            subject: "$subject",
            chapter: "$chapter"
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id.class": 1, "_id.subject": 1, "_id.chapter": 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const cqsearch = async (req, res) => {
  const { class: cls, subject, chapter } = req.query;
  let filter = {};
  if (cls) filter.class = cls;
  if (subject) filter.subject = subject;
  if (chapter) filter.chapter = chapter;

  const questions = await CreativeQuestion.find(filter).sort({ createdAt: 1 });
  res.json(questions);
};

export const cqdelete = async (req, res) => {
  try {
    await CreativeQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};