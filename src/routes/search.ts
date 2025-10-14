import express from "express";
import Artist from "../models/artistModel";
import Collective from "../models/collectiveModel";
import Equipment from "../models/equipmentModel";

const search = express.Router();

// GET /api/search?q=nome
search.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Parâmetro de busca (q) é obrigatório." });
    }

    const regex = new RegExp(q as string, "i"); // busca case insensitive

    const artists = await Artist.find({ name: regex }).select("name profilePicture");
    const collectives = await Collective.find({ name: regex }).select("name profilePicture");
    const equipments = await Equipment.find({ name: regex }).select("name profilePicture");

    const results = [
      ...artists.map(a => ({ _id: a._id, type: "artist", name: a.name, profilePicture: a.profilePicture })),
      ...collectives.map(c => ({ _id: c._id, type: "collective", name: c.name, profilePicture: c.profilePicture })),
      ...equipments.map(e => ({ _id: e._id, type: "equipment", name: e.name, profilePicture: e.profilePicture })),
    ];

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ message: "Erro ao buscar.", error: err.message });
  }
});

export default search;
