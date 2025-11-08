import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true , index:true },
  endDate:{type: Date,required: true,},
  status:{type: String,default: "pending",},
  createdAt: { type: Date, default: Date.now },

});

const subscription = mongoose.model("subscription", subscriptionSchema);

export default subscription;
 


