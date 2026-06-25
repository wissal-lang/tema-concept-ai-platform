import prisma from "../config/prisma.js";
import {
  createContactSchema,
  updateContactStatusSchema,
} from "../validations/contact.validation.js";
import { formatZodError } from "../utils/helpers.js";

export const createContact = async (req, res) => {
  try {
    const parsed = createContactSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const contact = await prisma.contactMessage.create({
      data: parsed.data,
    });

    return res.status(201).json({
      success: true,
      message: "Votre message a été envoyé avec succès.",
      data: contact,
    });
  } catch (error) {
    console.error("Erreur création contact:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'envoi du message.",
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Erreur récupération contacts:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des messages.",
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message de contact introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Erreur récupération contact:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du message.",
    });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const parsed = updateContactStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
    }

    const existing = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Message de contact introuvable.",
      });
    }

    const contact = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });

    return res.status(200).json({
      success: true,
      message: "Statut mis à jour avec succès.",
      data: contact,
    });
  } catch (error) {
    console.error("Erreur mise à jour statut contact:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du statut.",
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const existing = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Message de contact introuvable.",
      });
    }

    await prisma.contactMessage.delete({ where: { id: req.params.id } });

    return res.status(200).json({
      success: true,
      message: "Message supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur suppression contact:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression du message.",
    });
  }
};
