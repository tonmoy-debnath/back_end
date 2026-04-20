import mongoose from "mongoose";

const mcqquestonSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true , index:true },
  class_name: { type: String, default: "" },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  queston: { type: String, required: true },
  Polynomial: { type: Boolean, default: false },
  options: [String],
  correctIndex: { type: Number, required: true } ,
  createdAt: { type: Date, default: Date.now }
});

const McqQushean = mongoose.model("McqQushean", mcqquestonSchema);
export default McqQushean;
