import { Router } from "express";
import artistModel = require("../models/artistModel");

const router = Router();

/**
 * GET /api/search/artists?q=texto
 * Pode buscar por:
 * - nome
 * - categorias
 * - características (lgbtqiapn, black, indigenous, pcd)
 */
router.get("/artists", async (req, res) => {
  try {
    const q = (req.query.q as string)?.trim();

    if (!q) {
      return res.json([]);
    }

    // Regex para pesquisa parcial
    const regex = new RegExp(q, "i");

    const artists = await artistModel.find({
      $or: [
        { name: regex },
        { categories: regex },
        { email: regex },
      ],
    })
      .select("name email categories profilePicture") // reduz payload
      .lean();

    res.json(artists);
  } catch (error) {
    console.error("❌ Erro na busca:", error);
    res.status(500).json({ message: "Erro na busca" });
  }
});

export default router;
