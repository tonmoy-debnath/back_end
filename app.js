import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cluster from 'cluster';
import os from 'os';
import connectDB from './utils/db.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import createQuestionRoutes from './routes/createQuestion.route.js';
import reportRoutes from './routes/report.routes.js';
import mcqExam from './routes/msq.exam.routes.js';
import aiAnswer from "./routes/aiask.Route.js";
import creativeQuestionRoutes from "./routes/creativeQuestionRoutes.js";
import bookRoutes from './routes/books.routes.js';
import adminRoutes from "./adminpanal/routes/superadmin.Routes.js";
import adminanswer from './adminpanal/routes/answer.js';
import adminUserRoutes from "./adminpanal/routes/adminUserRoutes.js";
import adminreportRoutes from "./adminpanal/routes/adminReport.route.js";
import adminmcqResult from "./adminpanal/routes/adminmcqResult.routes.js";
import adminmcq from "./adminpanal/routes/adminmcq.routes.js";
import admincqdashbord from "./adminpanal/routes/admincqdashbord.routes.js";
import adminAnswerRoutes from "./adminpanal/routes/adminAnswerRoutes.js";

dotenv.config();
const app = express();

// Cluster setup for multi-core scaling
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on('exit', (worker) => {
    cluster.fork();
  });
} else {
  // Middleware
  app.use(express.json({ limit: '600mb' }));
  app.use(express.urlencoded({ limit: '600mb', extended: true }));
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());
  app.set('trust proxy', 1); // Trust first proxy for secure cookies
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000,
  });
  app.use(limiter);

  // CORS
  const allowedOrigins = process.env.FRONTEND_URLS.split(','); // Array বানালো

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // Postman বা curl
        if (allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  // Static folder
  app.use("/upload", express.static("upload", { maxAge: '1d' }));

  // Connect DB
  connectDB(); // Async function, production-ready version should handle fail internally

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/create-question", createQuestionRoutes);
  app.use("/api/report", reportRoutes);
  app.use("/api/msqExam", mcqExam);
  app.use("/api/aiAnswer", aiAnswer);
  app.use("/api/creative", creativeQuestionRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/adminanswer", adminanswer);
  app.use("/api/adminusers", adminUserRoutes);
  app.use("/api/adminreportRoutes", adminreportRoutes);
  app.use("/api/adminmcqResult", adminmcqResult);
  app.use("/api/adminmcq", adminmcq);
  app.use("/api/admincqdashbord", admincqdashbord);
  app.use("/api/adminanswers", adminAnswerRoutes);

  // Global Error Handler
  app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: err.message });
  });

  const HOST = process.env.HOST || '0.0.0.0';
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, HOST);
}
