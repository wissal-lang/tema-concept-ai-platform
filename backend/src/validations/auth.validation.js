import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("L'email n'est pas valide"),
  password: z
    .string({ required_error: "Le mot de passe est obligatoire" })
    .min(1, "Le mot de passe est obligatoire"),
});

export const clientRegisterSchema = z
  .object({
    name: z
      .string({ required_error: "Le nom est obligatoire" })
      .min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z
      .string({ required_error: "L'email est obligatoire" })
      .email("L'email n'est pas valide"),
    phone: z.string().optional(),
    company: z.string().optional(),
    password: z
      .string({ required_error: "Le mot de passe est obligatoire" })
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z
      .string({ required_error: "La confirmation est obligatoire" })
      .min(1, "La confirmation est obligatoire"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "La confirmation du mot de passe ne correspond pas",
    path: ["confirmPassword"],
  });

export const clientLoginSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("L'email n'est pas valide"),
  password: z
    .string({ required_error: "Le mot de passe est obligatoire" })
    .min(1, "Le mot de passe est obligatoire"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("L'email n'est pas valide"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: "Le jeton est obligatoire" }).min(1, "Le jeton est obligatoire"),
    password: z
      .string({ required_error: "Le mot de passe est obligatoire" })
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z
      .string({ required_error: "La confirmation est obligatoire" })
      .min(1, "La confirmation est obligatoire"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "La confirmation du mot de passe ne correspond pas",
    path: ["confirmPassword"],
  });
