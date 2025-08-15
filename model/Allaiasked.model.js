import mongoose from "mongoose";

const aiallaskedSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer"
    },
    answer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer"
    },

    createdAt: { type: Date, default: Date.now }
});

const aiallasked = mongoose.model("aiallasked", aiallaskedSchema);
export default aiallasked;