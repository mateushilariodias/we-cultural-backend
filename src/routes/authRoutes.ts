import { Router } from "express";
import { loginArtist, loginCollective, loginEquipment } from "../controllers/authController.js";

const router = Router();

router.post("/login", loginArtist);
router.post("/collective/login", loginCollective);
router.post("/equipment/login", loginEquipment);

export default router;