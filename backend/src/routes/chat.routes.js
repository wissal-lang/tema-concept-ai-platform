import { Router } from "express";
import {
  sendChatMessage,
  getConversations,
  getClientConversations,
  getConversationById,
} from "../controllers/chat.controller.js";
import { handoffConversation, requestSupportConversation } from "../controllers/chat.handoff.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import clientAuthMiddleware from "../middlewares/client.middleware.js";
import optionalClientAuth from "../middlewares/optionalClient.middleware.js";

const router = Router();

router.post("/", optionalClientAuth, sendChatMessage);
router.get("/conversations", authMiddleware, getConversations);
router.get("/client/conversations", clientAuthMiddleware, getClientConversations);
router.get("/conversations/:id", optionalClientAuth, getConversationById);
router.post("/conversations/:id/support-request", clientAuthMiddleware, requestSupportConversation);
router.post("/conversations/:id/handoff", authMiddleware, handoffConversation);

export default router;
