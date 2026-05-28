import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Collective from "../models/collectiveModel.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import logger from "../utils/logger.js";

export const createCollective = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;

    let profilePictureUrl = "";
    if (req.file) {
      profilePictureUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname, "collectives");
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
    logger.error("Erro ao criar coletivo", { error });
    res.status(500).json({ message: "Erro ao criar coletivo" });
  }
};

export const getCollectives = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [collectives, total] = await Promise.all([
      Collective.find().skip(skip).limit(limit),
      Collective.countDocuments(),
    ]);

    res.json({
      data: collectives,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error("Erro ao buscar coletivos", { error });
    res.status(500).json({ message: "Erro ao buscar coletivos" });
  }
};

export const getCollectiveById = async (req: Request, res: Response) => {
  try {
    const collective = await Collective.findById(req.params.id);
    if (!collective) return res.status(404).json({ message: "Coletivo não encontrado" });
    res.json(collective);
  } catch (error) {
    logger.error("Erro ao buscar coletivo", { error });
    res.status(500).json({ message: "Erro ao buscar coletivo" });
  }
};

export const updateCollective = async (req: Request, res: Response) => {
  try {
    const { password, memberNames, categories, ...rest } = req.body;
    const updatedData: Record<string, unknown> = { ...rest };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      updatedData.profilePicture = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        "collectives"
      );
    }

    if (memberNames) {
      updatedData.memberNames =
        typeof memberNames === "string"
          ? memberNames.split(",").map((n: string) => n.trim())
          : memberNames;
    }

    if (categories) {
      updatedData.categories = Array.isArray(categories) ? categories : [categories];
    }

    const updatedCollective = await Collective.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: false,
    });

    if (!updatedCollective) return res.status(404).json({ message: "Coletivo não encontrado" });
    res.json(updatedCollective);
  } catch (error) {
    logger.error("Erro ao atualizar coletivo", { error });
    res.status(500).json({ message: "Erro ao atualizar coletivo" });
  }
};

export const deleteCollective = async (req: Request, res: Response) => {
  try {
    const deletedCollective = await Collective.findByIdAndDelete(req.params.id);
    if (!deletedCollective) return res.status(404).json({ message: "Coletivo não encontrado" });
    res.json({ message: "Coletivo deletado com sucesso" });
  } catch (error) {
    logger.error("Erro ao deletar coletivo", { error });
    res.status(500).json({ message: "Erro ao deletar coletivo" });
  }
};
