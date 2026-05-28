import { Request, Response } from "express";
import Event from "../models/eventModel.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import { parseBrazilianDate, parseMultipleDates } from "../utils/parseDate.js";
import { getWeekDates } from "../utils/weekHelper.js";
import logger from "../utils/logger.js";

/**
 * FormData sempre chega como string — faz o parse seguro.
 * Aceita: string JSON, array já pronto, ou undefined.
 */
const parseJsonField = <T>(value: unknown, fallback: T): T => {
  if (value === undefined || value === null || value === "") return fallback;
  if (Array.isArray(value)) return value as unknown as T;
  try {
    return JSON.parse(value as string) as T;
  } catch {
    return fallback;
  }
};

// ─── Controllers ────────────────────────────────────────────────────────────

// POST /api/events
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, dayOfWeek, time, location, address, artist, link, color } =
      req.body;

    // Arrays vindos como JSON string do FormData
    const detailsRaw = parseJsonField<string[]>(req.body.details, []);
    const datesRaw = parseJsonField<string[]>(req.body.dates, []);
    const social = parseJsonField<{ instagram?: string; facebook?: string }>(req.body.social, {});

    // Converter datas
    const parsedDate = parseBrazilianDate(date);
    const parsedDates = parseMultipleDates(datesRaw);

    // Upload de imagem
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname, "events");
    }

    const newEvent = new Event({
      title,
      description,
      date: parsedDate,
      dayOfWeek,
      time,
      location,
      address,
      image: imageUrl,
      details: detailsRaw,
      dates: parsedDates,
      artist,
      link,
      social,
      color,
    });

    await newEvent.save();
    logger.info("Evento criado", { title });

    res.status(201).json({ message: "Evento criado com sucesso", event: newEvent });
  } catch (error) {
    logger.error("Erro ao criar evento", { error });
    res.status(500).json({
      message: "Erro ao criar evento",
      error: (error as Error).message,
    });
  }
};

// GET /api/events  →  apenas eventos da semana atual
export const getEvents = async (_req: Request, res: Response) => {
  try {
    const { weekStart, weekEnd } = getWeekDates();

    const events = await Event.find({
      isActive: true,
      $or: [
        { date: { $gte: weekStart, $lte: weekEnd } },
        { dates: { $elemMatch: { $gte: weekStart, $lte: weekEnd } } },
      ],
    }).sort({ date: 1 });

    logger.info(`Semana: ${weekStart.toLocaleDateString("pt-BR")} → ${weekEnd.toLocaleDateString("pt-BR")} — ${events.length} evento(s)`);

    res.json({
      message: "Eventos da semana recuperados com sucesso",
      week: {
        start: weekStart.toLocaleDateString("pt-BR"),
        end: weekEnd.toLocaleDateString("pt-BR"),
      },
      events,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar eventos",
      error: (error as Error).message,
    });
  }
};

// GET /api/events/all  →  todos os eventos (paginado)
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find({ isActive: true }).sort({ date: 1 }).skip(skip).limit(limit),
      Event.countDocuments({ isActive: true }),
    ]);

    res.json({
      data: events,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar eventos",
      error: (error as Error).message,
    });
  }
};

// GET /api/events/:id
export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Evento não encontrado" });
    res.json({ message: "Evento encontrado", event });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar evento",
      error: (error as Error).message,
    });
  }
};

// PUT /api/events/:id
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, date, dayOfWeek, time, location, address, artist, link, color } =
      req.body;

    const detailsRaw = parseJsonField<string[]>(req.body.details, []);
    const datesRaw = parseJsonField<string[]>(req.body.dates, []);
    const social = parseJsonField<{ instagram?: string; facebook?: string }>(req.body.social, {});

    const parsedDate = parseBrazilianDate(date);
    const parsedDates = parseMultipleDates(datesRaw);

    const updateData: Record<string, unknown> = {
      title,
      description,
      date: parsedDate,
      dayOfWeek,
      time,
      location,
      address,
      details: detailsRaw,
      dates: parsedDates,
      artist,
      link,
      social,
      color,
    };

    if (req.file) {
      updateData.image = await uploadToCloudinary(req.file.buffer, req.file.originalname, "events");
    }

    const updated = await Event.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Evento não encontrado" });

    logger.info("Evento atualizado", { title });
    res.json({ message: "Evento atualizado com sucesso", event: updated });
  } catch (error) {
    logger.error("Erro ao atualizar evento", { error });
    res.status(500).json({
      message: "Erro ao atualizar evento",
      error: (error as Error).message,
    });
  }
};

// DELETE /api/events/:id
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Evento não encontrado" });
    logger.info("Evento deletado", { title: event.title });
    res.json({ message: "Evento deletado com sucesso" });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao deletar evento",
      error: (error as Error).message,
    });
  }
};
