// // middlewares/upload.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import crypto from 'crypto';

// // গন্তব্য ফোল্ডার তৈরি থাকলে ঠিক আছে, না থাকলে বানাবে
// const uploadDir = "./upload/pic/report";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//   const ext = path.extname(file.originalname);
//   const uniqueSuffix = crypto.randomBytes(6).toString('hex'); // 12 characters
//   const uniqueName = `user-${Date.now()}-${uniqueSuffix}${ext}`;
//   cb(null, uniqueName);
// }
// });

// const upload = multer({ storage });

// export default upload;



import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `upload/pic/report/user-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadS3 = multer({ storage });

export default uploadS3;
