import prisma from "../config/prisma.js";

const DEFAULT_SETTINGS = {
  profile: {
    name: "Admin Tema Concept",
    email: "admin@temaconcept.com",
    password: "",
  },
  company: {
    name: "Tema Concept",
    email: "contact@temaconcept.com",
    phone: "+212 5 22 00 00 00",
    address: "Casablanca, Maroc",
    website: "https://temaconcept.com",
  },
  services: {
    displayOrder: "web,mobile,branding",
    autoPublish: true,
  },
  devis: {
    recipientEmail: "devis@temaconcept.com",
    autoReply: true,
    message: "Merci pour votre demande. Notre équipe vous répondra rapidement.",
  },
  chatbot: {
    enabled: true,
    name: "Tema Assistant",
    welcomeMessage: "Bonjour, comment puis-je vous aider ?",
    tone: "professionnel",
  },
  notifications: {
    devis: true,
    contact: true,
    chatbot: true,
    dashboard: true,
  },
  security: {
    require2FA: false,
    sessionTimeout: "60",
    autoLogout: true,
  },
};

const normalizeSettingValue = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const getAllSettings = async (req, res) => {
  try {
    const settings = await prisma.platformSetting.findMany({
      orderBy: { updatedAt: "desc" },
    });

    const merged = settings.reduce((acc, setting) => {
      acc[setting.key] = normalizeSettingValue(setting.value);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        ...DEFAULT_SETTINGS,
        ...merged,
      },
    });
  } catch (error) {
    console.error("Erreur récupération réglages:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des réglages.",
    });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const payload = typeof value === "string" ? value : JSON.stringify(value);

    const savedSetting = await prisma.platformSetting.upsert({
      where: { key },
      update: { value: payload },
      create: {
        key,
        value: payload,
        category: key,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Réglage enregistré.",
      data: {
        key: savedSetting.key,
        value: normalizeSettingValue(savedSetting.value),
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour réglage:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'enregistrement du réglage.",
    });
  }
};
