import { z } from "zod";

export const createDevisSchema = z.object({
  fullName: z
    .string({ required_error: "Le nom complet est obligatoire" })
    .min(2, "Le nom complet doit contenir au moins 2 caractères"),
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("L'email n'est pas valide"),
  phone: z.string().optional().nullable(),
  projectType: z
    .string({ required_error: "Le type de projet est obligatoire" })
    .min(1, "Le type de projet est obligatoire"),
  budget: z.string().optional().nullable(),
  description: z
    .string({ required_error: "La description est obligatoire" })
    .min(10, "La description doit contenir au moins 10 caractères"),
});

export const updateDevisStatusSchema = z.object({
  status: z.enum(["NOUVELLE", "EN_COURS", "DEVIS_ENVOYE", "CLOTUREE"], {
    errorMap: () => ({ message: "Statut invalide" }),
  }),
});
