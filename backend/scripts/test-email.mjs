import "dotenv/config";
import { verifyEmailTransport, sendPasswordResetEmail } from "../src/services/email.service.js";

const run = async () => {
  console.log("Test configuration email Tema Concept...\n");

  const check = await verifyEmailTransport();
  if (!check.ok) {
    console.error("Échec :", check.reason);
    process.exit(1);
  }

  console.log("Connexion SMTP OK.\n");

  const to = process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!to) {
    console.error("Définissez SMTP_USER ou CONTACT_NOTIFY_EMAIL dans backend/.env");
    process.exit(1);
  }

  await sendPasswordResetEmail(
    { name: "Test", email: to },
    `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=test-token`
  );

  console.log(`\nEmail de test envoyé à ${to}. Vérifiez la boîte de réception et les spams.`);
};

run().catch((error) => {
  console.error("Erreur :", error.message);
  process.exit(1);
});
