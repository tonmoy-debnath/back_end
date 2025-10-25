

import PDFDocument from "pdfkit";
import fetch from "node-fetch";
import CreativeQuestion from "../model/CreativeQuestion.model.js";
import SelectedQuestion from "../model/SelectedQuestion.model.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const S3_BASE_URL = "https://foxeka-stor.s3.ap-south-1.amazonaws.com/";

export const generatePDF = async (req, res) => {
  try {
    const { school_name, exam_name, class_name, subject, duration, total_marks, special_note } = req.body;
    const userId = req.id;

    // ✅ ডাটাবেজ থেকে প্রশ্ন আনো
    const selectedDoc = await SelectedQuestion.findOne({ userId });
    let questions = [];

    if (selectedDoc && selectedDoc.questionIds.length) {
      const fetched = await CreativeQuestion.find({ _id: { $in: selectedDoc.questionIds } });
      const idOrder = selectedDoc.questionIds.map(id => id.toString());
      questions = idOrder.map(id => fetched.find(q => q._id.toString() === id)).filter(q => q);
    } else {
      questions = await CreativeQuestion.find().sort({ createdAt: -1 }).limit(11);
    }

    // ✅ সার্ভারে ফাইল না বানিয়ে সরাসরি মেমরি স্ট্রিমে PDF তৈরি করা
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Font লোড করা (প্রয়োজনে পরিবর্তনযোগ্য)
    const fontPath = path.join(__dirname, "..", "fonts", "Kalpurush.ttf");
    doc.registerFont("MixedFont", fontPath);

    // ✅ Response হেডার (সরাসরি ডাউনলোড হবে)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Question_${Date.now()}.pdf"`);

    // ✅ PDF সরাসরি response এ পাঠানো হবে
    doc.pipe(res);

    // ======== PDF Content শুরু ========
    doc.font("MixedFont").fontSize(14).text(school_name, { align: "center" })
      .fontSize(11).text(exam_name, { align: "center" })
      .text(`শ্রেণিঃ ${class_name}`, { align: "center" })
      .text(`বিষয়ঃ ${subject}`, { align: "center" });

    if (special_note && special_note.trim()) {
      doc.moveDown(0.5).fontSize(9).text(`বি.দ্র.: [ ${special_note} ]`, { align: "center" });
    }

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.moveDown(1).fontSize(10)
      .text(`সময়ঃ ${duration}`, { continued: true, width: pageWidth / 2, align: "left" })
      .text(`পূর্ণমানঃ ${total_marks}`, { width: pageWidth / 2, align: "right" });

    for (const [idx, q] of questions.entries()) {
      doc.moveDown(1).font("MixedFont").fontSize(9);

      if (q.stimulusText) {
        doc.text(`${idx + 1}. ${q.stimulusText}`);
        doc.moveDown(0.1);
      }

      if (q.stimulusImage) {
        try {
          const imageUrl = `${S3_BASE_URL}${q.stimulusImage}`;
          const response = await fetch(imageUrl);
          if (response.ok) {
            const imageBuffer = Buffer.from(await response.arrayBuffer());
            const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const maxHeight = doc.currentLineHeight() * 5;
            doc.image(imageBuffer, { fit: [availableWidth, maxHeight], align: "center" });
            doc.moveDown(0.5);
          }
        } catch {
          // ইমেজ লোড ব্যর্থ হলে স্কিপ
        }
      }

      const labels = ["ক", "খ", "গ", "ঘ"];
      const opts = [q.questions.ka, q.questions.kha, q.questions.ga, q.questions.gha];
      opts.forEach((text, i) => {
        doc.text(`${labels[i]}. ${text}`, { indent: 20 });
        doc.moveDown(0.1);
      });
    }

    // ======== PDF শেষ ========
    doc.end();

    // ✅ ব্যবহারকারীর SelectedQuestion মুছে ফেলা
    await SelectedQuestion.deleteOne({ userId });

  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("PDF generation failed.");
  }
};
