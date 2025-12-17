import { Request, Response } from "express";
import Artist from "../models/artistModel.js";
import Collective from "../models/collectiveModel.js";
import Equipment from "../models/equipmentModel.js";


export const getStats = async (req: Request, res: Response) => {
  try {
    // Total de artistas
    const totalArtistas = await Artist.countDocuments();
    const totalColetivos = await Collective.countDocuments();
    const totalEquipamentos = await Equipment.countDocuments();
    
    // Artistas por gênero
    const artistasPorGenero = await Artist.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          genero: "$_id",
          _count: { genero: "$count" },
          _id: 0
        }
      }
    ]);

    // Calcular idade e agrupar por faixa etária
    const allArtists = await Artist.find({}, 'birthDate').lean();
    const faixasEtarias = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-60": 0,
      "60+": 0
    };

    allArtists.forEach(artist => {
      const birthYear = new Date(artist.birthDate).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      
      if (age >= 18 && age <= 25) faixasEtarias["18-25"]++;
      else if (age >= 26 && age <= 35) faixasEtarias["26-35"]++;
      else if (age >= 36 && age <= 45) faixasEtarias["36-45"]++;
      else if (age >= 46 && age <= 60) faixasEtarias["46-60"]++;
      else if (age > 60) faixasEtarias["60+"]++;
    });

    // Diversidade
    const lgbtqiapn = await Artist.countDocuments({ lgbtqiapn: true });
    const negros = await Artist.countDocuments({ black: true });
    const indigenas = await Artist.countDocuments({ indigenous: true });
    const pcd = await Artist.countDocuments({ pcd: true });

    // Top categorias
    const topCategorias = await Artist.aggregate([
      { $unwind: "$categories" },
      {
        $group: {
          _id: "$categories",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          categoria: "$_id",
          total: "$count",
          _id: 0
        }
      }
    ]);

    res.json({
      totais: {
        totalArtistas,
        totalColetivos,
        totalEquipamentos
      },
      artistasPorGenero,
      artistasFaixaEtaria: faixasEtarias,
      artistasDiversidade: {
        lgbtqiapn,
        negros,
        indigenas,
        pcd
      },
      topCategorias
    });
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error);
    res.status(500).json({ message: "Erro ao buscar estatísticas", error });
  }
};