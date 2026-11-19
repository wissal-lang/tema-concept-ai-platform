import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { formatZodError } from "../utils/helpers.js";
import {
  SETTING_KEYS,
  bulkSettingsSchema,
  settingKeySchema,
  settingValueSchemas,
  updateSettingSchema,
} from "../validations/settings.validation.js";

export const DEFAULT_SETTINGS = Object.freeze({
  profile: {
    name: "Admin Tema Concept",
    email: "admin@temaconcept.com",
    password: "",
    currentPassword: "",
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
    systemPrompt:
      "Vous êtes Tema Assistant, un conseiller professionnel pour Tema Concept. Répondez de manière claire, concise et utile.",
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
});

const SENSITIVE_KEYS = new Set(["profile"]);

const jsonResponse = (res, status, payload) => res.status(status).json(payload);

const parseStoredValue = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const cleanProfile = (admin) => ({
  name: admin?.name ?? DEFAULT_SETTINGS.profile.name,
  email: admin?.email ?? DEFAULT_SETTINGS.profile.email,
  password: "",
  currentPassword: "",
});

const serializeSetting = (value) => JSON.stringify(value);

const validateKey = (key) => {
  const parsed = settingKeySchema.safeParse(key);
  return parsed.success ? parsed.data : null;
};

const validateValue = (key, value) => {
  const schema = settingValueSchemas[key];
  if (!schema) return { success: false, message: "Clé de réglage non supportée." };

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return { success: false, message: formatZodError(parsed.error) };
  }

  return { success: true, data: parsed.data };
};

const getStoredSettingsMap = async () => {
  const rows = await prisma.platformSetting.findMany({
    where: { key: { in: SETTING_KEYS.filter((key) => !SENSITIVE_KEYS.has(key)) } },
    orderBy: { updatedAt: "desc" },
  });

  return rows.reduce((acc, setting) => {
    acc[setting.key] = parseStoredValue(setting.value);
    return acc;
  }, {});
};

const buildSettingsPayload = async (admin) => {
  const stored = await getStoredSettingsMap();

  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    profile: cleanProfile(admin),
  };
};

const upsertPlatformSetting = async (key, value, tx = prisma) => {
  const existing = await tx.platformSetting.findUnique({
    where: { key },
    select: { value: true },
  });

  const sanitized = {
    ...DEFAULT_SETTINGS[key],
    ...(existing ? parseStoredValue(existing.value) : {}),
    ...value,
  };

  return tx.platformSetting.upsert({
    where: { key },
    update: {
      value: serializeSetting(sanitized),
      category: key,
    },
    create: {
      key,
      value: serializeSetting(sanitized),
      category: key,
    },
  });
};

const updateAdminProfile = async (adminId, value, tx = prisma) => {
  const data = {};

  if (value.name) data.name = value.name;
  if (value.email) {
    const existing = await tx.admin.findUnique({
      where: { email: value.email },
      select: { id: true },
    });

    if (existing && existing.id !== adminId) {
      const error = new Error("Un administrateur avec cet email existe déjà.");
      error.status = 409;
      throw error;
    }

    data.email = value.email;
  }

  if (value.password) {
    const admin = await tx.admin.findUnique({
      where: { id: adminId },
      select: { password: true },
    });

    if (!admin) {
      const error = new Error("Administrateur introuvable.");
      error.status = 404;
      throw error;
    }

    const isCurrentPasswordValid = await bcrypt.compare(value.currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      const error = new Error("Le mot de passe actuel est incorrect.");
      error.status = 400;
      throw error;
    }

    data.password = await bcrypt.hash(value.password, 10);
  }

  if (Object.keys(data).length === 0) {
    return tx.admin.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true },
    });
  }

  return tx.admin.update({
    where: { id: adminId },
    data,
    select: { id: true, name: true, email: true },
  });
};

const updateSingleSetting = async ({ adminId, key, value, tx = prisma }) => {
  const validation = validateValue(key, value);
  if (!validation.success) {
    const error = new Error(validation.message);
    error.status = 400;
    throw error;
  }

  if (key === "profile") {
    const admin = await updateAdminProfile(adminId, validation.data, tx);
    return cleanProfile(admin);
  }

  const savedSetting = await upsertPlatformSetting(key, validation.data, tx);
  return parseStoredValue(savedSetting.value);
};

export const getSettingsMeta = async (_req, res) => {
  return jsonResponse(res, 200, {
    success: true,
    data: {
      keys: SETTING_KEYS,
      sensitiveKeys: Array.from(SENSITIVE_KEYS),
      writableKeys: SETTING_KEYS,
      defaults: DEFAULT_SETTINGS,
    },
  });
};

