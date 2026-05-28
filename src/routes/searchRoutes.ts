import { Router } from "express";
import artistModel from "../models/artistModel.js";
import collectiveModel from "../models/collectiveModel.js";
import equipmentModel from "../models/equipmentModel.js";
import logger from "../utils/logger.js";

const router = Router();

/**
 * GET /api/search/artists?q=texto
 * Busca artistas, coletivos e espaços por nome ou categoria
 */

router.get("/artists", async (req, res) => {
  try {
    const q = (req.query.q as string)?.trim();

    if (!q) {
      return res.json({ artists: [], collectives: [], equipments: [] });
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const [artists, collectives, equipments] = await Promise.all([
      artistModel
        .find({ $or: [{ name: regex }, { categories: regex }] })
        .select("name email categories profilePicture")
        .lean(),

      collectiveModel
        .find({ $or: [{ name: regex }, { categories: regex }] })
        .select("name categories profilePicture phone socialLink")
        .lean(),

      equipmentModel
        .find({ $or: [{ name: regex }, { category: regex }] })
        .select("name category logo cidade bairro email phone")
        .lean(),
    ]);

    res.json({ artists, collectives, equipments });
  } catch (error) {
    logger.error("Erro na busca", { error });
    res.status(500).json({ message: "Erro na busca" });
  }
});

export default router;
