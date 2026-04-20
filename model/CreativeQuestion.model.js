import mongoose from "mongoose";
// models/CreativeQuestion.js
const questionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true , index:true },
  class: String,
  subject: String,
  chapter: String,
  stimulusText: String,
  stimulusImage: String, // এখানে শুধু filename থাকবে (uploads/ ফোল্ডারের)
  questions: {
    ka: String,
    kha: String,
    ga: String,
    gha: String,
  },
  answers: {
    ka: String,
    kha: String,
    ga: String,
    gha: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});



export default mongoose.model("CreativeQuestion", questionSchema);