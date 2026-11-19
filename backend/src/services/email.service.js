import nodemailer from "nodemailer";

const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const isGmailHost = (host) => /gmail\.com$/i.test(host || "");

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const gmail = isGmailHost(host);

  const port = Number(
    process.env.SMTP_PORT || (gmail ? 465 : 587)
  );

  const secure =
    process.env.SMTP_SECURE === "true" ||
    (process.env.SMTP_SECURE !== "false" && port === 465);

  return { host, port, secure, gmail };
};

const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  const { host, port, secure, gmail } = getSmtpConfig();

  if (gmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
  });
};

const formatSmtpError = (error) => {
  const message = error?.message || "Erreur SMTP inconnue";

  if (/ETIMEDOUT|ECONNREFUSED|ESOCKET/i.test(message)) {
    return `${message} — Vérifiez SMTP_HOST/SMTP_PORT (Gmail : port 465, SMTP_SECURE=true). Le port 587 est souvent bloqué par les FAI.`;
  }

  if (/535|BadCredentials|Username and Password not accepted/i.test(message)) {
    return `${message} — Mot de passe d'application Gmail invalide. Recréez-en un sur https://myaccount.google.com/apppasswords (validation en 2 étapes requise).`;
  }

  return message;
};

const sendWithTransporter = async (mailOptions) => {
  const transporter = createTransporter();

  if (!transporter) {
    return { sent: false, reason: "not_configured" };
  }

  const { host, port } = getSmtpConfig();

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email envoyé via ${host}:${port} → ${mailOptions.to} (${info.messageId || "ok"})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Échec envoi email (${host}:${port}) :`, formatSmtpError(error));
    throw error;
  }
};

export const sendContactNotificationEmail = async (contact) => {
  if (!isEmailConfigured()) {
    console.warn("Email non configuré : le message contact est enregistré sans notification email.");
    return { sent: false, reason: "not_configured" };
  }

  const recipient =
    process.env.CONTACT_NOTIFY_EMAIL ||
    process.env.SMTP_USER;

  const subject = contact.subject
    ? `[Tema Concept] ${contact.subject}`
    : `[Tema Concept] Nouveau message de ${contact.fullName}`;

  const text = [
    "Nouveau message depuis le formulaire de contact",
    "",
    `Nom : ${contact.fullName}`,
    `Email : ${contact.email}`,
    contact.subject ? `Sujet : ${contact.subject}` : null,
    "",
    "Message :",
    contact.message,
    "",
    `Reçu le : ${new Date(contact.createdAt || Date.now()).toLocaleString("fr-FR")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <h2>Nouveau message de contact</h2>
    <p><strong>Nom :</strong> ${contact.fullName}</p>
    <p><strong>Email :</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
    ${contact.subject ? `<p><strong>Sujet :</strong> ${contact.subject}</p>` : ""}
    <p><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${contact.message}</p>
    <hr />
    <p style="color:#64748B;font-size:12px">Reçu via le site Tema Concept</p>
  `;

  await sendWithTransporter({
    from: `"Tema Concept" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: recipient,
    replyTo: contact.email,
    subject,
    text,
    html,
  });

  return { sent: true, recipient };
};

export const sendPasswordResetEmail = async (client, resetUrl) => {
  if (!isEmailConfigured()) {
    console.warn("Email non configuré : impossible d'envoyer le lien de réinitialisation.");
    return { sent: false, reason: "not_configured" };
  }

  const subject = "[Tema Concept] Réinitialisation de votre mot de passe";

  const text = [
    `Bonjour ${client.name},`,
    "",
    "Vous avez demandé la réinitialisation de votre mot de passe.",
    "Cliquez sur le lien ci-dessous pour en choisir un nouveau :",
    "",
    resetUrl,
    "",
    "Ce lien expire dans 1 heure.",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
  ].join("\n");

  const html = `
    <h2>Réinitialisation du mot de passe</h2>
    <p>Bonjour <strong>${client.name}</strong>,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe Tema Concept.</p>
    <p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#2563EB;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Choisir un nouveau mot de passe</a></p>
    <p style="color:#64748B;font-size:13px">Ou copiez ce lien :<br /><a href="${resetUrl}">${resetUrl}</a></p>
    <p style="color:#64748B;font-size:12px">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
  `;

  await sendWithTransporter({
    from: `"Tema Concept" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: client.email,
    subject,
    text,
    html,
  });

  return { sent: true };
};

export const verifyEmailTransport = async () => {
  const transporter = createTransporter();
  if (!transporter) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: formatSmtpError(error) };
  }
};
