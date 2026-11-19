import prisma from "../config/prisma.js";
import { chatMessageSchema } from "../validations/service.validation.js";
import { formatZodError } from "../utils/helpers.js";
import { getEffectiveChatbotSettings } from "./settings.controller.js";
import { generateChatReply } from "../services/ai.service.js";

const SUPPORT_TRIGGERS = [
  "conseiller",
  "support",
  "humain",
  "personne",
  "urgent",
  "urgence",
  "réclamation",
  "reclamation",
  "plainte",
  "problème",
  "probleme",
  "ça ne marche pas",
  "ca ne marche pas",
  "tu ne comprends pas",
  "contrat",
  "prix exact",
  "devis exact",
];

const detectSupportNeed = (message) => {
  const normalized = message.toLowerCase();
  const matchedTrigger = SUPPORT_TRIGGERS.find((trigger) => normalized.includes(trigger));

  if (!matchedTrigger) {
    return { needsSupport: false, reason: null };
  }

  return {
    needsSupport: true,
    reason: `Déclencheur détecté : ${matchedTrigger}`,
  };
};

const SUPPORT_LOGIN_REQUIRED_REPLY =
  "Pour parler au support Tema Concept, vous devez d'abord vous connecter à votre compte. Ensuite, je pourrai transmettre votre conversation à un conseiller.";

export const sendChatMessage = async (req, res) => {
  try {
    const parsed = chatMessageSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const { message, conversationId, visitorId } = parsed.data;
    const chatbotSettings = await getEffectiveChatbotSettings();

    if (!chatbotSettings.enabled) {
      return res.status(503).json({
        success: false,
        message: "L'assistant IA est actuellement désactivé.",
      });
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation introuvable.",
        });
      }

      if (req.client && conversation.clientId && conversation.clientId !== req.client.id) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé à cette conversation.",
        });
      }

      if (req.client && !conversation.clientId) {
        conversation = await prisma.chatConversation.update({
          where: { id: conversation.id },
          data: { clientId: req.client.id },
        });
      }
    } else {
      conversation = await prisma.chatConversation.create({
        data: {
          visitorId: visitorId || null,
          clientId: req.client?.id || null,
          status: "active",
          handoff: false,
        },
      });
    }

    const supportDecision = detectSupportNeed(message);

    if (conversation.handoff || conversation.status === "needs_support" || conversation.status === "transferred") {
      if (!req.client) {
        await prisma.chatMessage.createMany({
          data: [
            {
              conversationId: conversation.id,
              sender: "USER",
              content: message,
            },
            {
              conversationId: conversation.id,
              sender: "BOT",
              content: SUPPORT_LOGIN_REQUIRED_REPLY,
            },
          ],
        });

        const messages = await prisma.chatMessage.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: "asc" },
        });

        return res.status(200).json({
          success: true,
          data: {
            conversationId: conversation.id,
            reply: SUPPORT_LOGIN_REQUIRED_REPLY,
            messages,
            handoff: false,
            status: "active",
            awaitingSupport: false,
          },
        });
      }

      await prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          sender: "USER",
          content: message,
        },
      });

      await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      const messages = await prisma.chatMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
      });

      return res.status(200).json({
        success: true,
        data: {
          conversationId: conversation.id,
          reply: null,
          messages,
          handoff: true,
          status: conversation.status,
          awaitingSupport: true,
        },
      });
    }

    if (supportDecision.needsSupport) {
      if (!req.client) {
        await prisma.chatMessage.createMany({
          data: [
            {
              conversationId: conversation.id,
              sender: "USER",
              content: message,
            },
            {
              conversationId: conversation.id,
              sender: "BOT",
              content: SUPPORT_LOGIN_REQUIRED_REPLY,
            },
          ],
        });

        const messages = await prisma.chatMessage.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: "asc" },
        });

        return res.status(200).json({
          success: true,
          data: {
            conversationId: conversation.id,
            reply: SUPPORT_LOGIN_REQUIRED_REPLY,
            messages,
            handoff: false,
            status: "active",
            supportReason: supportDecision.reason,
          },
        });
      }

      const supportReply = "Je vais transmettre votre conversation à un conseiller Tema Concept. Le support pourra reprendre avec le contexte déjà fourni.";

      await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: {
          status: "needs_support",
          handoff: true,
        },
      });

      await prisma.chatMessage.createMany({
        data: [
          {
            conversationId: conversation.id,
            sender: "USER",
            content: message,
          },
          {
            conversationId: conversation.id,
            sender: "BOT",
            content: supportReply,
          },
        ],
      });

      const messages = await prisma.chatMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
      });

      return res.status(200).json({
        success: true,
        data: {
          conversationId: conversation.id,
          reply: supportReply,
          messages,
          handoff: true,
          status: "needs_support",
          supportReason: supportDecision.reason,
        },
      });
    }

    const history = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "USER",
        content: message,
      },
    });

    let botReply;
    try {
      botReply = await generateChatReply({
        message,
        history: history.reverse(),
        chatbotSettings,
      });
    } catch (aiError) {
      console.error("Erreur génération réponse IA:", aiError);
      botReply =
        "Je rencontre une difficulté technique pour répondre pour le moment. Votre message a bien été enregistré — un conseiller pourra vous répondre.";
    }

    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "BOT",
        content: botReply,
      },
    });

    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation.id,
        reply: botReply,
        messages,
        handoff: conversation.handoff,
        status: conversation.status,
      },
    });
  } catch (error) {
    console.error("Erreur chat:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.status
        ? error.message
        : "Erreur serveur lors de l'envoi du message.",
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const formatted = conversations.map((conv) => {
      const lastMessage = conv.messages[conv.messages.length - 1];
      const firstUserMessage = conv.messages.find((m) => m.sender === "USER");

      return {
        id: conv.id,
        visitorId: conv.visitorId,
        clientId: conv.clientId,
        clientName: conv.client?.name || null,
        clientEmail: conv.client?.email || null,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        status: conv.status,
        handoff: conv.handoff,
        messagesCount: conv.messages.length,
        lastMessage: lastMessage?.content || "",
        subject: firstUserMessage
          ? firstUserMessage.content.slice(0, 50)
          : "Nouvelle conversation",
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Erreur récupération conversations:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des conversations.",
    });
  }
};

export const getClientConversations = async (req, res) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      where: { clientId: req.client.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const formatted = conversations.map((conv) => {
      const lastMessage = conv.messages[conv.messages.length - 1];
      const firstUserMessage = conv.messages.find((m) => m.sender === "USER");

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        status: conv.status,
        handoff: conv.handoff,
        messagesCount: conv.messages.length,
        lastMessage: lastMessage?.content || "",
        subject: firstUserMessage
          ? firstUserMessage.content.slice(0, 50)
          : "Nouvelle conversation",
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Erreur récupération conversations client:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de vos conversations.",
    });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: req.params.id },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation introuvable.",
      });
    }

    if (req.client && conversation.clientId && conversation.clientId !== req.client.id) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé à cette conversation.",
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Erreur récupération conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de la conversation.",
    });
  }
};
