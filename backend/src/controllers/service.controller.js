import prisma from "../config/prisma.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validations/service.validation.js";
import { formatZodError } from "../utils/helpers.js";

export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Erreur récupération services:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des services.",
    });
  }
};

export const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Erreur récupération services admin:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des services.",
    });
  }
};

export const createService = async (req, res) => {
  try {
    const parsed = createServiceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const service = await prisma.service.create({
      data: parsed.data,
    });

    return res.status(201).json({
      success: true,
      message: "Service créé avec succès.",
      data: service,
    });
  } catch (error) {
    console.error("Erreur création service:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du service.",
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const parsed = updateServiceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const existing = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Service introuvable.",
      });
    }

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    return res.status(200).json({
      success: true,
      message: "Service mis à jour avec succès.",
      data: service,
    });
  } catch (error) {
    console.error("Erreur mise à jour service:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du service.",
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const existing = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Service introuvable.",
      });
    }

    await prisma.service.delete({ where: { id: req.params.id } });

    return res.status(200).json({
      success: true,
      message: "Service supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur suppression service:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression du service.",
    });
  }
};
