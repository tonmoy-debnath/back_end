import mongoose from "mongoose";

const mcqresultSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  class: { type: String, default: null },
  subject: { type: String, required: true },
  studentName: String,
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "McqQushean"
      },
      answer: Number
    }
  ],
  correctAnswers: [Number],
  score: Number,
  createdAt: { type: Date, default: Date.now }
});

const McqResult = mongoose.model("McqResult", mcqresultSchema);
export default McqResult;
