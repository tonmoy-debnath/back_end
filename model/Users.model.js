import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_picture: { type: String, default: "" },
  profation: { type: String, default: "" }, // টাইপো ঠিক করলে ভাল হয়: "profession"
  phone: { type: String, required: true, default: "" },
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
  },
  school: { type: String, default: "" },
  class: { type: String, default: "" },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  book_list: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;
// Exporting the User model for use in other parts of the application.