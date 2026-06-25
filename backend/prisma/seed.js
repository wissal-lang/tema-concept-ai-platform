import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@temaconcept.com" },
    update: {},
    create: {
      name: "Admin Tema Concept",
      email: "admin@temaconcept.com",
      password: hashedPassword,
    },
  });

  console.log("Admin créé :", admin.email);

  const services = [
    {
      title: "Sites web & plateformes web",
      description:
        "Création de sites modernes, applications web et plateformes personnalisées.",
      icon: "Code",
      isActive: true,
    },
    {
      title: "Applications mobiles",
      description:
        "Développement d'applications mobiles iOS et Android adaptées à vos besoins.",
      icon: "Smartphone",
      isActive: true,
    },
    {
      title: "Conseil & transformation digitale",
      description:
        "Accompagnement stratégique pour digitaliser vos processus et améliorer vos services.",
      icon: "Lightbulb",
      isActive: true,
    },
    {
      title: "Intégration de solutions",
      description:
        "Connexion et intégration fluide de vos systèmes et outils existants.",
      icon: "Network",
      isActive: true,
    },
    {
      title: "Maintenance & support IT",
      description:
        "Support technique, maintenance applicative et gestion de votre infrastructure.",
      icon: "Server",
      isActive: true,
    },
    {
      title: "Chatbots & automatisation IA",
      description:
        "Mise en place d'assistants intelligents pour automatiser les interactions utilisateurs.",
      icon: "Bot",
      isActive: true,
    },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { title: service.title },
    });

    if (!existing) {
      await prisma.service.create({ data: service });
    }
  }

  console.log("Services par défaut créés.");
}

main()
  .catch((e) => {
    console.error("Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
