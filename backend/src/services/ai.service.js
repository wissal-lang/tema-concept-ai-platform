const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "llama3.1:latest";
const DEFAULT_TIMEOUT_MS = 180000;

const getOllamaConfig = () => ({
  baseUrl: (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, ""),
  model: process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL,
  timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
});

const toOllamaRole = (sender) => {
  if (sender === "USER") return "user";
  return "assistant";
};

const buildSystemPrompt = (chatbotSettings) => {
  const defaultPrompt =
    "Vous êtes Tema Assistant, l'assistant IA officiel de Tema Concept. Répondez en français, de manière professionnelle, claire et concise.";

  return [
    chatbotSettings.systemPrompt || defaultPrompt,
    "",
    "Règles importantes :",
    "- Ne promettez jamais un prix exact, un délai garanti ou un engagement non validé par l'équipe.",
    "- Si une information manque, posez une question courte.",
    "- Si la demande est complexe, recommandez de créer une demande de devis ou de parler à un conseiller.",
    "- Restez centré sur les services de Tema Concept.",
    "- Réponses courtes : 3 à 6 lignes maximum.",
    "",
    `Nom de l'assistant : ${chatbotSettings.name || "Tema Assistant"}`,
    `Ton attendu : ${chatbotSettings.tone || "professionnel"}`,
  ].join("\n");
};

const buildMessages = ({ message, history = [], chatbotSettings }) => [
  {
    role: "system",
    content: buildSystemPrompt(chatbotSettings),
  },
  ...history.slice(-4).map((item) => ({
    role: toOllamaRole(item.sender),
    content: item.content,
  })),
  {
    role: "user",
    content: message,
  },
];

const parseOllamaReply = (data) => {
  const candidates = [
    data?.message?.content,
    data?.response,
    Array.isArray(data?.messages) ? data.messages.at(-1)?.content : null,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
};

export const generateChatReply = async ({ message, history = [], chatbotSettings }) => {
  const config = getOllamaConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  console.log(`[IA] Appel Ollama ${config.baseUrl}/api/chat modèle=${config.model}`);

  try {
    const response = await fetch(`${config.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        messages: buildMessages({ message, history, chatbotSettings }),
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.8,
          num_predict: 80,
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      const error = new Error(`Ollama a retourné une erreur (${response.status}). ${details}`);
      error.status = 502;
      throw error;
    }

    const data = await response.json();
    const reply = parseOllamaReply(data);

    if (!reply) {
      const error = new Error("Ollama n'a pas retourné de réponse exploitable.");
      error.status = 502;
      throw error;
    }

    console.log(`[IA] Réponse OK (${reply.length} caractères)`);
    return reply;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`[IA] Timeout après ${config.timeoutMs}ms`);
      const timeoutError = new Error("Ollama met trop de temps à répondre. Réessayez dans quelques secondes.");
      timeoutError.status = 504;
      throw timeoutError;
    }

    if (error.cause?.code === "ECONNREFUSED" || error.code === "ECONNREFUSED") {
      console.error("[IA] Ollama inaccessible (ECONNREFUSED)");
      const connectionError = new Error("Ollama n'est pas lancé ou n'est pas accessible sur le port 11434.");
      connectionError.status = 503;
      throw connectionError;
    }

    console.error("[IA] Erreur:", error.message || error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
