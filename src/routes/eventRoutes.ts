import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
} from "../controllers/eventController.js";
import { upload } from "../middlewares/upload.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { createEventSchema } from "../schemas/eventSchemas.js";

const router = Router();

router.post("/events", requireAuth, upload.single("image"), validateBody(createEventSchema), createEvent);
router.get("/events", getEvents);
router.get("/events/all", getAllEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", requireAuth, upload.single("image"), updateEvent);
router.delete("/events/:id", requireAuth, deleteEvent);

export default router;
