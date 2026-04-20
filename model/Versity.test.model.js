import mongoose from "mongoose";

const versitytestresultSchema = new mongoose.Schema({
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

const VersityResult = mongoose.model("versitytestresult", versitytestresultSchema);
export default VersityResult;
