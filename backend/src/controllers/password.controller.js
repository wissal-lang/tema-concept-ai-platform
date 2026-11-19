import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { forgotPasswordSchema, resetPasswordSchema } from "../validations/auth.validation.js";
import { formatZodError } from "../utils/helpers.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

export const forgotPassword = async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const email = parsed.data.email.toLowerCase();
    const client = await prisma.client.findUnique({ where: { email } });

    let debugResetUrl = null;

    if (client?.isActive) {
      await prisma.passwordResetToken.deleteMany({
        where: {
          clientId: client.id,
          usedAt: null,
        },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await prisma.passwordResetToken.create({
        data: {
          clientId: client.id,
          token,
          expiresAt,
        },
      });

      const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

      try {
        const emailResult = await sendPasswordResetEmail(client, resetUrl);
        if (!emailResult.sent) {
          console.warn(`Lien de réinitialisation (email non envoyé) : ${resetUrl}`);
          if (process.env.NODE_ENV !== "production") {
            debugResetUrl = resetUrl;
          }
        }
      } catch (emailError) {
        console.error("Erreur envoi email réinitialisation:", emailError?.message || emailError);
        if (process.env.NODE_ENV !== "production") {
          debugResetUrl = resetUrl;
          console.warn("──────────────────────────────────────────────");
          console.warn("MODE DEV — Lien de réinitialisation (email non envoyé) :");
          console.warn(resetUrl);
          console.warn("──────────────────────────────────────────────");
        }
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
      ...(process.env.NODE_ENV !== "production" && debugResetUrl
        ? { data: { debugResetUrl } }
        : {}),
    });
  } catch (error) {
    console.error("Erreur forgot-password:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la demande de réinitialisation.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const { token, password } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { client: true },
    });

    if (!resetToken || resetToken.usedAt) {
      return res.status(400).json({
        success: false,
        message: "Ce lien de réinitialisation est invalide ou déjà utilisé.",
      });
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Ce lien de réinitialisation a expiré. Demandez-en un nouveau.",
      });
    }

    if (!resetToken.client.isActive) {
      return res.status(403).json({
        success: false,
        message: "Ce compte est désactivé.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.client.update({
        where: { id: resetToken.clientId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          clientId: resetToken.clientId,
          usedAt: null,
          id: { not: resetToken.id },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Mot de passe mis à jour. Vous pouvez vous connecter.",
    });
  } catch (error) {
    console.error("Erreur reset-password:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la réinitialisation du mot de passe.",
    });
  }
};
