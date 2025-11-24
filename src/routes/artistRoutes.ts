import { Router } from "express";
import {
  createArtist,
  getArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
} from "../controllers/artistController.js";
import { upload } from "../middlewares/upload.js";
import Artist from "../models/artistModel.js";

const router = Router();

/**
 * 🔍 ROTA DE BUSCA - por nome OU categorias OU qualquer campo
 * GET /api/artists/search?query=algo
 */
router.get("/search", async (req, res) => {
  const query = req.query.query as string;

  if (!query || query.trim() === "") {
    return res.json([]);
  }

  try {
    const results = await Artist.find({
      $or: [
        { name: { $regex: query, $options: "i" } },           // nome
        { bio: { $regex: query, $options: "i" } },            // bio
        { genre: { $regex: query, $options: "i" } },          // gênero
        { categories: { $regex: query, $options: "i" } },     // categorias
      ],
    }).lean();

    res.json(results);
  } catch (error) {
    console.error("❌ Erro ao buscar artistas:", error);
    res.status(500).json({ error: "Erro ao buscar artistas" });
  }
});

/**
 * ✅ CRUD
 */
router.post("/", upload.single("profilePicture"), createArtist);
router.get("/", getArtists);
router.get("/:id", getArtistById);
router.put("/:id", upload.single("profilePicture"), updateArtist);
router.delete("/:id", deleteArtist);

export default router;
