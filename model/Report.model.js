import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question"},
  image:{ type: String, default: null },
  title: { type: String, required: true },
  reason: { type: String, required: true },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 5  // ৫ দিন পরে ডিলিট হবে
  }
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
