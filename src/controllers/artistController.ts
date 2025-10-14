import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Artist from "../models/artistModel";
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

// Helper para transformar Buffer em Stream
const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
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
      console.log("📸 Arquivo recebido pelo multer:", req.file.originalname);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "artists" },
          (error, result) => {
            if (error) {
              console.error("❌ Erro no Cloudinary:", error);
              return reject(error);
            }
            resolve(result?.secure_url || "");
          }
        );
        bufferToStream(req.file.buffer).pipe(uploadStream);
      });

      profilePictureUrl = await uploadPromise;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    });

    await newArtist.save();
    res.status(201).json(newArtist);
  } catch (error) {
    console.error("❌ Erro ao criar artista:", error);
    res.status(500).json({ message: "Erro ao criar artista", error });
  }
};

export const getArtists = async (req: Request, res: Response) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar artistas", error });
  }
};

export const getArtistById = async (req: Request, res: Response) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artista não encontrado" });
    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar artista", error });
  }
};

export const updateArtist = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    let updatedData: any = { ...rest };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      console.log("📸 Atualizando imagem:", req.file.originalname);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "artists" },
          (error, result) => {
            if (error) {
              console.error("❌ Erro no Cloudinary (update):", error);
              return reject(error);
            }
            resolve(result?.secure_url || "");
          }
        );
        bufferToStream(req.file.buffer).pipe(uploadStream);
      });

      updatedData.profilePicture = await uploadPromise;
    }

    const updatedArtist = await Artist.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedArtist) return res.status(404).json({ message: "Artista não encontrado" });

    res.json(updatedArtist);
  } catch (error) {
    console.error("❌ Erro ao atualizar artista:", error);
    res.status(500).json({ message: "Erro ao atualizar artista", error });
  }
};

export const deleteArtist = async (req: Request, res: Response) => {
  try {
    const deletedArtist = await Artist.findByIdAndDelete(req.params.id);
    if (!deletedArtist) return res.status(404).json({ message: "Artista não encontrado" });

    res.json({ message: "Artista deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar artista", error });
  }
};
