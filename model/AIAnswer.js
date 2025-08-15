import mongoose from "mongoose";


const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  className: { type: String, index:true },
  subject: { type: String  },
  answer: { type: String, required: true },
  ratings: [{ type: Number ,default: [5]}],
  avgRating: { type: Number, default: 0 },
}, { timestamps: true });


answerSchema.post('findOneAndUpdate', async function(doc) {
  if (this.getUpdate().$set?.avgRating != null) {
    const newAvg = this.getUpdate().$set.avgRating;
    if (newAvg <= 3) {
      await doc.deleteOne();
      console.log(`(Auto Removed) Low-rated answer deleted for ID: ${doc._id}`);
    }
  }
});

export default mongoose.model("Answer", answerSchema);
