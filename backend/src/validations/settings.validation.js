import { z } from "zod";

export const SETTING_KEYS = [
  "profile",
  "chatbot",
  "company",
  "services",
  "devis",
  "notifications",
  "security",
];

const looseBoolean = z.boolean();

export const profileSettingSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
    email: z.string().trim().email("L'email n'est pas valide").optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .optional()
      .or(z.literal("")),
    currentPassword: z
      .string()
      .min(1, "Le mot de passe actuel est obligatoire")
      .optional()
      .or(z.literal("")),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Aucune donnée de profil à mettre à jour.",
  })
  .superRefine((value, ctx) => {
    if (value.password && !value.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "Veuillez saisir votre mot de passe actuel avant de définir un nouveau mot de passe.",
      });
    }
  });

export const chatbotSettingSchema = z
  .object({
    enabled: looseBoolean.optional(),
    name: z.string().trim().min(2).max(80).optional(),
    welcomeMessage: z.string().trim().min(1).max(500).optional(),
    tone: z.string().trim().min(2).max(50).optional(),
    systemPrompt: z.string().trim().min(10, "Le prompt système est trop court").max(4000).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Aucune donnée chatbot à mettre à jour.",
  });

export const companySettingSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().max(40).optional(),
    address: z.string().trim().max(255).optional(),
    website: z.string().trim().url().optional().or(z.literal("")),
  })
  .strict();

export const servicesSettingSchema = z
  .object({
    displayOrder: z.string().trim().optional(),
    autoPublish: looseBoolean.optional(),
  })
  .strict();

export const devisSettingSchema = z
  .object({
    recipientEmail: z.string().trim().email().optional(),
    autoReply: looseBoolean.optional(),
    message: z.string().trim().max(1000).optional(),
  })
  .strict();

export const notificationsSettingSchema = z
  .object({
    devis: looseBoolean.optional(),
    contact: looseBoolean.optional(),
    chatbot: looseBoolean.optional(),
    dashboard: looseBoolean.optional(),
  })
  .strict();

export const securitySettingSchema = z
  .object({
    require2FA: looseBoolean.optional(),
    sessionTimeout: z.string().trim().regex(/^\d+$/, "Le délai de session doit être numérique").optional(),
    autoLogout: looseBoolean.optional(),
  })
  .strict();

export const settingValueSchemas = {
  profile: profileSettingSchema,
  chatbot: chatbotSettingSchema,
  company: companySettingSchema,
  services: servicesSettingSchema,
  devis: devisSettingSchema,
  notifications: notificationsSettingSchema,
  security: securitySettingSchema,
};

export const settingKeySchema = z.enum(SETTING_KEYS);

export const updateSettingSchema = z.object({
  value: z.unknown({ required_error: "La valeur du réglage est obligatoire." }),
});

export const bulkSettingsSchema = z
  .object(
    Object.fromEntries(SETTING_KEYS.map((key) => [key, z.unknown().optional()]))
  )
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "Aucun réglage à mettre à jour.",
  });
