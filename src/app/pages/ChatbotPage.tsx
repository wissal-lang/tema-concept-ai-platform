import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Send, User, HeadphonesIcon, Plus, ChevronRight, Menu, X } from "lucide-react";
import Header from "../components/Header";
import TemaLogo from "../components/TemaLogo";
import {
  getClientConversations,
  getClientToken,
  getConversationById,
  getStoredClient,
  requestConversationSupport,
  sendChatMessage,
  type ConversationFromApi,
} from "@/services/api";

type Message = {
  id: string;
  type: "bot" | "user" | "support";
  content: string;
  timestamp: Date;
  serviceCards?: boolean;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  type: "bot",
  content: "Bonjour ! Je suis l'assistant IA de Tema Concept. Je peux vous aider à découvrir nos services, demander un devis ou suivre une demande.",
  timestamp: new Date(),
};

const serviceCards = [
  { title: "Sites web & plateformes web", icon: "💻" },
  { title: "Applications mobiles", icon: "📱" },
  { title: "Solutions IA", icon: "🤖" },
  { title: "Support IT", icon: "🛠️" },
];

const suggestedQuestions = [
  "Quels services proposez-vous ?",
  "Je veux créer un site web",
  "Je veux demander un devis",
  "Comment suivre ma demande ?",
  "Parler à un conseiller",
];

const mapApiMessages = (apiMessages: Array<{ id: string; sender: string; content: string; createdAt: string }>): Message[] => {
  if (!apiMessages.length) {
    return [WELCOME_MESSAGE];
  }

  return apiMessages.map((msg) => ({
    id: msg.id,
    type: msg.sender === "USER" ? "user" : msg.sender === "SUPPORT" ? "support" : "bot",
    content: msg.content,
    timestamp: new Date(msg.createdAt),
  }));
};

const formatConversationDate = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return date.toLocaleDateString("fr-FR");
};

const getConversationBadge = (status?: string) => {
  if (status === "needs_support") return { label: "Support", color: "bg-purple-100 text-purple-700" };
  if (status === "transferred") return { label: "Support", color: "bg-purple-100 text-purple-700" };
  return { label: "IA", color: "bg-blue-100 text-blue-700" };
};

const getConversationStorageKey = (clientId?: string | null) =>
  clientId ? `tema_chat_conversation_id:${clientId}` : "tema_chat_conversation_id:guest";

