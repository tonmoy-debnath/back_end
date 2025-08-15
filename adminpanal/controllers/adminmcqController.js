import McqQuestion from "../../model/McqQuestion.model.js";

// Summary counts by class, subject, chapter
// export const getSummary = async (req, res) => {
//   try {
//     const summary = await McqQuestion.aggregate([
//       { $group: { _id: {class: "$class_name" , subject: "$subject", chapter: "$chapter" }, count: { $sum: 1 } } },
//       { $project: { class: "$_id.class", subject: "$_id.subject", chapter: "$_id.chapter", count: 1, _id: 0 } }
//     ]);
//     res.json(summary);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const getSummary = async (req, res) => {
  try {
    const summary = await McqQuestion.aggregate([
      {
        $group: {
          _id: {
            class: "$class_name",
            subject: "$subject",
            chapter: "$chapter"
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          class: "$_id.class",
          subject: "$_id.subject",
          chapter: "$_id.chapter",
          count: 1,
          _id: 0
        }
      },
      {
        $sort: {
          class: 1,   // 1 = ascending, -1 = descending
          subject: 1,
          chapter: 1
        }
      }
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Summary counts by date
// export const getDateSummary = async (req, res) => {
//   try {
//     const dates = await McqQuestion.aggregate([
//       { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
//       { $project: { date: "$_id", count: 1, _id: 0 }  }
//     ]);
//     res.json(dates);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



export const getDateSummary = async (req, res) => {
  try {
    const dates = await McqQuestion.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { date: -1 } // 🔽 Descending order: latest date first
      }
    ]);
    res.json(dates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get questions by chapter
export const getByChapter = async (req, res) => {
  const { chapter  } = req.params;
  try {
    const list = await McqQuestion.find({ chapter });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const getByChapter = async (req, res) => {
//   const { subject, chapter } = req.params;            // অথবা req.query
//   try {
//     // <-- এখানে অবজেক্টের মতো সঠিক ম‍্যাপিং d০য়া
//     const list = await McqQuestion.find({ subject, chapter });
//     res.json(list);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// Get questions by date
export const getByDate = async (req, res) => {
  const { date } = req.params; // YYYY-MM-DD
  try {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    const list = await McqQuestion.find({ createdAt: { $gte: start, $lt: end } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Search with class_name & subject, chapter contains keyword
export const searchMcqs = async (req, res) => {
  const { class_name, subject, chapter } = req.query;
  try {
    const mcqs = await McqQuestion.find({
      class_name,
      subject,
      chapter: { $regex: chapter, $options: "i" }
    });
    res.json(mcqs);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
};

export const updateMcq = async (req, res) => {
  const { id } = req.params;
  const { chapter, queston, options, correctIndex } = req.body;
  try {
    const updated = await McqQuestion.findByIdAndUpdate(id, {
      chapter,
      queston,
      options,
      correctIndex
    }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

export const deleteMcq = async (req, res) => {
  const { id } = req.params;
  try {
    await McqQuestion.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};
