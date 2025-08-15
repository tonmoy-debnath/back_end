import mongoose from "mongoose";

const selectedQuestionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // এক ইউজারের জন্য একটা রেকর্ড
  },
  questionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreativeQuestion",
    },
  ],
});

export default mongoose.model("SelectedQuestion", selectedQuestionSchema);
