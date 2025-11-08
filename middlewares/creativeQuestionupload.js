// import multer from "multer";
// import fs from "fs";
// import path from "path";

// // Storage setup
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dir = "upload/pic/creative";
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// export default upload;



// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import sharp from "sharp";

// // Directories
// const tempDir = "upload/temp";
// const finalDir = "upload/pic/creative";

// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }
// if (!fs.existsSync(finalDir)) {
//   fs.mkdirSync(finalDir, { recursive: true });
// }

// // Multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, tempDir); // Save temporarily
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueName + path.extname(file.originalname));
//   },
// });

// const rawUpload = multer({ storage });

// // ✅ Custom middleware: upload + optimize (auto built-in)
// const upload = (fieldName) => {
//   const middleware = rawUpload.single(fieldName);

//   return async (req, res, next) => {
//     middleware(req, res, async (err) => {
//       if (err) return next(err);
//       if (!req.file) return next();

//       const inputPath = req.file.path;
//       const outputFilename = req.file.filename.replace(path.extname(req.file.filename), ".webp");
//       const outputPath = path.join(finalDir, outputFilename);

//       try {
//         let quality = 80;
//         let buffer;
//         let sizeKB = Infinity;

//         while (quality >= 10 && sizeKB > 20) {
//           buffer = await sharp(inputPath)
//             .resize(500) // Optional resize
//             .webp({ quality })
//             .toBuffer();
//           sizeKB = buffer.length / 1024;
//           quality -= 10;
//         }

//         fs.writeFileSync(outputPath, buffer);
//         fs.unlinkSync(inputPath);

//         // Update req.file to point to optimized version
//         req.file.filename = outputFilename;
//         req.file.path = outputPath;
//         req.file.size = buffer.length;

//         next();
//       } catch (err) {
//         console.error("Image optimization failed:", err);
//         next(err);
//       }
//     });
//   };
// };

// export default upload;




// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import sharp from "sharp";

// // Directories
// const tempDir = "upload/temp";
// const finalDir = "upload/pic/creative";

// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }
// if (!fs.existsSync(finalDir)) {
//   fs.mkdirSync(finalDir, { recursive: true });
// }

// // Multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, tempDir); // Save temporarily
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueName + path.extname(file.originalname));
//   },
// });

// const rawUpload = multer({ storage });

// // ✅ Custom middleware: upload + optimize (JPEG version)
// const upload = (fieldName) => {
//   const middleware = rawUpload.single(fieldName);

//   return async (req, res, next) => {
//     middleware(req, res, async (err) => {
//       if (err) return next(err);
//       if (!req.file) return next();

//       const inputPath = req.file.path;
//       const outputFilename = req.file.filename.replace(path.extname(req.file.filename), ".jpg");
//       const outputPath = path.join(finalDir, outputFilename);

//       try {
//         let quality = 100;
//         let buffer;
//         let sizeKB = Infinity;

//         while (quality >= 80 && sizeKB > 120) {
//           buffer = await sharp(inputPath)
//             .resize(500) // Optional resize
//             .jpeg({ quality })
//             .toBuffer();
//           sizeKB = buffer.length / 1024;
//           quality -= 10;
//         }

//         fs.writeFileSync(outputPath, buffer);
//         fs.unlinkSync(inputPath);

//         // Update req.file to point to optimized version
//         req.file.filename = outputFilename;
//         req.file.path = outputPath;
//         req.file.size = buffer.length;

//         next();
//       } catch (err) {
//         console.error("Image optimization failed:", err);
//         next(err);
//       }




//     });
//   };
// };

// export default upload;






import multer from "multer";
import crypto from "crypto";
import path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `upload/pic/creative/user-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
export default upload;
