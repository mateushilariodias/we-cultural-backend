import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Artist from "../models/artistModel";

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
