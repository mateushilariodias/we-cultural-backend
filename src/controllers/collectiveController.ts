import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Collective from "../models/collectiveModel.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Helper para transformar Buffer em Stream
const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// CREATE
export const createCollective = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;

    let profilePictureUrl = "";
    
    if (req.file) {
      console.log("📸 Arquivo recebido pelo multer:", req.file.originalname);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "collectives" },
          (error: any, result: any) => {
            if (error) {
              console.error("❌ Erro no Cloudinary:", error);
              return reject(error);
            }
            resolve(result?.secure_url || "");
          }
        );
        bufferToStream(req.file!.buffer).pipe(uploadStream);
      });

      profilePictureUrl = await uploadPromise;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCollective = new Collective({
      ...rest,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
      memberNames: rest.memberNames?.split(",").map((n: string) => n.trim()) || [],
      categories: Array.isArray(rest.categories) ? rest.categories : [rest.categories],
    });

    await newCollective.save();
    res.status(201).json(newCollective);
  } catch (error) {
    console.error("❌ Erro ao criar coletivo:", error);
    res.status(500).json({ message: "Error creating collective", error });
  }
};

// READ ALL
export const getCollectives = async (req: Request, res: Response) => {
  try {
    const collectives = await Collective.find();
    res.json(collectives);
  } catch (error) {
    res.status(500).json({ message: "Error fetching collectives", error });
  }
};

// READ ONE
export const getCollectiveById = async (req: Request, res: Response) => {
  try {
    const collective = await Collective.findById(req.params.id);
    if (!collective) return res.status(404).json({ message: "Collective not found" });
    res.json(collective);
  } catch (error) {
    res.status(500).json({ message: "Error fetching collective", error });
  }
};

// UPDATE
export const updateCollective = async (req: Request, res: Response) => {
  try {
    const { password, memberNames, categories, ...rest } = req.body;
    let updatedData: any = { ...rest };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      console.log("📸 Atualizando imagem:", req.file.originalname);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "collectives" },
          (error: any, result: any) => {
            if (error) {
              console.error("❌ Erro no Cloudinary (update):", error);
              return reject(error);
            }
            resolve(result?.secure_url || "");
          }
        );
        bufferToStream(req.file!.buffer).pipe(uploadStream);
      });

      updatedData.profilePicture = await uploadPromise;
    }

    // Processar memberNames se vier como string
    if (memberNames) {
      if (typeof memberNames === 'string') {
        updatedData.memberNames = memberNames.split(",").map((n: string) => n.trim());
      } else {
        updatedData.memberNames = memberNames;
      }
    }

    // Processar categories
    if (categories) {
      updatedData.categories = Array.isArray(categories) ? categories : [categories];
    }

    const updatedCollective = await Collective.findByIdAndUpdate(
      req.params.id, 
      updatedData, 
      { new: true, runValidators: false } // ← Adicione runValidators: false
    );

    if (!updatedCollective) return res.status(404).json({ message: "Collective not found" });
    res.json(updatedCollective);
  } catch (error) {
    console.error("❌ Erro ao atualizar coletivo:", error);
    res.status(500).json({ message: "Error updating collective", error: (error as Error).message });
  }
};

// DELETE
export const deleteCollective = async (req: Request, res: Response) => {
  try {
    const deletedCollective = await Collective.findByIdAndDelete(req.params.id);
    if (!deletedCollective) return res.status(404).json({ message: "Collective not found" });
    res.json({ message: "Collective deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting collective", error });
  }
};