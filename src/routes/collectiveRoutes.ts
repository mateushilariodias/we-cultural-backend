import { Router } from "express";
import {
  createCollective,
  getCollectives,
  getCollectiveById,
  updateCollective,
  deleteCollective,
} from "../controllers/collectiveController";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/", upload.single("profilePicture"), createCollective);
router.get("/", getCollectives);
router.get("/:id", getCollectiveById);
router.put("/:id", upload.single("profilePicture"), updateCollective);
router.delete("/:id", deleteCollective);

export default router;
