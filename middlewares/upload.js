// middlewares/upload.js
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
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomBytes(6).toString("hex");
    const filename = `upload/pic/profile/user-${Date.now()}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

const baseUpload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Wrapper for single file
function single(fieldName) {
  const mw = baseUpload.single(fieldName);
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (err) return next(err);
      if (req.file) {
        // Attach S3 URL and original filename
        req.file.url = req.file.location; // S3 public URL
        req.file.filename = req.file.key; // S3 key
        req.file.sizeKB = Math.round(req.file.size / 1024); // Optional: size in KB
      }
      next();
    });
  };
}

// Wrapper for multiple files
function array(fieldName, maxCount = 10) {
  const mw = baseUpload.array(fieldName, maxCount);
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (err) return next(err);
      if (req.files) {
        req.files = req.files.map(file => ({
          ...file,
          url: file.location,
          filename: file.key,
          sizeKB: Math.round(file.size / 1024)
        }));
      }
      next();
    });
  };
}

const upload = {
  single,
  array,
  fields: baseUpload.fields.bind(baseUpload),
  any: baseUpload.any.bind(baseUpload),
  none: baseUpload.none.bind(baseUpload),
};

export default upload;