export const getAllSettings = async (req, res) => {
  try {
    const settings = await buildSettingsPayload(req.admin);

    return jsonResponse(res, 200, {
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Erreur récupération réglages:", error);
    return jsonResponse(res, 500, {
      success: false,
      message: "Erreur serveur lors de la récupération des réglages.",
    });
  }
};

export const getSettingByKey = async (req, res) => {
  try {
    const key = validateKey(req.params.key);
    if (!key) {
      return jsonResponse(res, 404, {
        success: false,
        message: "Réglage introuvable.",
      });
    }

    const settings = await buildSettingsPayload(req.admin);

    return jsonResponse(res, 200, {
      success: true,
      data: {
        key,
        value: settings[key],
      },
    });
  } catch (error) {
    console.error("Erreur récupération réglage:", error);
    return jsonResponse(res, 500, {
      success: false,
      message: "Erreur serveur lors de la récupération du réglage.",
    });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const key = validateKey(req.params.key);
    if (!key) {
      return jsonResponse(res, 404, {
        success: false,
        message: "Réglage introuvable.",
      });
    }

    const parsedBody = updateSettingSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return jsonResponse(res, 400, {
        success: false,
        message: formatZodError(parsedBody.error),
      });
    }

    const value = await updateSingleSetting({
      adminId: req.admin.id,
      key,
      value: parsedBody.data.value,
    });

    return jsonResponse(res, 200, {
      success: true,
      message: "Réglage enregistré.",
      data: { key, value },
    });
  } catch (error) {
    console.error("Erreur mise à jour réglage:", error);
    return jsonResponse(res, error.status || 500, {
      success: false,
      message: error.status
        ? error.message
        : "Erreur serveur lors de l'enregistrement du réglage.",
    });
  }
};

export const updateSettingsBulk = async (req, res) => {
  try {
    const parsed = bulkSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return jsonResponse(res, 400, {
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const entries = Object.entries(parsed.data).filter(([, value]) => value !== undefined);
      const result = {};

      for (const [key, value] of entries) {
        result[key] = await updateSingleSetting({
          adminId: req.admin.id,
          key,
          value,
          tx,
        });
      }

      return result;
    });

    return jsonResponse(res, 200, {
      success: true,
      message: "Réglages enregistrés.",
      data: updated,
    });
  } catch (error) {
    console.error("Erreur mise à jour réglages:", error);
    return jsonResponse(res, error.status || 500, {
      success: false,
      message: error.status
        ? error.message
        : "Erreur serveur lors de l'enregistrement des réglages.",
    });
  }
};

export const resetSetting = async (req, res) => {
  try {
    const key = validateKey(req.params.key);
    if (!key) {
      return jsonResponse(res, 404, {
        success: false,
        message: "Réglage introuvable.",
      });
    }

    if (key === "profile") {
      return jsonResponse(res, 400, {
        success: false,
        message: "Le profil administrateur ne peut pas être réinitialisé automatiquement.",
      });
    }

    await prisma.platformSetting.deleteMany({ where: { key } });

    return jsonResponse(res, 200, {
      success: true,
      message: "Réglage réinitialisé.",
      data: {
        key,
        value: DEFAULT_SETTINGS[key],
      },
    });
  } catch (error) {
    console.error("Erreur réinitialisation réglage:", error);
    return jsonResponse(res, 500, {
      success: false,
      message: "Erreur serveur lors de la réinitialisation du réglage.",
    });
  }
};

export const resetAllSettings = async (req, res) => {
  try {
    await prisma.platformSetting.deleteMany({
      where: { key: { in: SETTING_KEYS.filter((key) => !SENSITIVE_KEYS.has(key)) } },
    });

    const settings = await buildSettingsPayload(req.admin);

    return jsonResponse(res, 200, {
      success: true,
      message: "Réglages plateforme réinitialisés.",
      data: settings,
    });
  } catch (error) {
    console.error("Erreur réinitialisation réglages:", error);
    return jsonResponse(res, 500, {
      success: false,
      message: "Erreur serveur lors de la réinitialisation des réglages.",
    });
  }
};

export const getEffectiveChatbotSettings = async () => {
  const setting = await prisma.platformSetting.findUnique({
    where: { key: "chatbot" },
  });

  return {
    ...DEFAULT_SETTINGS.chatbot,
    ...(setting ? parseStoredValue(setting.value) : {}),
  };
};
