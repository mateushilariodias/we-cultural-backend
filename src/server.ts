import dotenv from "dotenv";
dotenv.config();

// ─── Validação de variáveis de ambiente obrigatórias ────────────────────────
const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`❌ Variável de ambiente obrigatória não definida: ${key}`);
  }
}

const OPTIONAL_EMAIL_VARS = ["GMAIL_EMAIL", "GMAIL_PASSWORD"] as const;
for (const key of OPTIONAL_EMAIL_VARS) {
  if (!process.env[key]) {
    // console.warn é intencional: logger é içado antes de dotenv rodar em ES modules
    console.warn(`[WARN] Variável opcional não definida: ${key} (reset de senha desativado)`);
  }
}

// ─── Imports ────────────────────────────────────────────────────────────────
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import multer from "multer";
import { AppError } from "./utils/AppError.js";
import logger from "./utils/logger.js";
import statsRoutes from "./routes/statsRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import collectiveRoutes from "./routes/collectiveRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

// ─── Health check (sem overhead de middlewares) ──────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const DEFAULT_ORIGINS = [
  "https://we-cultural-frontend.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
];
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : DEFAULT_ORIGINS;

app.use(cors({ origin: corsOrigins, credentials: true }));

// ─── Body parsing + sanitização NoSQL ───────────────────────────────────────
app.use(express.json());

// express-mongo-sanitize is incompatible with Express 5 (req.query is getter-only).
// This inline sanitizer mutates objects in-place instead of reassigning.
function sanitizeMongoKeys(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (obj[key] !== null && typeof obj[key] === "object") {
      sanitizeMongoKeys(obj[key] as Record<string, unknown>);
    }
  }
}
app.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") sanitizeMongoKeys(req.body);
  if (req.params && typeof req.params === "object") sanitizeMongoKeys(req.params);
  if (req.query && typeof req.query === "object") sanitizeMongoKeys(req.query as Record<string, unknown>);
  next();
});

// ─── HTTP request logging ─────────────────────────────────────────────────────
const morganStream = { write: (msg: string) => logger.http(msg.trim()) };
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", { stream: morganStream }));

// ─── Rotas ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/collectives", collectiveRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api", eventRoutes);

app.get("/", (_req, res) => res.json({ message: "Bem-vindo à API" }));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// ─── Error handler global ────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Arquivo muito grande. Tamanho máximo: 5MB." });
    }
    return res.status(400).json({ message: "Erro no upload do arquivo." });
  }

  if (err.message.startsWith("Tipo de arquivo não permitido")) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error("Erro não tratado", { message: err.message, stack: err.stack });
  res.status(500).json({ message: "Erro interno do servidor" });
});

// ─── Banco de dados e servidor ───────────────────────────────────────────────
const mongoURI = process.env.MONGODB_URI as string;

mongoose
  .connect(mongoURI)
  .then(() => {
    logger.info("MongoDB conectado", { db: mongoose.connection.db!.databaseName });
  })
  .catch((err) => logger.error("Erro no MongoDB", { err }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Servidor rodando na porta ${PORT}`));
