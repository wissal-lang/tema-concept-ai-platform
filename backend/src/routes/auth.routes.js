import { Router } from "express";
import {
  login,
  getMe,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  registerClient,
  loginClient,
  getClientMe,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import clientAuthMiddleware from "../middlewares/client.middleware.js";
import { forgotPassword, resetPassword } from "../controllers/password.controller.js";

const router = Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getMe);
router.get("/admins", authMiddleware, getAllAdmins);
router.post("/admins", authMiddleware, createAdmin);
router.put("/admins/:id", authMiddleware, updateAdmin);
router.delete("/admins/:id", authMiddleware, deleteAdmin);

router.post("/client/register", registerClient);
router.post("/client/login", loginClient);
router.get("/client/me", clientAuthMiddleware, getClientMe);

export default router;
