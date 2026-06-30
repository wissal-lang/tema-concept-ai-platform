import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";
import { loginSchema } from "../validations/auth.validation.js";
import { formatZodError } from "../utils/helpers.js";

const ADMIN_ROLE_LABELS = {
  SUPER_ADMIN: "Admin principal",
  ADMIN: "Admin simple",
  SUPPORT: "Agent support",
};

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

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: admins.map((admin) => ({
        ...admin,
        roleLabel: ADMIN_ROLE_LABELS[admin.role],
      })),
    });
  } catch (error) {
    console.error("Erreur récupération admins:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des administrateurs.",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, isActive } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "La confirmation du mot de passe ne correspond pas.",
      });
    }

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Un administrateur avec cet email existe déjà.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "ADMIN",
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Administrateur ajouté avec succès.",
      data: {
        ...admin,
        roleLabel: ADMIN_ROLE_LABELS[admin.role],
      },
    });
  } catch (error) {
    console.error("Erreur création admin:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'ajout de l'administrateur.",
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, password } = req.body;

    const existingAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: "Administrateur introuvable.",
      });
    }

    const data = {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(role ? { role } : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    };

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Administrateur mis à jour avec succès.",
      data: {
        ...updatedAdmin,
        roleLabel: ADMIN_ROLE_LABELS[updatedAdmin.role],
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour admin:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour de l'administrateur.",
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrateur introuvable.",
      });
    }

    await prisma.admin.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Administrateur supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur suppression admin:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression de l'administrateur.",
    });
  }
};
