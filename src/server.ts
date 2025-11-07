import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cloudinary from "./config/cloudinary";

import artistRoutes from "./routes/artistRoutes";
import authRoutes from "./routes/authRoutes";
import collectiveRoutes from "./routes/collectiveRoutes";
import equipmentRoutes from "./routes/equipmentRoutes";
import searchRoutes from "./routes/search";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);      // 👈 primeiro, rotas de login
app.use("/api/artists", artistRoutes); // 👈 depois, CRUD de artistas
app.use("/api/collectives", collectiveRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/search", searchRoutes);

// Rota raiz
app.get("/", (req, res) => res.json({ message: "API funcionando 🚀" }));

// Conexão MongoDB
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) throw new Error("MONGODB_URI não definido no .env");

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Erro no MongoDB:", err));

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
