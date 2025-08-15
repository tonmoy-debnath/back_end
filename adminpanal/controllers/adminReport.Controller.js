
import Report from "../../model/Report.model.js"; // তুমি যেভাবে path ব্যবহার করো সেটা অনুযায়ী adjust করো
import User from "../../model/Users.model.js";




// সব রিপোর্ট দেখার API
// export const getallreport = async (req, res) => {
//   try {
//     const reports = await Report.find()
//       .populate("author", "name.email") // ইউজার নাম ও ইমেইল
//       .populate("question", "title")    // প্রশ্নের শিরোনাম
//       .sort({ created_at: -1 });

//     res.json(reports);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const getallreport = async (req, res) => {
  try {
    // ২৪ ঘণ্টা আগের সময় হিসাব কর
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const reports = await Report.find({
      created_at: { $gte: last24Hours }
    })
      .populate("author", "name email")    // ইউজার নাম ও ইমেইল
      .populate("question", "title")       // প্রশ্নের শিরোনাম
      .sort({ created_at: 1 }); 

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};



// নির্দিষ্ট রিপোর্টের বিস্তারিত
export const getonereport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("author", "name email")
      .populate("question");

    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


