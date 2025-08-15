import mongoose from "mongoose";

const mcqquestonSchema = new mongoose.Schema({
  class_name: { type: String, default: "" },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  queston: { type: String, required: true },
  options: [String],
  correctIndex: { type: Number, required: true } ,
  createdAt: { type: Date, default: Date.now }
});

const McqQushean = mongoose.model("McqQushean", mcqquestonSchema);
export default McqQushean;
