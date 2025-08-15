import Answer from '../../model/AIAnswer.js';


// Helper to compute date boundary
function getDateBoundary(period) {
  const now = new Date();
  switch (period) {
    case 'day': now.setDate(now.getDate() - 1); break;
    case 'week': now.setDate(now.getDate() - 7); break;
    case 'month': now.setMonth(now.getMonth() - 1); break;
    case 'year': now.setFullYear(now.getFullYear() - 1); break;
    default: throw new Error('Invalid period');
  }
  return now;
}

// GET /api/admin/stats/:period
export const getStats = async (req, res) => {
  try {
    const since = getDateBoundary(req.params.period);
    const count = await Answer.countDocuments({ createdAt: { $gte: since } });
    res.json({ period: req.params.period, count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getTodaysQuestions = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

    // আজকের তৈরি প্রশ্ন এবং avgRating > 3
    const todays = await Answer.find({
      createdAt: { $gte: start, $lte: end },
      avgRating: { $gt: 3 }
    }).sort({ createdAt: -1 });

    return res.status(200).json(todays);
  } catch (err) {
    console.error('Error in getTodaysQuestions:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


