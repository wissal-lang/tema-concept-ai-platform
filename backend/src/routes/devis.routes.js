import { Router } from "express";
import {
  createDevis,
  getAllDevis,
  getMyDevis,
  getDevisById,
  updateDevisStatus,
  deleteDevis,
} from "../controllers/devis.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import clientAuthMiddleware from "../middlewares/client.middleware.js";

const router = Router();

router.post("/", createDevis);
router.get("/mine", clientAuthMiddleware, getMyDevis);
router.get("/", authMiddleware, getAllDevis);
router.get("/:id", getDevisById);
router.put("/:id/status", authMiddleware, updateDevisStatus);
router.delete("/:id", authMiddleware, deleteDevis);

export default router;
