import { z } from "zod";

export const createContactSchema = z.object({
  fullName: z
    .string({ required_error: "Le nom complet est obligatoire" })
    .min(2, "Le nom complet doit contenir au moins 2 caractères"),
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("L'email n'est pas valide"),
  subject: z.string().optional().nullable(),
  message: z
    .string({ required_error: "Le message est obligatoire" })
    .min(5, "Le message doit contenir au moins 5 caractères"),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["NON_LU", "LU", "REPONDU"], {
    errorMap: () => ({ message: "Statut invalide" }),
  }),
});
