import User from "../../model/Users.model.js";
import Admin from "../../model/Admin.model.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().sort({ created_at: -1 });
  res.json(users);
};


export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};


export const searchUsers = async (req, res) => {
  const { query } = req.query;
  const users = await User.find({
    $or: [
      { "name.first_name": new RegExp(query, "i") },
      { "name.last_name": new RegExp(query, "i") },
      { email: new RegExp(query, "i") },
      { phone: new RegExp(query, "i") },
    ],
  }).limit(50);
  res.json(users);
};

export const getUserStats = async (req, res) => {
  const now = new Date();
  const oneDayAgo = new Date(now);
  const sevenDaysAgo = new Date(now);
  const thirtyDaysAgo = new Date(now);

  oneDayAgo.setDate(now.getDate() - 1);
  sevenDaysAgo.setDate(now.getDate() - 7);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const dayCount = await User.countDocuments({ created_at: { $gte: oneDayAgo } });
  const weekCount = await User.countDocuments({ created_at: { $gte: sevenDaysAgo } });
  const monthCount = await User.countDocuments({ created_at: { $gte: thirtyDaysAgo } });

  res.json({ last24h: dayCount, last7d: weekCount, last30d: monthCount });
};

export const deleteUser = async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
};


export const useractivity = async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ error: "Year and month are required" });

  const selectedMonth = parseInt(month);
  const selectedYear = parseInt(year);

  const start = new Date(selectedYear, selectedMonth - 1, 1);
  const end = new Date(selectedYear, selectedMonth, 1);

  try {
    const data = await User.aggregate([
      {
        $match: {
          created_at: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$created_at" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const result = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const found = data.find(d => d._id === day);
      return { day: day.toString(), value: found ? found.count : 0 };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
};