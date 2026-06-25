import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import devisRoutes from "./routes/devis.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import prisma from "./config/prisma.js";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

console.log("DATABASE_URL chargée :", process.env.DATABASE_URL ? "Oui" : "Non");

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Tema Concept fonctionne correctement" });
});

app.use("/api/auth", authRoutes);
app.use("/api/devis", devisRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/chat", chatRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable.",
  });
});

app.use((err, req, res, next) => {
  console.error("Erreur globale:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur.",
  });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Connexion Prisma établie.");

    app.listen(PORT, () => {
      console.log(`Serveur Tema Concept démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de connexion à la base de données :", error);
    process.exit(1);
  }
};

startServer();

export default app;
