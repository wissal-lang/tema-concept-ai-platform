import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("L'email n'est pas valide"),
  password: z
    .string({ required_error: "Le mot de passe est obligatoire" })
    .min(1, "Le mot de passe est obligatoire"),
});
