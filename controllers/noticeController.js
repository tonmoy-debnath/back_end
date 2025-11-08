import Notice from "../model/Notice.model.js";

export const createNotice = async (req, res) => {
  try {
    const { title, description, image, startDate, endDate } = req.body;
    const notice = await Notice.create({ title, description, image, startDate, endDate });
    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
