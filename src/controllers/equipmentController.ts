import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Equipment from "../models/equipmentModel";
import cloudinary from "../config/cloudinary";

// CREATE
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;

    let logoUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "equipment" });
      logoUrl = result.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEquipment = new Equipment({
      ...rest,
      password: hashedPassword,
      logo: logoUrl,
      category: rest.category instanceof Array ? rest.category : [rest.category],
      address: {
        street: rest.rua,
        neighborhood: rest.bairro,
        city: rest.cidade,
        state: rest.estado,
        zip: rest.cep,
      },
    });

    await newEquipment.save();
    res.status(201).json(newEquipment);
  } catch (error) {
    console.error(error);
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
    let updatedData = { ...rest };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "equipment" });
      updatedData.logo = result.secure_url;
    }

    if (rest.category && !(rest.category instanceof Array)) {
      updatedData.category = [rest.category];
    }

    if (rest.rua || rest.bairro || rest.cidade || rest.estado || rest.cep) {
      updatedData.address = {
        street: rest.rua,
        neighborhood: rest.bairro,
        city: rest.cidade,
        state: rest.estado,
        zip: rest.cep,
      };
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedEquipment) return res.status(404).json({ message: "Equipment not found" });
    res.json(updatedEquipment);
  } catch (error) {
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
