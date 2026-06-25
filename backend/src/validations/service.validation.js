import { z } from "zod";

export const createServiceSchema = z.object({
  title: z
    .string({ required_error: "Le titre est obligatoire" })
    .min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z
    .string({ required_error: "La description est obligatoire" })
    .min(5, "La description doit contenir au moins 5 caractères"),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export const chatMessageSchema = z.object({
  message: z
    .string({ required_error: "Le message est obligatoire" })
    .min(1, "Le message ne peut pas être vide"),
  conversationId: z.string().optional().nullable(),
  visitorId: z.string().optional().nullable(),
});
