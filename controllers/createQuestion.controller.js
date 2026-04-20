
import fs from "fs-extra";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fetch from "node-fetch";
import mongoose from "mongoose";
import CreativeQuestion from "../model/CreativeQuestion.model.js";
import SelectedQuestion from "../model/SelectedQuestion.model.js";
import tSubscription from "../model/Tsubscription.model.js"; // ✅ সাবস্ক্রিপশন মডেল ইমপোর্ট

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generatePDF = async (req, res) => {
  try {
    const {
      school_name,
      exam_name,
      class_name,
      subject,
      duration,
      total_marks,
      special_note,
    } = req.body;

    const userId = req.id;

    // ✅ ইউজারের সাবস্ক্রিপশন ব্যালেন্স চেক
    const sub = await tSubscription.findOne({ author: userId });
    if (!sub || sub.amount < 5) {
      return res.status(400).json({
        message: "❌ আপনার ব্যালেন্স পর্যাপ্ত নয়। কমপক্ষে ৫ টাকা প্রয়োজন।",
        current_balance: sub ? sub.amount : 0,
      });
    }

    // ✅ ব্যালেন্স থেকে ৫ টাকা কেটে নেওয়া
    sub.amount -= 5;
    await sub.save();

    // ✅ প্রশ্ন সংগ্রহ
    const selectedDoc = await SelectedQuestion.findOne({ userId });
    let questions = [];
    if (selectedDoc && selectedDoc.questionIds.length) {
      const fetched = await CreativeQuestion.find({
        _id: { $in: selectedDoc.questionIds },
      });
      const idOrder = selectedDoc.questionIds.map((id) => id.toString());
      questions = idOrder
        .map((id) => fetched.find((q) => q._id.toString() === id))
        .filter((q) => q);
    } else {
      questions = await CreativeQuestion.find()
        .sort({ createdAt: -1 })
        .limit(11);
    }

    // ✅ PDF ফাইল সেটআপ
    const filename = `output_${Date.now()}_${Math.floor(Math.random() * 10000)}.pdf`;
    const outputDir = path.join(__dirname, "..", "pdf");
    await fs.ensureDir(outputDir);
    const outputPath = path.join(outputDir, filename);

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const fontPath = path.join(__dirname, "..", "fonts", "Kalpurush.ttf");
    if (!fs.existsSync(fontPath)) {
      return res
        .status(500)
        .send("⚠️ ফন্ট পাওয়া যায়নি। fonts ফোল্ডারে Kalpurush.ttf দিন।");
    }
    doc.registerFont("MixedFont", fontPath);

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // ✅ Header
    doc
      .font("MixedFont")
      .fontSize(14)
      .text(school_name, { align: "center" })
      .fontSize(11)
      .text(exam_name, { align: "center" })
      .text(`শ্রেণিঃ ${class_name}`, { align: "center" })
      .text(`বিষয়ঃ ${subject}`, { align: "center" });

    if (special_note && special_note.trim()) {
      doc
        .moveDown(0.5)
        .fontSize(9)
        .text(`বি.দ্র.: [ ${special_note} ]`, { align: "center" });
    }

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc
      .moveDown(1)
      .fontSize(10)
      .text(`সময়ঃ ${duration}`, {
        continued: true,
        width: pageWidth / 2,
        align: "left",
      })
      .text(`পূর্ণমানঃ ${total_marks}`, {
        width: pageWidth / 2,
        align: "right",
      });

    // ✅ Questions
    for (const [idx, q] of questions.entries()) {
      doc.moveDown(1);
      doc.font("MixedFont").fontSize(9);

      if (q.stimulusText) {
        doc.text(`${idx + 1}. ${q.stimulusText}`);
        doc.moveDown(0.1);
      }

      // ছবি লোড
      // if (q.stimulusImage) {
      //   const imageUrl = `${q.stimulusImage}`;
      //   try {
      //     const response = await fetch(imageUrl);
      //     if (!response.ok)
      //       throw new Error(`Image fetch failed: ${response.statusText}`);
      //     const imageBuffer = Buffer.from(await response.arrayBuffer());
      //     const availableWidth =
      //       doc.page.width - doc.page.margins.left - doc.page.margins.right;
      //     const maxHeight = doc.currentLineHeight() * 5;

      //     doc.image(imageBuffer, {
      //       fit: [availableWidth, maxHeight],
      //       align: "center",
      //       valign: "top",
      //     });
      //     doc.moveDown(0.5);
      //   } catch (e) {
      //     console.error("⚠️ ছবি লোড করতে সমস্যা:", e);
      //   }
      // }

      if (q.stimulusImage) {
        try {
          const imagePath = path.join(
            __dirname,
            "..",
            q.stimulusImage
          );

          if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);

            const availableWidth =
              doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const maxHeight = doc.currentLineHeight() * 5;

            doc.image(imageBuffer, {
              fit: [availableWidth, maxHeight],
              align: "center",
              valign: "top",
            });

            doc.moveDown(0.5);
          } else {
            console.log("⚠️ Image file not found:", imagePath);
          }
        } catch (e) {
          console.error("⚠️ ছবি লোড করতে সমস্যা:", e);
        }
      }


      // Sub-questions
      const labels = ["ক", "খ", "গ", "ঘ"];
      const opts = [
        q.questions.ka,
        q.questions.kha,
        q.questions.ga,
        q.questions.gha,
      ];
      opts.forEach((text, i) => {
        doc.text(`${labels[i]}. ${text}`, { indent: 20 });
        doc.moveDown(0.1);
      });
    }

    doc.end();

    writeStream.on("finish", async () => {
      try {
        await SelectedQuestion.deleteOne({ userId });
        res.download(outputPath, filename);
      } catch (deleteErr) {
        console.error("⚠️ SelectedQuestion ডিলিট করতে সমস্যা হয়েছে:", deleteErr);
        res.status(500).send("⚠️ PDF ডাউনলোডের আগে কিছু সমস্যা হয়েছে।");
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("⚠️ পিডিএফ তৈরি করতে সমস্যা হয়েছে।");
  }
};
