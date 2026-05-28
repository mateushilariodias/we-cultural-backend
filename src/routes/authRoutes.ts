import { Router } from "express";
import { loginArtist, loginCollective, loginEquipment } from "../controllers/authController.js";
import { requestPasswordReset, resetPassword } from "../controllers/passwordResetController.js";
import { authLimiter, passwordResetLimiter } from "../middlewares/rateLimiter.js";
import { validateBody } from "../middlewares/validate.js";
import {
  loginArtistSchema,
  loginByNameSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/authSchemas.js";

const router = Router();

router.post("/login", authLimiter, validateBody(loginArtistSchema), loginArtist);
router.post("/collective/login", authLimiter, validateBody(loginByNameSchema), loginCollective);
router.post("/equipment/login", authLimiter, validateBody(loginByNameSchema), loginEquipment);

router.post("/forgot-password", passwordResetLimiter, validateBody(forgotPasswordSchema), requestPasswordReset);
router.post("/reset-password", passwordResetLimiter, validateBody(resetPasswordSchema), resetPassword);

export default router;
