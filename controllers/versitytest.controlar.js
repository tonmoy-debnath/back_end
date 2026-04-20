
import McqQushean from "../model/McqQuestion.model.js";
import Versitytest from '../model/Versity.test.model.js';

export const versitytest = async (req, res) => {
  try {

    // ✅ jobtype dynamic
    const { jobtype } = req.query;

    let limits;

    if (jobtype === "primary") {
      limits = { bangla: 25, english: 25, math: 15, gk: 25 };
    } else if (jobtype === "bcs") {
      limits = { bangla: 20, english: 20, math: 20, gk: 40 };
    } else if (jobtype === "bank") {
      limits = { bangla: 15, english: 30, math: 25, gk: 30 };
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid job type"
      });
    }

    const subjectGroups = {
      bangla: ["yict", "xbangla1"],
      english: ["yict"],
      math: ["wmath"],
      gk: ["yict",]
    };

    const getRandomBySubjects = async (subjects, size) => {
      return await McqQushean.aggregate([
        {
          $match: {
            subject: { $in: subjects },
            Polynomial: false
          }
        },
        {
          $sample: { size }
        }
      ]);
    };

    const [banglaQ, englishQ, mathQ, gkQ] = await Promise.all([
      getRandomBySubjects(subjectGroups.bangla, limits.bangla),
      getRandomBySubjects(subjectGroups.english, limits.english),
      getRandomBySubjects(subjectGroups.math, limits.math),
      getRandomBySubjects(subjectGroups.gk, limits.gk),
    ]);

    const finalQuestions = [
      ...banglaQ,
      ...englishQ,
      ...mathQ,
      ...gkQ
    ];

    return res.json({
      success: true,
      total: finalQuestions.length,
      data: finalQuestions
    });

  } catch (err) {
    console.error("Random question fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "কিছু ভুল হয়েছে",
    });
  }
};




export const versitytestAnswers = async (req, res) => {
  try {
    const { studentName, answers, jobtype } = req.body;
    const userId = req.id;

    // ✅ validation first
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Invalid answers format"
      });
    }

    const questionIds = answers
      .map(ans => ans.questionId)
      .filter(Boolean);

    const questions = await McqQushean.find({
      _id: { $in: questionIds }
    });

    const questionMap = {};

    questions.forEach(q => {
      if (q && q._id) {
        questionMap[q._id.toString()] = q;
      }
    });

    let score = 0;
    const correctAnswers = [];

    answers.forEach(ans => {
      const q = questionMap?.[ans.questionId?.toString()];

      if (!q) {
        correctAnswers.push(null);
        return;
      }

      const isCorrect = ans.answer === q.correctIndex;

      if (isCorrect) score++;

      correctAnswers.push(q.correctIndex);
    });

    await Versitytest.create({
      author: userId,
      studentName,
      jobtype,
      answers,
      correctAnswers,
      score,
    });

    return res.json({
      success: true,
      score,
      correctAnswers
    });

  } catch (err) {
    console.error("🔥 JOB SUBMIT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error in submit",
      error: err.message
    });
  }
};






// import McqQushean from "../model/McqQuestion.model.js";
// import Versitytest from "../model/Versity.test.model.js";


// // ===============================
// // 🚀 QUESTION FETCH API
// // ===============================
// export const versitytest = async (req, res) => {
//   try {
//     const { jobtype } = req.query;

//     let limits;

//     if (jobtype === "primary") {
//       limits = { bangla: 25, english: 25, math: 15, gk: 25 };
//     } else if (jobtype === "bcs") {
//       limits = { bangla: 20, english: 20, math: 20, gk: 40 };
//     } else if (jobtype === "bank") {
//       limits = { bangla: 15, english: 30, math: 25, gk: 30 };
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid job type"
//       });
//     }

//     const subjectGroups = {
//       bangla: ["yict", "xbangla1"],
//       english: ["yict"],
//       math: ["wmath"],
//       gk: ["yict"]
//     };

//     const getRandomBySubjects = async (subjects, size) => {
//       return await McqQushean.aggregate([
//         {
//           $match: {
//             subject: { $in: subjects },
//             Polynomial: false
//           }
//         },
//         {
//           $sample: { size }
//         }
//       ]);
//     };

//     const [banglaQ, englishQ, mathQ, gkQ] = await Promise.all([
//       getRandomBySubjects(subjectGroups.bangla, limits.bangla),
//       getRandomBySubjects(subjectGroups.english, limits.english),
//       getRandomBySubjects(subjectGroups.math, limits.math),
//       getRandomBySubjects(subjectGroups.gk, limits.gk),
//     ]);

//     const finalQuestions = [
//       ...banglaQ,
//       ...englishQ,
//       ...mathQ,
//       ...gkQ
//     ];

//     return res.json({
//       success: true,
//       total: finalQuestions.length,
//       data: finalQuestions
//     });

//   } catch (err) {
//     console.error("Random question fetch error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "কিছু ভুল হয়েছে",
//       error: err.message
//     });
//   }
// };


// // ===============================
// // 🚀 ANSWER SUBMIT API (FIXED)
// // ===============================
// export const versitytestAnswers = async (req, res) => {
//   try {
//     const { studentName, answers, jobtype, category } = req.body;
//     const userId = req.id;

//     if (!Array.isArray(answers)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid answers format"
//       });
//     }

//     const questionIds = answers
//       .map(ans => ans.questionId)
//       .filter(Boolean);

//     const questions = await McqQushean.find({
//       _id: { $in: questionIds }
//     });

//     const questionMap = {};

//     questions.forEach(q => {
//       if (q?._id) {
//         questionMap[q._id.toString()] = q;
//       }
//     });

//     let score = 0;
//     const correctAnswers = [];

//     answers.forEach(ans => {
//       if (!ans?.questionId) return;

//       const q = questionMap[ans.questionId.toString()];

//       if (!q) {
//         correctAnswers.push(null);
//         return;
//       }

//       // ❌ skipped unanswered
//       if (ans.answer === -1) {
//         correctAnswers.push(q.correctIndex);
//         return;
//       }

//       // ✅ FIXED comparison
//       const isCorrect =
//         Number(ans.answer) === Number(q.correctIndex);

//       if (isCorrect) score++;

//       correctAnswers.push(q.correctIndex);
//     });

//     await Versitytest.create({
//       author: userId,
//       studentName,
//       jobtype,
//       category, // ✅ FIXED (was missing)
//       answers,
//       correctAnswers,
//       score,
//     });

//     return res.json({
//       success: true,
//       score,
//       correctAnswers
//     });

//   } catch (err) {
//     console.error("🔥 JOB SUBMIT ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error in submit",
//       error: err.message
//     });
//   }
// };