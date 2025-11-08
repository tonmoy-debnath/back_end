// // middlewares/upload.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import crypto from 'crypto';

// // গন্তব্য ফোল্ডার তৈরি থাকলে ঠিক আছে, না থাকলে বানাবে
// const uploadDir = "./upload/pic/profile";
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



// import multer from "multer";
// import crypto from "crypto";
// import path from "path";
// import { S3Client } from "@aws-sdk/client-s3";
// import multerS3 from "multer-s3";

// // S3 ক্লায়েন্ট সেটআপ
// const s3 = new S3Client({
//   region: process.env.AWS_REGION, // env থেকে region নিচ্ছে
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // S3 storage configuration
// const storage = multerS3({
//   s3: s3,
//   bucket: process.env.S3_BUCKET_NAME, // env থেকে bucket নাম নিচ্ছে
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   metadata: (req, file, cb) => {
//     cb(null, { fieldName: file.fieldname });
//   },
//   key: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const uniqueSuffix = crypto.randomBytes(6).toString("hex");
//     const uniqueName = `upload/pic/profile/user-${Date.now()}-${uniqueSuffix}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({ storage });

// export default upload;




// // middlewares/upload.js
// import multer from "multer";
// import crypto from "crypto";
// import path from "path";
// import { S3Client } from "@aws-sdk/client-s3";
// import multerS3 from "multer-s3";

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const storage = multerS3({
//   s3: s3,
//   bucket: process.env.S3_BUCKET_NAME,
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   metadata: (req, file, cb) => {
//     cb(null, { fieldName: file.fieldname });
//   },
//   key: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const uniqueSuffix = crypto.randomBytes(6).toString("hex");
//     const uniqueName = `upload/pic/profile/user-${Date.now()}-${uniqueSuffix}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// const baseUpload = multer({ storage });

// function wrapSingle(fieldName) {
//   const mw = baseUpload.single(fieldName);
//   return (req, res, next) => {
//     mw(req, res, (err) => {
//       if (err) return next(err);
//       if (req.file && req.file.location) {
//         req.file.path = req.file.location; // এখন path = S3 URL
//         req.file.filename = req.file.key;  // চাইলে filename ও সেট করে দিলাম
//       }
//       next();
//     });
//   };
// }

// const upload = {
//   single: wrapSingle,
//   array: baseUpload.array.bind(baseUpload),
//   fields: baseUpload.fields.bind(baseUpload),
//   none: baseUpload.none.bind(baseUpload),
//   any: baseUpload.any.bind(baseUpload),
// };

// export default upload;




// middlewares/upload.js
import multer from "multer";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// S3 config
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// multer memory storage (ফাইল ডিস্কে সেভ হবে না)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// wrapper for single upload with compression
function uploadSingle(fieldName) {
  const mw = upload.single(fieldName);

  return async (req, res, next) => {
    mw(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();

      try {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const uniqueSuffix = crypto.randomBytes(6).toString("hex");
        const key = `upload/pic/profile/user-${Date.now()}-${uniqueSuffix}${ext}`;

        let fileBuffer = req.file.buffer;

        // যদি ফাইল 1MB এর বেশি হয় → sharp দিয়ে compress করব
        if (fileBuffer.length > 1024 * 1024) {
          let quality = 80;
          let resized = await sharp(fileBuffer)
            .resize(800, 800, { fit: "inside" }) // বড় ইমেজ হলে রিসাইজ
            .jpeg({ quality })
            .toBuffer();

          // যতক্ষণ না <=1MB হয় ততক্ষণ quality কমাও
          while (resized.length > 1024 * 1024 && quality > 30) {
            quality -= 10;
            resized = await sharp(fileBuffer)
              .resize(800, 800, { fit: "inside" })
              .jpeg({ quality })
              .toBuffer();
          }

          fileBuffer = resized;
        }

        // S3 তে আপলোড
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: fileBuffer,
          ContentType: req.file.mimetype,
        };
        await s3.send(new PutObjectCommand(uploadParams));

        // নতুন ফাইল info সেট করলাম
        req.file.path = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        req.file.filename = key;

        next();
      } catch (error) {
        next(error);
      }
    });
  };
}

export default {
  single: uploadSingle,
};
