import mongoose from "mongoose";

const subscriptionrequestSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true , index:true },
  type:{type: String,required: true,unique: true,},
  PaymentMethod:{type: String,required: true,unique: true,},
  trxid:{type: String,required: true,unique: true,},
  amount:{type: Number,required: true,},
  endDate:{type: Date,required: true,},
  status:{type: String,default: "pending",},
  createdAt: { type: Date, default: Date.now },

});

const subscriptionrequest = mongoose.model("subscriptionrequest", subscriptionrequestSchema);

export default subscriptionrequest;
