import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";
import { loginSchema } from "../validations/auth.validation.js";
import { formatZodError } from "../utils/helpers.js";

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const { email, password } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }

    const token = generateToken(admin.id);

    return res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion.",
    });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.admin,
  });
};
