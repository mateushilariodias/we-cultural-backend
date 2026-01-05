import { Router } from "express";
import { loginArtist, loginCollective, loginEquipment } from "../controllers/authController.js";
import { requestPasswordReset, resetPassword } from "../controllers/passwordResetController.js";

const router = Router();

router.post("/login", loginArtist);
router.post("/collective/login", loginCollective);
router.post("/equipment/login", loginEquipment);

router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);


export default router;