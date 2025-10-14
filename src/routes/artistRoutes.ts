import { Router } from "express";
import {
  createArtist,
  getArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
} from "../controllers/artistController";
import { upload } from "../middlewares/upload";

const router = Router();

// CRUD Artista
router.post("/", upload.single("profilePicture"), createArtist);
router.get("/", getArtists);
router.get("/:id", getArtistById);
router.put("/:id", upload.single("profilePicture"), updateArtist);
router.delete("/:id", deleteArtist);

export default router;
