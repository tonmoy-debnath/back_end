import mongoose from "mongoose";

const jobresultSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  jobtype:{type:String ,required: true},
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

const JobResult = mongoose.model("jobResult", jobresultSchema);
export default JobResult;
