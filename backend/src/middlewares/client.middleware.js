import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const clientAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé. Token manquant.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "client") {
      return res.status(403).json({
        success: false,
        message: "Accès réservé aux clients.",
      });
    }

    const client = await prisma.client.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!client) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé. Client introuvable.",
      });
    }

    if (!client.isActive) {
      return res.status(403).json({
        success: false,
        message: "Compte client désactivé.",
      });
    }

    req.client = client;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré.",
    });
  }
};

export default clientAuthMiddleware;
