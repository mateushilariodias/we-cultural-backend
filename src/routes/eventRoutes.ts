import { Router } from "express";
import multer from "multer";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
} from "../controllers/eventController.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST com upload de imagem (rota única, sem duplicata)
router.post("/events", upload.single("image"), createEvent);
router.get("/events", getEvents);
router.get("/events/all", getAllEvents);   // deve vir ANTES de /events/:id
router.get("/events/:id", getEventById);
router.put("/events/:id", upload.single("image"), updateEvent);
router.delete("/events/:id", deleteEvent);

export default router;