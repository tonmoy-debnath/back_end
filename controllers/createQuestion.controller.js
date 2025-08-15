import fs from "fs-extra";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fetch from "node-fetch";
import CreativeQuestion from "../model/CreativeQuestion.model.js";
import SelectedQuestion from "../model/SelectedQuestion.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generatePDF = async (req, res) => {
  try {
    const { school_name, exam_name, class_name, subject, duration, total_marks, special_note } = req.body;
    const userId = req.id;

    const selectedDoc = await SelectedQuestion.findOne({ userId });

    let questions = [];
    if (selectedDoc && selectedDoc.questionIds.length) {
      const fetched = await CreativeQuestion.find({ _id: { $in: selectedDoc.questionIds } });
      const idOrder = selectedDoc.questionIds.map(id => id.toString());
      questions = idOrder.map(id => fetched.find(q => q._id.toString() === id)).filter(q => q);
    } else {
      questions = await CreativeQuestion.find().sort({ createdAt: -1 }).limit(11);
    }

    const filename = `output_${Date.now()}_${Math.floor(Math.random() * 10000)}.pdf`;
    const outputDir = path.join(__dirname, "..", "pdf");
    await fs.ensureDir(outputDir);
    const outputPath = path.join(outputDir, filename);

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const fontPath = path.join(__dirname, "..", "fonts", "Kalpurush.ttf");
    if (!fs.existsSync(fontPath)) {
      return res.status(500).send("Font not found.");
    }
    doc.registerFont("MixedFont", fontPath);

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Header
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

    // Questions
    for (const [idx, q] of questions.entries()) {
      doc.moveDown(1).font("MixedFont").fontSize(9);

      if (q.stimulusText) {
        doc.text(`${idx + 1}. ${q.stimulusText}`);
        doc.moveDown(0.1);
      }

      if (q.stimulusImage) {
        try {
          const response = await fetch(q.stimulusImage);
          if (response.ok) {
            const imageBuffer = Buffer.from(await response.arrayBuffer());
            const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const maxHeight = doc.currentLineHeight() * 5;
            doc.image(imageBuffer, { fit: [availableWidth, maxHeight], align: 'center', valign: 'top' });
            doc.moveDown(0.5);
          }
        } catch {
          // ignore image errors
        }
      }

      const labels = ["ক", "খ", "গ", "ঘ"];
      const opts = [q.questions.ka, q.questions.kha, q.questions.ga, q.questions.gha];
      opts.forEach((text, i) => {
        doc.text(`${labels[i]}. ${text}`, { indent: 20 });
        doc.moveDown(0.1);
      });
    }

    doc.end();

    writeStream.on("finish", async () => {
      await SelectedQuestion.deleteOne({ userId });
      res.download(outputPath, filename);
    });

  } catch {
    res.status(500).send("PDF generation failed.");
  }
};
