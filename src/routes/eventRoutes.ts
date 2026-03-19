import { Router } from "express";
import multer from "multer";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

const router = Router();

// Configurar multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ ROTAS
router.post("/events", upload.single("image"), createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", upload.single("image"), updateEvent);
router.delete("/events/:id", deleteEvent);

export default router;