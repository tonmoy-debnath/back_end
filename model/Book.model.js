import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
type: { type: String, required: true },
class: { type: String, required: true },
subject: { type: String , require: true },
bookname:{type:String , require:true},
coverUrl: { type: String, required: true },
pdfUrl: { type: String, required: true },
createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Book', bookSchema);