import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Artist from "../models/artistModel.js";
import Collective from "../models/collectiveModel.js";
import Equipment from "../models/equipmentModel.js";

// Login de Artista (já existe)
export const loginArtist = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const artist = await Artist.findOne({ email });
    if (!artist) {
      return res.status(404).json({ message: "Artista não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, artist.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: artist._id, email: artist.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      artist: {
        id: artist._id,
        name: artist.name,
        email: artist.email,
        profilePicture: artist.profilePicture,
      },
    });
  } catch (error) {
    console.error("❌ Erro no loginArtist:", error);
    res.status(500).json({ message: "Erro ao realizar login", error });
  }
};

// Login de Coletivo (NOVO)
export const loginCollective = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    const collective = await Collective.findOne({ name });
    if (!collective) {
      return res.status(404).json({ message: "Coletivo não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, collective.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: collective._id, name: collective.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      collective: {
        id: collective._id,
        name: collective.name,
        profilePicture: collective.profilePicture,
      },
    });
  } catch (error) {
    console.error("❌ Erro no loginCollective:", error);
    res.status(500).json({ message: "Erro ao realizar login", error });
  }
};

// Login de Equipamento (NOVO)
export const loginEquipment = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    const equipment = await Equipment.findOne({ name });
    if (!equipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, equipment.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: equipment._id, name: equipment.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      equipment: {
        id: equipment._id,
        name: equipment.name,
        logo: equipment.logo,
      },
    });
  } catch (error) {
    console.error("❌ Erro no loginEquipment:", error);
    res.status(500).json({ message: "Erro ao realizar login", error });
  }
};