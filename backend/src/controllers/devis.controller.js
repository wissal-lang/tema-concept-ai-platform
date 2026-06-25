import prisma from "../config/prisma.js";
import {
  createDevisSchema,
  updateDevisStatusSchema,
} from "../validations/devis.validation.js";
import { formatZodError } from "../utils/helpers.js";

export const createDevis = async (req, res) => {
  try {
    const parsed = createDevisSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const devis = await prisma.devisRequest.create({
      data: parsed.data,
    });

    return res.status(201).json({
      success: true,
      message: "Votre demande de devis a été envoyée avec succès.",
      data: devis,
    });
  } catch (error) {
    console.error("Erreur création devis:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'envoi de la demande.",
    });
  }
};

export const getAllDevis = async (req, res) => {
  try {
    const devis = await prisma.devisRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: devis,
    });
  } catch (error) {
    console.error("Erreur récupération devis:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des demandes.",
    });
  }
};

export const getDevisById = async (req, res) => {
  try {
    const devis = await prisma.devisRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: "Demande de devis introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      data: devis,
    });
  } catch (error) {
    console.error("Erreur récupération devis:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de la demande.",
    });
  }
};

export const updateDevisStatus = async (req, res) => {
  try {
    const parsed = updateDevisStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const existing = await prisma.devisRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Demande de devis introuvable.",
      });
    }

    const devis = await prisma.devisRequest.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });

    return res.status(200).json({
      success: true,
      message: "Statut mis à jour avec succès.",
      data: devis,
    });
  } catch (error) {
    console.error("Erreur mise à jour statut devis:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du statut.",
    });
  }
};

export const deleteDevis = async (req, res) => {
  try {
    const existing = await prisma.devisRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Demande de devis introuvable.",
      });
    }

    await prisma.devisRequest.delete({ where: { id: req.params.id } });

    return res.status(200).json({
      success: true,
      message: "Demande de devis supprimée avec succès.",
    });
  } catch (error) {
    console.error("Erreur suppression devis:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression de la demande.",
    });
  }
};
