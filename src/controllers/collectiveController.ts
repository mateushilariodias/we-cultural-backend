import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Collective from "../models/collectiveModel";
import cloudinary from "../config/cloudinary";

// CREATE
export const createCollective = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;

    let profilePictureUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "collectives" });
      profilePictureUrl = result.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCollective = new Collective({
      ...rest,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
      memberNames: rest.memberNames?.split(",").map((n: string) => n.trim()),
      categories: rest.categories instanceof Array ? rest.categories : [rest.categories],
    });

    await newCollective.save();
    res.status(201).json(newCollective);
  } catch (error) {
    console.error(error);
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
    const { password, ...rest } = req.body;
    let updatedData = { ...rest };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData = { ...rest, password: hashedPassword };
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "collectives" });
      updatedData.profilePicture = result.secure_url;
    }

    if (rest.memberNames) {
      updatedData.memberNames = rest.memberNames.split(",").map((n: string) => n.trim());
    }

    if (rest.categories && !(rest.categories instanceof Array)) {
      updatedData.categories = [rest.categories];
    }

    const updatedCollective = await Collective.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedCollective) return res.status(404).json({ message: "Collective not found" });
    res.json(updatedCollective);
  } catch (error) {
    res.status(500).json({ message: "Error updating collective", error });
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
