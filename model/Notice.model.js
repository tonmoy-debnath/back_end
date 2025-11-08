// import mongoose from "mongoose";

// const noticeSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   image: { type: String, default: "" },
//   startDate: { type: Date, required: true },
//   endDate: { type: Date, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("Notice", noticeSchema);


import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: "" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 🔥 TTL Index: endDate এর ২৪ ঘন্টা পর ডকুমেন্ট মুছে যাবে
noticeSchema.index({ endDate: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export default mongoose.model("Notice", noticeSchema);
