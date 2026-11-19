import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const authMiddleware = async (req, res, next) => {
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

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé. Administrateur introuvable.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Compte administrateur désactivé.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré.",
    });
  }
};

export const requireAdminRole = (...roles) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Accès non autorisé.",
    });
  }

  if (!roles.includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: "Permissions insuffisantes.",
    });
  }

  next();
};

export default authMiddleware;
