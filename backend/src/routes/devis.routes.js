import { Router } from "express";
import {
  createDevis,
  getAllDevis,
  getDevisById,
  updateDevisStatus,
  deleteDevis,
} from "../controllers/devis.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createDevis);
router.get("/", authMiddleware, getAllDevis);
router.get("/:id", getDevisById);
router.put("/:id/status", authMiddleware, updateDevisStatus);
router.delete("/:id", authMiddleware, deleteDevis);

export default router;
