import { Router } from "express";
import {
  createEquipment,
  getEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} from "../controllers/equipmentController";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/", upload.single("logo"), createEquipment);
router.get("/", getEquipments);
router.get("/:id", getEquipmentById);
router.put("/:id", upload.single("logo"), updateEquipment);
router.delete("/:id", deleteEquipment);

export default router;
