import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Equipment from "../models/equipmentModel.js";
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
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;

    let logoUrl = "";
    
    if (req.file) {
      console.log("📸 Arquivo recebido pelo multer:", req.file.originalname);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "equipments" },
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

      logoUrl = await uploadPromise;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEquipment = new Equipment({
      ...rest,
      password: hashedPassword,
      logo: logoUrl,
      category: Array.isArray(rest.category) ? rest.category : [rest.category],
    });

    await newEquipment.save();
    res.status(201).json(newEquipment);
  } catch (error) {
    console.error("❌ Erro ao criar equipamento:", error);
    res.status(500).json({ message: "Error creating equipment", error });
  }
};

// READ ALL
export const getEquipments = async (req: Request, res: Response) => {
  try {
    const equipments = await Equipment.find();
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching equipments", error });
  }
};

// READ ONE
export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching equipment", error });
  }
};

// UPDATE
export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    let updatedData: any = { ...rest };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      console.log("📸 Atualizando logo:", req.file.originalname);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "equipments" },
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

      updatedData.logo = await uploadPromise;
    }

    if (rest.category && !Array.isArray(rest.category)) {
      updatedData.category = [rest.category];
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedEquipment) return res.status(404).json({ message: "Equipment not found" });
    res.json(updatedEquipment);
  } catch (error) {
    console.error("❌ Erro ao atualizar equipamento:", error);
    res.status(500).json({ message: "Error updating equipment", error });
  }
};

// DELETE
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!deletedEquipment) return res.status(404).json({ message: "Equipment not found" });
    res.json({ message: "Equipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting equipment", error });
  }
};