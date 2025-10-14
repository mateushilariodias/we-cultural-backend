import { Router } from "express";
import { loginArtist } from "../controllers/authController";

const router = Router();

// POST /api/auth/login
router.post("/login", loginArtist);

export default router;
