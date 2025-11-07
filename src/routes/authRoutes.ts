import { Router } from "express";
import { loginArtist } from "../controllers/authController";

const router = Router();

// ✅ Login de Artista
router.post("/login", loginArtist);

export default router;
