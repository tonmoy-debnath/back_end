import mongoose from "mongoose";

const tsubscriptionrequestSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true , index:true },
  PaymentMethod:{type: String,required: true,unique: true,},
  trxid:{type: String,required: true,unique: true,},
  amount:{type: Number,required: true,},
  status:{type: String,default: "pending",},
  createdAt: { type: Date, default: Date.now },

});

const subscriptionrequest = mongoose.model("tsubscriptionrequest", tsubscriptionrequestSchema);

export default subscriptionrequest;
