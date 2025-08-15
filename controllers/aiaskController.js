import axios from "axios";
import Answer from "../model/AIAnswer.js";
import aiallasked from "../model/Allaiasked.model.js";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEYS = process.env.OPENAI_API_KEYS?.split(",").map(k => k.trim()).filter(k => k);
let currentKeyIndex = 0;

function getNextApiKey() {
  const key = OPENAI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % OPENAI_API_KEYS.length;
  return key;
}

export const handleAsk = async (req, res) => {
  const { question, className, subject } = req.body;

  if (!question || typeof question !== "string" || question.trim().length < 3) {
    return res.status(400).json({ error: "একটি বৈধ প্রশ্ন দিন।" });
  }

  try {
    const existing = await Answer.findOne({ question, className, subject });
    if (existing) {
      return res.json({ answer: existing.answer, from: "db" });
    }

    let aiAnswer = null;
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
তুমি অভিজ্ঞ ai শিক্ষক—বাংলা, বিজ্ঞান, গণিত, সাহিত্য, ইতিহাস, ইংরেজি। সব উত্তর ২০২5 মাধ্যমিক সিলেবাস অনুযায়ী সংক্ষিপ্ত ও গ্রহণযোগ্য। সর্বোচ্চ 700 টোকেন। তথ্য না থাকলে বলো: 'আমার কাছে তথ্য নেই।'
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
        if (aiAnswer) break;
      } catch {
        continue;
      }
    }

    if (!aiAnswer) {
      return res.status(500).json({ error: "AI সঠিকভাবে উত্তর দিতে পারেনি।" });
    }

    res.json({ answer: aiAnswer, from: "ai", className, subject, question });

  } catch {
    return res.status(500).json({ error: "AI অনুরোধ ব্যর্থ হয়েছে।" });
  }
};

export const rateAnswer = async (req, res) => {
  const { question, className, subject, rating, answer } = req.body;
  const userId = req.id;

  if (!question || !answer || !rating) {
    return res.status(400).json({ error: "সব তথ্য প্রদান করুন।" });
  }

  try {
    const existing = await Answer.findOne({ question, className, subject });

    if (existing) {
      existing.ratings.push(rating);
      existing.avgRating = existing.ratings.reduce((a, b) => a + b, 0) / existing.ratings.length;
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
        return res.status(200).json({
          success: false,
          message: "রেটিং ৪-এর নিচে হওয়ায় প্রথমবার সংরক্ষণ করা হয়নি।",
        });
      }
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "রেটিং সংরক্ষণে সমস্যা হয়েছে।" });
  }
};
