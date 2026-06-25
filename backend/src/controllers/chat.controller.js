import prisma from "../config/prisma.js";
import { chatMessageSchema } from "../validations/service.validation.js";
import { formatZodError } from "../utils/helpers.js";

const generateBotResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("site web")) {
    return "Très bien. Je peux vous aider à préparer une demande de devis pour un site web. Quel type de site souhaitez-vous créer ?";
  }

  if (lowerMessage.includes("devis")) {
    return "Vous pouvez créer une demande de devis en précisant votre besoin, votre budget et vos coordonnées.";
  }

  if (lowerMessage.includes("service")) {
    return "Tema Concept propose plusieurs services : création de sites web, applications, branding, marketing digital et assistance IA.";
  }

  if (lowerMessage.includes("contact")) {
    return "Vous pouvez nous contacter via le formulaire de contact ou demander à parler avec un conseiller.";
  }

  return "Merci pour votre message. Pouvez-vous préciser votre besoin afin que je puisse mieux vous aider ?";
};

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
    } else {
      conversation = await prisma.chatConversation.create({
        data: { visitorId: visitorId || null },
      });
    }

    const botReply = generateBotResponse(message);

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
          content: botReply,
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
        reply: botReply,
        messages,
      },
    });
  } catch (error) {
    console.error("Erreur chat:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'envoi du message.",
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      orderBy: { createdAt: "desc" },
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
        visitorId: conv.visitorId,
        createdAt: conv.createdAt,
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

export const getConversationById = async (req, res) => {
  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: req.params.id },
      include: {
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
