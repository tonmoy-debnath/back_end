import express from 'express';
import multer from 'multer';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import isAuthenticated from "../middlewares/Authenticated.js";
import { uploadBook, getBooks } from '../controllers/book.controller.js';
import  isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

// ✅ S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Multer-S3 storage
const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'cover'
      ? 'upload/pic/bookcovers'
      : 'upload/pdfs/book';
    const filename = `${prefix}/book-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, filename);
  },
});

// ✅ Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit, adjust as needed
});

// ✅ Upload endpoint (cover + pdf)
router.post(
  '/upload',
  isAuthenticated,isAdmin ,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  (req, res, next) => {
    // Attach S3 URLs for convenience
    if (req.files) {
      if (req.files.cover) req.files.cover = req.files.cover.map(f => ({ ...f, url: f.location }));
      if (req.files.file) req.files.file = req.files.file.map(f => ({ ...f, url: f.location }));
    }
    next();
  },
  uploadBook 
);

// ✅ Get books
router.get('/getbook', isAuthenticated, getBooks);

export default router;
