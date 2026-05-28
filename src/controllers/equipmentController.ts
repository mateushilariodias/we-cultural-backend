import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Equipment from "../models/equipmentModel.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import logger from "../utils/logger.js";

export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;

    let logoUrl = "";
    if (req.file) {
      logoUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname, "equipments");
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
    logger.error("Erro ao criar equipamento", { error });
    res.status(500).json({ message: "Erro ao criar equipamento" });
  }
};

export const getEquipments = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [equipments, total] = await Promise.all([
      Equipment.find().skip(skip).limit(limit),
      Equipment.countDocuments(),
    ]);

    res.json({
      data: equipments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error("Erro ao buscar equipamentos", { error });
    res.status(500).json({ message: "Erro ao buscar equipamentos" });
  }
};

export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipamento não encontrado" });
    res.json(equipment);
  } catch (error) {
    logger.error("Erro ao buscar equipamento", { error });
    res.status(500).json({ message: "Erro ao buscar equipamento" });
  }
};

export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { password, category, ...rest } = req.body;
    const updatedData: Record<string, unknown> = { ...rest };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      updatedData.logo = await uploadToCloudinary(req.file.buffer, req.file.originalname, "equipments");
    }

    if (category) {
      updatedData.category = Array.isArray(category) ? category : [category];
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: false,
    });

    if (!updatedEquipment) return res.status(404).json({ message: "Equipamento não encontrado" });
    res.json(updatedEquipment);
  } catch (error) {
    logger.error("Erro ao atualizar equipamento", { error });
    res.status(500).json({ message: "Erro ao atualizar equipamento" });
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!deletedEquipment) return res.status(404).json({ message: "Equipamento não encontrado" });
    res.json({ message: "Equipamento deletado com sucesso" });
  } catch (error) {
    logger.error("Erro ao deletar equipamento", { error });
    res.status(500).json({ message: "Erro ao deletar equipamento" });
  }
};
