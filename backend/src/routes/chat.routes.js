import { Router } from "express";
import {
  sendChatMessage,
  getConversations,
  getConversationById,
} from "../controllers/chat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", sendChatMessage);
router.get("/conversations", authMiddleware, getConversations);
router.get("/conversations/:id", getConversationById);

export default router;
