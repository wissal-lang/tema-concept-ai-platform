import prisma from "../config/prisma.js";

export const handoffConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const conversation = await prisma.chatConversation.findUnique({ where: { id } });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation introuvable.",
      });
    }

    await prisma.chatConversation.update({
      where: { id },
      data: {
        status: "transferred",
        handoff: true,
      },
    });

    await prisma.chatMessage.create({
      data: {
        conversationId: id,
        sender: "BOT",
        content: message || "Un conseiller humain a pris la main sur cette conversation.",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Conversation transférée à l’équipe humaine.",
      data: { id, handoff: true, status: "transferred" },
    });
  } catch (error) {
    console.error("Erreur transfert conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors du transfert de la conversation.",
    });
  }
};