export default function ChatbotPage() {
  const client = getStoredClient();
  const isClientLoggedIn = Boolean(getClientToken());
  const conversationStorageKey = getConversationStorageKey(client?.id);

  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supportRequested, setSupportRequested] = useState(false);
  const [activeQuickQuestion, setActiveQuickQuestion] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentConversationIdRef = useRef<string | null>(null);
  const latestRequestRef = useRef(0);

  const loadClientConversations = useCallback(async () => {
    if (!isClientLoggedIn) return;

    try {
      const response = await getClientConversations();
      if (response.success && Array.isArray(response.data)) {
        setConversations(response.data);
      }
    } catch {
      // chargement silencieux
    }
  }, [isClientLoggedIn]);

  const loadConversationMessages = useCallback(async (id: string) => {
    try {
      const response = await getConversationById(id);
      if (response.success && response.data) {
        setMessages(mapApiMessages(response.data.messages));
        setSupportRequested(
          Boolean(response.data.handoff || response.data.status === "needs_support" || response.data.status === "transferred")
        );
      }
    } catch {
      setConversationId(null);
      localStorage.removeItem(conversationStorageKey);
      setMessages([WELCOME_MESSAGE]);
    }
  }, [conversationStorageKey]);

  useEffect(() => {
    void loadClientConversations();
  }, [loadClientConversations]);

  useEffect(() => {
    const storedConversationId = localStorage.getItem(conversationStorageKey);
    setConversationId(storedConversationId);
    currentConversationIdRef.current = storedConversationId;
    setSupportRequested(false);
    setMessages([WELCOME_MESSAGE]);
  }, [conversationStorageKey]);

  useEffect(() => {
    if (conversationId) {
      void loadConversationMessages(conversationId);
    }
  }, [conversationId, loadConversationMessages]);

  useEffect(() => {
    if (!isClientLoggedIn) return;

    const interval = window.setInterval(() => {
      void loadClientConversations();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [isClientLoggedIn, loadClientConversations]);

  useEffect(() => {
    if (!conversationId || !supportRequested) return;

    const interval = window.setInterval(() => {
      void loadConversationMessages(conversationId);
    }, 8000);

    return () => window.clearInterval(interval);
  }, [conversationId, supportRequested, loadConversationMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const requestId = Date.now();
    latestRequestRef.current = requestId;

    const userMessage: Message = {
      id: `local-${Date.now()}`,
      type: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    const isServicesQuestion = text.toLowerCase().includes("service") || text.toLowerCase().includes("proposez");

    try {
      const activeConversationId = currentConversationIdRef.current;
      const response = await sendChatMessage(text, activeConversationId);
      if (latestRequestRef.current !== requestId) return;
      const data = response.data!;

      if (data.conversationId && data.conversationId !== activeConversationId) {
        setConversationId(data.conversationId);
        currentConversationIdRef.current = data.conversationId;
        localStorage.setItem(conversationStorageKey, data.conversationId);
      }

      if (data.messages?.length) {
        setMessages(mapApiMessages(data.messages));
      } else if (data.reply) {
        const botResponse: Message = {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: data.reply,
          timestamp: new Date(),
          serviceCards: isServicesQuestion,
        };
        setMessages((prev) => [...prev, botResponse]);
      }

      if (data.handoff || data.awaitingSupport) {
        setSupportRequested(true);
      }

      if (isClientLoggedIn) {
        await loadClientConversations();
      }
    } catch (err) {
      if (latestRequestRef.current !== requestId) return;
      const errorMessage = err instanceof Error ? err.message : "Désolé, une erreur est survenue. Veuillez réessayer.";
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "bot",
          content: errorMessage,
          timestamp: new Date(),
        },
      ]);
    } finally {
      if (latestRequestRef.current === requestId) {
        setActiveQuickQuestion(null);
        setIsLoading(false);
      }
    }
  };

  const handleSelectConversation = async (id: string) => {
    setConversationId(id);
    currentConversationIdRef.current = id;
    localStorage.setItem(conversationStorageKey, id);
    setSidebarOpen(false);
    await loadConversationMessages(id);
  };

  const handleNewConversation = () => {
    latestRequestRef.current = Date.now();
    setConversationId(null);
    currentConversationIdRef.current = null;
    setSupportRequested(false);
    setMessage("");
    setIsLoading(false);
    setActiveQuickQuestion(null);
    localStorage.removeItem(conversationStorageKey);
    setMessages([WELCOME_MESSAGE]);
    setSidebarOpen(false);
  };

  const handleSupportRequest = async () => {
    if (isLoading || supportRequested) return;

    if (!isClientLoggedIn) {
      setMessages((prev) => [
        ...prev,
        {
          id: `support-login-required-${Date.now()}`,
          type: "bot",
          content: "Pour parler au support, veuillez d'abord vous connecter à votre compte.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    if (!conversationId) {
      await handleSendMessage("Je veux parler à un conseiller");
      return;
    }

    setIsLoading(true);
    try {
      await requestConversationSupport(
        conversationId,
        "Votre conversation a été transmise au support Tema Concept. Un conseiller pourra reprendre avec le contexte déjà fourni."
      );
      setSupportRequested(true);
      await loadConversationMessages(conversationId);
      if (isClientLoggedIn) {
        await loadClientConversations();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `support-error-${Date.now()}`,
          type: "bot",
          content: "Impossible de transférer la conversation pour le moment. Veuillez réessayer dans quelques instants.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <button
          className="lg:hidden fixed bottom-24 left-4 z-40 w-10 h-10 bg-card border border-border rounded-full shadow-md flex items-center justify-center"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white lg:bg-transparent
            lg:w-64 lg:flex-shrink-0 transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 h-full lg:h-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pt-2 lg:pt-0">
              <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
              <button
                className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isClientLoggedIn && client && (
              <p className="mb-3 text-xs text-muted-foreground">
                Connecté en tant que <strong className="text-foreground">{client.name}</strong>
              </p>
            )}

            <button
              onClick={handleNewConversation}
              className="w-full mb-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle conversation
            </button>

            <div className="space-y-1">
              {isClientLoggedIn ? (
                conversations.length > 0 ? (
                  conversations.map((conv) => {
                    const badge = getConversationBadge(conv.status);
                    const isActive = conv.id === conversationId;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => void handleSelectConversation(conv.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                          isActive ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-medium truncate flex-1 ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                            {conv.subject || "Conversation"}
                          </p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${badge.color} flex-shrink-0`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{formatConversationDate(conv.updatedAt || conv.createdAt)}</p>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-2 py-3 text-xs text-muted-foreground">
                    Aucune conversation enregistrée. Démarrez un échange pour le sauvegarder sur votre compte.
                  </p>
                )
              ) : (
                <p className="px-2 py-3 text-xs text-muted-foreground">
                  <Link to="/login" className="text-blue-600 hover:underline">Connectez-vous</Link> pour enregistrer vos conversations sur votre compte.
                </p>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col bg-card rounded-xl shadow-sm border border-border min-h-0" style={{ height: "calc(100vh - 10rem)" }}>
          <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <TemaLogo variant="avatar" />
              <div>
                <h1 className="font-semibold text-foreground">Assistant IA de Tema Concept</h1>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  {supportRequested ? "Support en cours • réponses humaines possibles" : "En ligne • Temps de réponse : ~2s"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSupportRequest()}
              disabled={isLoading || supportRequested || !isClientLoggedIn}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border ${
                supportRequested
                  ? "bg-amber-50 text-amber-700 border-amber-200 cursor-default"
                  : isClientLoggedIn
                    ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    : "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
              } disabled:opacity-70`}
            >
              <HeadphonesIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{supportRequested ? "Support demandé" : "Transférer au support"}</span>
              <span className="sm:hidden">Support</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                <div className="flex-shrink-0">
                  {msg.type === "user" ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                      <User className="h-4 w-4" />
                    </div>
                  ) : msg.type === "support" ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <HeadphonesIcon className="h-4 w-4" />
                    </div>
                  ) : (
                    <TemaLogo variant="message" />
                  )}
                </div>

                <div className={`flex flex-col max-w-[75%] ${msg.type === "user" ? "items-end" : ""}`}>
                  {msg.type === "support" && (
                    <p className="mb-1 text-[11px] font-medium text-green-700">Support Tema Concept</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : msg.type === "support"
                          ? "bg-green-50 text-green-900 border border-green-200 rounded-tl-sm"
                          : "bg-gray-100 text-gray-900 rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>

                  {msg.serviceCards && (
                    <div className="mt-3 grid grid-cols-2 gap-2 w-full max-w-sm">
                      {serviceCards.map((card) => (
                        <div
                          key={card.title}
                          className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-xl mb-1">{card.icon}</div>
                          <p className="text-xs font-medium text-gray-800 mb-2 leading-tight">{card.title}</p>
                          <Link
                            to="/new-request"
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium"
                          >
                            Demander ce service <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                      <div className="col-span-2 mt-1">
                        <Link
                          to="/new-request"
                          className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          Créer une demande de devis
                        </Link>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-1 px-1">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setActiveQuickQuestion(q);
                    void handleSendMessage(q);
                  }}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
                    activeQuickQuestion === q
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-gray-200"
                  } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage(message);
                  }
                }}
                placeholder={supportRequested ? "Écrivez votre message au support..." : "Décrivez votre besoin ou posez une question..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={() => void handleSendMessage(message)}
                disabled={!message.trim() || isLoading}
                className={`px-5 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm ${
                  message.trim() && !isLoading
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isLoading ? "Envoi..." : "Envoyer"}</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {isClientLoggedIn
                ? "Vos conversations sont enregistrées sur votre compte."
                : "Connectez-vous pour sauvegarder vos conversations."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
