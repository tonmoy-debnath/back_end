import express from 'express';
import multer from 'multer';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import isAuthenticated from "../middlewares/Authenticated.js";
import { uploadBook, getBooks } from '../controllers/book.controller.js';

const router = express.Router();

// ✅ S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// ✅ Multer-S3 storage
const storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        let prefix = '';
        if (file.fieldname === 'cover') {
            prefix = 'upload/pic/bookcovers';
        } else if (file.fieldname === 'file') {
            prefix = 'upload/pdfs/book';
        }
        const filename = `${prefix}/book-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    }
});

// ✅ Multer instance for both cover & pdf
const upload = multer({ storage });

// Upload endpoint
router.post('/upload',
    upload.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'file', maxCount: 1 }
    ]),
    isAuthenticated,
    uploadBook
);

// Get books
router.get('/getbook', isAuthenticated, getBooks);

export default router;
