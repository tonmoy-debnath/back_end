import mongoose from "mongoose";


const aiunusedschema = new mongoose.Schema({
  question: { type: String, required: true },
  className: { type: String, index:true },
  subject: { type: String  },
  answer: { type: String, required: true },
  ratings: [{ type: Number ,default: [5]}],
  avgRating: { type: Number, default: 0 },
}, { timestamps: true });




export default mongoose.model("Aiunused", aiunusedschema);
