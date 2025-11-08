import mongoose from "mongoose";

const tsubscriptionSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
    amount: { type: Number, required: true, },
    status: { type: String, default: "pending", },
    createdAt: { type: Date, default: Date.now },

});

const subscription = mongoose.model("tsubscription", tsubscriptionSchema);

export default subscription;



