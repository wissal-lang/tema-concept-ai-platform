import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const optionalClientAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "client") {
      return next();
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

    if (client?.isActive) {
      req.client = client;
    }

    next();
  } catch {
    next();
  }
};

export default optionalClientAuth;
