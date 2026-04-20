
import McqQushean from "../model/McqQuestion.model.js";
import JobResult from '../model/Jobexamresult.model.js';

// export const primarijobQuestions = async (req, res) => {
//   try {

//     // ✅ jobtype dynamic
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
//       bangla: ["bangla1" , "wbangla1" , "ybangla1" , "xbangla1" , "zbangla1" , "bangla2" , "wbangla2" , "xbangla2" , "ybangla2" , "zbangla2"],
//       english: ["yict"],
//       math: ["wmath"],
//       gk: ["yict",]
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
//     });
//   }
// };


// ✅ SUBMIT
// export const jobsubmitAnswers = async (req, res) => {
//   try {
//     const { studentName, answers, jobtype } = req.body;
//     const userId = req.id;

//     const questionIds = answers.map(ans => ans.questionId);
//     const questions = await McqQushean.find({ _id: { $in: questionIds } });

//     const questionMap = {};
//     questions.forEach(q => {
//       questionMap[q._id.toString()] = q;
//     });

//     let score = 0;
//     const correctAnswers = [];

//     // answers.forEach(ans => {
//     //   const q = questionMap[ans.questionId];

//     //   if (!q) {
//     //     correctAnswers.push(null);
//     //     return;
//     //   }

//     //   const isCorrect = ans.answer === q.correctIndex;
//     //   if (isCorrect) score++;

//     //   correctAnswers.push(q.correctIndex);
//     // });

//     answers.forEach(ans => {
//       const q = questionMap[ans.questionId?.toString()];

//       if (!q) {
//         correctAnswers.push(null);
//         return;
//       }

//       const isCorrect = ans.answer === q.correctIndex;

//       if (isCorrect) score++;

//       correctAnswers.push(q.correctIndex);
//     });

//     await JobResult.create({
//       author: userId,
//       studentName,
//       jobtype,
//       answers,
//       correctAnswers,
//       score,
//     });

//     res.json({ score, correctAnswers });

//   } catch (err) {
//     console.error("Report creation error:", err);
//     res.status(500).json({ success: false, message: "something is wrong" });
//   }
// };




export const primarijobQuestions = async (req, res) => {
  try {

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
      bangla: ["bangla1","wbangla1","ybangla1","xbangla1","zbangla1","bangla2","wbangla2","xbangla2","ybangla2","zbangla2"],
      english: ["english1", "english2","wenglish1", "wenglish2" ,"xenglish1", "xenglish2" ,"yenglish1", "yenglish2", "zenglish1", "zenglish2",],
      math: ["math","wmath","xmath","ymath","higher_Math1", "higher_Math2","higher_Math"],
      gk: ["science", "bgs","wscience", "wbgs","xscience", "xbgs","biology", "physics", "chemistry", "history", "civics_and_citizenship", "geography","zict" , "yict" ,"ict", "wict", "xict", "zict"]
    };

    // ✅ Duplicate-free random fetch
    const getUniqueRandom = async (subjects, size) => {
      return await McqQushean.aggregate([
        {
          $match: {
            subject: { $in: subjects },
            Polynomial: false
          }
        },
        // 👉 same question remove
        {
          $group: {
            _id: "$queston",   // unique by question text
            doc: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$doc" }
        },
        {
          $sample: { size }
        }
      ]);
    };

    const [banglaQ, englishQ, mathQ, gkQ] = await Promise.all([
      getUniqueRandom(subjectGroups.bangla, limits.bangla),
      getUniqueRandom(subjectGroups.english, limits.english),
      getUniqueRandom(subjectGroups.math, limits.math),
      getUniqueRandom(subjectGroups.gk, limits.gk),
    ]);

    // ✅ Final duplicate remove (extra safety)
    const allQuestions = [...banglaQ, ...englishQ, ...mathQ, ...gkQ];

    const uniqueMap = new Map();

    for (let q of allQuestions) {
      if (!uniqueMap.has(q.queston)) {
        uniqueMap.set(q.queston, q);
      }
    }

    const finalQuestions = Array.from(uniqueMap.values());

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


export const jobsubmitAnswers = async (req, res) => {
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

    await JobResult.create({
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