import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import statsRoutes from "./routes/statsRoutes.js";

import Artist from "./models/artistModel.js";
import artistRoutes from "./routes/artistRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import collectiveRoutes from "./routes/collectiveRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:3000',  // desenvolvimento
    'http://localhost:5173',  // vite dev
    'http://localhost:5000',
    'https://we-cultural-frontend.vercel.app',  // produção
    'https://we-cultural-backend.onrender.com'
  ], 
  credentials: true
}));
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/collectives", collectiveRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api", eventRoutes);

// Rota de debug
app.get("/api/debug", async (req, res) => {
  try {
    const db = mongoose.connection.db!;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const artistsCount = await Artist.countDocuments();
    const allArtists = await Artist.find({}, 'email name').lean();

    res.json({
      database: mongoose.connection.db!.databaseName,
      collections: collectionNames,
      artists: {
        count: artistsCount,
        documents: allArtists
      },
      connection: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState
      }
    });
  } catch (error) {
    console.error("❌ Erro no debug:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Rota raiz
app.get("/", (req, res) => res.json({ message: "Bem-vindo à API" }));

// Conexão MongoDB
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) throw new Error("MONGODB_URI não definido no .env");

mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    console.log("📊 Banco de dados:", mongoose.connection.db!.databaseName);
  })
  .catch(err => console.error("❌ Erro no MongoDB:", err));

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));