import { Router } from "express";
import {
  createArtist,
  getArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  searchArtists,
} from "../controllers/artistController.js";
import { upload } from "../middlewares/upload.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { createArtistSchema } from "../schemas/artistSchemas.js";

const router = Router();

router.get("/search", searchArtists);
router.post("/", upload.single("profilePicture"), validateBody(createArtistSchema), createArtist);
router.get("/", getArtists);
router.get("/:id", getArtistById);
router.put("/:id", requireAuth, upload.single("profilePicture"), updateArtist);
router.delete("/:id", requireAuth, deleteArtist);

export default router;
