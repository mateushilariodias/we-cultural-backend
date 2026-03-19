import { Request, Response } from "express";
import Event from "../models/eventModel.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// ✅ CRIAR EVENTO
export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      date,
      dayOfWeek,
      time,
      location,
      address,
      details,
      dates,
      artist,
      link,
      social,
      color,
    } = req.body;

    let imageUrl = "";

    // Upload da imagem se fornecida
    if (req.file) {
      console.log("📸 Fazendo upload da imagem:", req.file.originalname);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "events" },
          (error, result) => {
            if (error) {
              console.error("❌ Erro no Cloudinary:", error);
              return reject(error);
            }
            resolve(result?.secure_url || "");
          }
        );
        bufferToStream(req.file!.buffer).pipe(uploadStream);
      });

      imageUrl = await uploadPromise;
    }

    const newEvent = new Event({
      title,
      description,
      date,
      dayOfWeek,
      time,
      location,
      address,
      image: imageUrl,
      details: Array.isArray(details) ? details : [],
      dates: Array.isArray(dates) ? dates : [],
      artist,
      link,
      social: social ? JSON.parse(social) : {},
      color,
    });

    await newEvent.save();

    console.log("✅ Evento criado com sucesso:", title);

    res.status(201).json({
      message: "Evento criado com sucesso",
      event: newEvent,
    });
  } catch (error) {
    console.error("❌ Erro ao criar evento:", error);
    res.status(500).json({
      message: "Erro ao criar evento",
      error: (error as Error).message,
    });
  }
};

// ✅ LISTAR TODOS OS EVENTOS
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });

    res.json({
      message: "Eventos recuperados com sucesso",
      events,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar eventos",
      error: (error as Error).message,
    });
  }
};

// ✅ BUSCAR EVENTO POR ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    res.json({
      message: "Evento encontrado",
      event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar evento",
      error: (error as Error).message,
    });
  }
};

// ✅ ATUALIZAR EVENTO
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      dayOfWeek,
      time,
      location,
      address,
      details,
      dates,
      artist,
      link,
      social,
      color,
    } = req.body;

    let updateData: any = {
      title,
      description,
      date,
      dayOfWeek,
      time,
      location,
      address,
      details: Array.isArray(details) ? details : [],
      dates: Array.isArray(dates) ? dates : [],
      artist,
      link,
      social: social ? JSON.parse(social) : {},
      color,
      updatedAt: new Date(),
    };

    // Se houver nova imagem
    if (req.file) {
      console.log("📸 Atualizando imagem:", req.file.originalname);

      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "events" },
          (error, result) => {
            if (error) {
              console.error("❌ Erro no Cloudinary:", error);
              return reject(error);
            }
            resolve(result?.secure_url || "");
          }
        );
        bufferToStream(req.file!.buffer).pipe(uploadStream);
      });

      updateData.image = await uploadPromise;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    console.log("✅ Evento atualizado:", title);

    res.json({
      message: "Evento atualizado com sucesso",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar evento:", error);
    res.status(500).json({
      message: "Erro ao atualizar evento",
      error: (error as Error).message,
    });
  }
};

// ✅ DELETAR EVENTO
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    console.log("🗑️ Evento deletado:", event.title);

    res.json({
      message: "Evento deletado com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao deletar evento",
      error: (error as Error).message,
    });
  }
};
