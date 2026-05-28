import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Artist from "../models/artistModel.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import logger from "../utils/logger.js";

export const searchArtists = async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query || query.trim() === "") {
    return res.json([]);
  }

  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const results = await Artist.find({
      $or: [
        { name: { $regex: escaped, $options: "i" } },
        { bio: { $regex: escaped, $options: "i" } },
        { categories: { $regex: escaped, $options: "i" } },
      ],
    }).lean();

    res.json(results);
  } catch (error) {
    logger.error("Erro ao buscar artistas", { error });
    res.status(500).json({ message: "Erro ao buscar artistas" });
  }
};

export const createArtist = async (req: Request, res: Response) => {
  try {
    const {
      name,
      birthDate,
      email,
      phone,
      socialLink,
      resumeLink,
      portfolioLink,
      gender,
      lgbtqiapn,
      black,
      indigenous,
      pcd,
      categories,
      password,
    } = req.body;

    let profilePictureUrl = "";
    if (req.file) {
      profilePictureUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname, "artists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userIp =
      req.ip ||
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "unknown";

    const newArtist = new Artist({
      name,
      birthDate,
      email,
      phone,
      socialLink,
      resumeLink,
      portfolioLink,
      gender,
      lgbtqiapn,
      black,
      indigenous,
      pcd,
      categories,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
      lgpdConsent: {
        accepted: true,
        acceptedAt: new Date(),
        ipAddress: userIp,
        version: "1.0",
        retroactive: false,
      },
    });

    await newArtist.save();
    logger.info("Artista cadastrado com consentimento LGPD");
    res.status(201).json(newArtist);
  } catch (error) {
    logger.error("Erro ao criar artista", { error });
    res.status(500).json({ message: "Erro ao criar artista" });
  }
};

export const getArtists = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [artists, total] = await Promise.all([
      Artist.find().skip(skip).limit(limit),
      Artist.countDocuments(),
    ]);

    res.json({
      data: artists,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error("Erro ao buscar artistas", { error });
    res.status(500).json({ message: "Erro ao buscar artistas" });
  }
};

export const getArtistById = async (req: Request, res: Response) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artista não encontrado" });
    res.json(artist);
  } catch (error) {
    logger.error("Erro ao buscar artista", { error });
    res.status(500).json({ message: "Erro ao buscar artista" });
  }
};

export const updateArtist = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    const updatedData: Record<string, unknown> = { ...rest };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      updatedData.profilePicture = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        "artists"
      );
    }

    const updatedArtist = await Artist.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });
    if (!updatedArtist) return res.status(404).json({ message: "Artista não encontrado" });

    res.json(updatedArtist);
  } catch (error) {
    logger.error("Erro ao atualizar artista", { error });
    res.status(500).json({ message: "Erro ao atualizar artista" });
  }
};

export const deleteArtist = async (req: Request, res: Response) => {
  try {
    const deletedArtist = await Artist.findByIdAndDelete(req.params.id);
    if (!deletedArtist) return res.status(404).json({ message: "Artista não encontrado" });

    logger.info("Artista deletado (direito LGPD exercido)");
    res.json({ message: "Artista deletado com sucesso" });
  } catch (error) {
    logger.error("Erro ao deletar artista", { error });
    res.status(500).json({ message: "Erro ao deletar artista" });
  }
};
