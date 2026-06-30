import { Router } from "express";
import {
  login,
  getMe,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get("/admins", authMiddleware, getAllAdmins);
router.post("/admins", authMiddleware, createAdmin);
router.put("/admins/:id", authMiddleware, updateAdmin);
router.delete("/admins/:id", authMiddleware, deleteAdmin);

export default router;
