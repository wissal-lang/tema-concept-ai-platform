import { Router } from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from "../controllers/contact.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createContact);
router.get("/", authMiddleware, getAllContacts);
router.get("/:id", getContactById);
router.put("/:id/status", authMiddleware, updateContactStatus);
router.delete("/:id", authMiddleware, deleteContact);

export default router;
