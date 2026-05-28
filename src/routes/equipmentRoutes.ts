import { Router } from "express";
import {
  createEquipment,
  getEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} from "../controllers/equipmentController.js";
import { upload } from "../middlewares/upload.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/", upload.single("logo"), createEquipment);
router.get("/", getEquipments);
router.get("/:id", getEquipmentById);
router.put("/:id", requireAuth, upload.single("logo"), updateEquipment);
router.delete("/:id", requireAuth, deleteEquipment);

export default router;
