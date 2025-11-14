import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Importar modelos E rotas
import Artist from "./models/artistModel"; // 👈 ADICIONE ESTA LINHA
import artistRoutes from "./routes/artistRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);

// Rota de debug completo - CORRIGIDA
app.get("/api/debug", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Conta documentos em cada coleção
    const artistsCount = await Artist.countDocuments();
    const allArtists = await Artist.find({}, 'email name').lean();

    res.json({
      database: mongoose.connection.db.databaseName,
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
    res.status(500).json({ error: error.message });
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
    console.log("📊 Banco de dados:", mongoose.connection.db.databaseName);
  })
  .catch(err => console.error("❌ Erro no MongoDB:", err));

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));