import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Artist from "../models/artistModel";

export const loginArtist = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Verificar se o artista existe
    const artist = await Artist.findOne({ email });
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, artist.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid password" });

    // Gerar JWT
    const token = jwt.sign(
      { id: artist._id, email: artist.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, artist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in", error });
  }
};
