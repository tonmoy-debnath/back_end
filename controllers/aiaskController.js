import axios from "axios";
import Answer from "../model/AIAnswer.js";
import aiallasked from "../model/Allaiasked.model.js";
import Aiunused from "../model/Aiunused.model.js"; // নতুন মডেল
import dotenv from "dotenv";
dotenv.config();

// ==========================
// একাধিক API key সাপোর্ট
// ==========================
const OPENAI_API_KEYS = process.env.OPENAI_API_KEYS?.split(",")
  .map(k => k.trim())
  .filter(k => k);

if (!OPENAI_API_KEYS || OPENAI_API_KEYS.length === 0) {
  console.error("❌ OPENAI_API_KEYS .env ফাইলে পাওয়া যায়নি বা ফাঁকা।");
}

let currentKeyIndex = 0;
function getNextApiKey() {
  const key = OPENAI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % OPENAI_API_KEYS.length;
  return key;
}

// ==========================
// প্রশ্ন করার হ্যান্ডলার
// ==========================
export const handleAsk = async (req, res) => {
  const { question, className, subject } = req.body;

  if (!question || typeof question !== "string" || question.trim().length < 3) {
    return res.status(400).json({ error: "একটি বৈধ প্রশ্ন দিন।" });
  }

  try {
    // প্রথমে ডাটাবেসে খুঁজে দেখা
    const existing = await Answer.findOne({ question, className, subject });
    if (existing) {
      return res.json({ answer: existing.answer, from: "db" });
    }

    // API কল
    let aiAnswer = null;
    let lastError = null;

    for (let i = 0; i < OPENAI_API_KEYS.length; i++) {
      const apiKey = getNextApiKey();
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            max_tokens: 700,
            temperature: 0.7,
            messages: [
              {
                role: "system",
                content: `
তুমি অভিজ্ঞ বাংলাদেশি বিজ্ঞানের শিক্ষক—বাংলা, বিজ্ঞান, গণিত, সাহিত্য, ইতিহাস, ইংরেজি। 
সব উত্তর ২০২5 মাধ্যমিক সিলেবাস অনুযায়ী সংক্ষিপ্ত ও গ্রহণযোগ্য হবে এবং যে ভাষায় প্রশ্ন করবে ঐ ভাষায় উত্তর দিবে। 
তথ্য না থাকলে বলো: 'আমার কাছে তথ্য নেই।'
                `,
              },
              { role: "user", content: question },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 15000,
          }
        );

        aiAnswer = response.data.choices?.[0]?.message?.content;
        if (aiAnswer) break; // সফল হলে লুপ থামাও
      } catch (err) {
        lastError = err.response?.data || err.message;
        console.warn(`⚠️ API key ব্যর্থ: ${apiKey.slice(0, 8)}...`, lastError);
      }
    }

    if (!aiAnswer) {
      return res
        .status(500)
        .json({ error: "AI সঠিকভাবে উত্তর দিতে পারেনি।", details: lastError });
    }

    // 👉 Answer / aiallasked এ সেভ না হলেও Aiunused এ সেভ হবে
    await Aiunused.create({
      question,
      className,
      subject,
      answer: aiAnswer,
      ratings: [],
      avgRating: 0,
    });

    res.json({ answer: aiAnswer, from: "ai", className, subject, question });
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "AI অনুরোধ ব্যর্থ হয়েছে।" });
  }
};

// ==========================
// রেটিং হ্যান্ডলার
// ==========================
export const rateAnswer = async (req, res) => {
  const { question, className, subject, rating, answer } = req.body;
  const userId = req.id;

  if (!question || !answer) {
    return res.status(400).json({ error: "প্রশ্ন ও উত্তর প্রদান করুন।" });
  }

  try {
    if (!rating) {
      // 🔹 রেটিং না থাকলে → Aiunused এ সেভ (কিন্তু ডুপ্লিকেট না হয় সে জন্য চেক করি)
      const existsInUnused = await Aiunused.findOne({ question, className, subject });
      if (!existsInUnused) {
        await Aiunused.create({
          question,
          className,
          subject,
          answer,
          ratings: [],
          avgRating: 0,
        });
      }

      return res.status(200).json({
        success: true,
        message: "রেটিং না থাকায় Aiunused-এ সেভ হয়েছে।",
      });
    }

    // 🔹 রেটিং থাকলে → Answer এ সেভ
    const existing = await Answer.findOne({ question, className, subject });

    if (existing) {
      existing.ratings.push(rating);
      existing.avgRating =
        existing.ratings.reduce((a, b) => a + b, 0) / existing.ratings.length;
      await existing.save();

      await aiallasked.create({
        author: userId,
        question: existing._id,
        answer: existing._id,
      });
    } else {
      if (rating >= 4) {
        const newAnswer = new Answer({
          question,
          className,
          subject,
          answer,
          ratings: [rating],
          avgRating: rating,
        });
        await newAnswer.save();

        await aiallasked.create({
          author: userId,
          question: newAnswer._id,
          answer: newAnswer._id,
        });
      } else {
        // 👉 রেটিং < 4 হলে Answer এ সেভ হবে না → তবে অবশ্যই Aiunused এ সেভ হবে
        const existsInUnused = await Aiunused.findOne({ question, className, subject });
        if (!existsInUnused) {
          await Aiunused.create({
            question,
            className,
            subject,
            answer,
            ratings: [rating],
            avgRating: rating,
          });
        }

        return res.status(200).json({
          success: false,
          message: "রেটিং ৪-এর নিচে হওয়ায় Answer এ সেভ হয়নি, Aiunused-এ রাখা হয়েছে।",
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Rating Save Error:", err.message);
    res.status(500).json({ error: "রেটিং সংরক্ষণে সমস্যা হয়েছে।" });
  }
};
