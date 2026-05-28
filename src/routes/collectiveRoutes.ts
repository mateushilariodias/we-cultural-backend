import { Router } from "express";
import {
  createCollective,
  getCollectives,
  getCollectiveById,
  updateCollective,
  deleteCollective,
} from "../controllers/collectiveController.js";
import { upload } from "../middlewares/upload.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/", upload.single("profilePicture"), createCollective);
router.get("/", getCollectives);
router.get("/:id", getCollectiveById);
router.put("/:id", requireAuth, upload.single("profilePicture"), updateCollective);
router.delete("/:id", requireAuth, deleteCollective);

export default router;
