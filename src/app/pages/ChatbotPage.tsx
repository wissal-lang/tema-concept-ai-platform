import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Send, Bot, User, HeadphonesIcon, Plus, ChevronRight, Menu, X } from "lucide-react";
import Header from "../components/Header";
import { sendChatMessage } from "@/services/api";

type Message = {
  id: number;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
  serviceCards?: boolean;
};

const serviceCards = [
  { title: "Sites web & plateformes web", icon: "💻" },
  { title: "Applications mobiles", icon: "📱" },
  { title: "Solutions IA", icon: "🤖" },
  { title: "Support IT", icon: "🛠️" }
];

const conversationHistory = [
  { id: 1, title: "Services disponibles", badge: "Information", badgeColor: "bg-blue-100 text-blue-700", date: "Aujourd'hui", active: true },
  { id: 2, title: "Demande de devis mobile", badge: "Devis", badgeColor: "bg-green-100 text-green-700", date: "Hier", active: false },
  { id: 3, title: "Questions sur les délais", badge: "Suivi", badgeColor: "bg-yellow-100 text-yellow-700", date: "2 juin", active: false },
  { id: 4, title: "Support technique", badge: "Support", badgeColor: "bg-purple-100 text-purple-700", date: "1 juin", active: false }
];

const suggestedQuestions = [
  "Quels services proposez-vous ?",
  "Je veux créer un site web",
  "Je veux demander un devis",
  "Comment suivre ma demande ?",
  "Parler à un conseiller"
];

export default function ChatbotPage() {
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(
    () => localStorage.getItem("tema_chat_conversation_id")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content: "Bonjour ! Je suis l'assistant IA de Tema Concept. Je peux vous aider à découvrir nos services, demander un devis ou suivre une demande.",
      timestamp: new Date(Date.now() - 60000)
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    const isServicesQuestion = text.toLowerCase().includes("service") || text.toLowerCase().includes("proposez");

    try {
      const response = await sendChatMessage(text, conversationId);
      const { conversationId: newConvId, reply } = response.data!;

      if (newConvId && newConvId !== conversationId) {
        setConversationId(newConvId);
        localStorage.setItem("tema_chat_conversation_id", newConvId);
      }

      const botResponse: Message = {
        id: messages.length + 2,
        type: "bot",
        content: reply,
        timestamp: new Date(),
        serviceCards: isServicesQuestion
      };
      setMessages(prev => [...prev, botResponse]);
    } catch {
      const botResponse: Message = {
        id: messages.length + 2,
        type: "bot",
        content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    localStorage.removeItem("tema_chat_conversation_id");
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Bonjour ! Je suis l'assistant IA de Tema Concept. Je peux vous aider à découvrir nos services, demander un devis ou suivre une demande.",
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Mobile sidebar toggle */}
        <button
          className="lg:hidden fixed bottom-24 left-4 z-40 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Conversation History Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white lg:bg-transparent
            lg:w-64 lg:flex-shrink-0 transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full lg:h-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pt-2 lg:pt-0">
              <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
              <button
                className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleNewConversation}
              className="w-full mb-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle conversation
            </button>

            <div className="space-y-1">
              {conversationHistory.map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    conv.active ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-medium truncate flex-1 ${conv.active ? "text-blue-700" : "text-gray-700"}`}>
                      {conv.title}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${conv.badgeColor} flex-shrink-0`}>
                      {conv.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{conv.date}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 min-h-0" style={{ height: "calc(100vh - 10rem)" }}>
          {/* Chat Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Assistant IA de Tema Concept</h1>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  En ligne • Temps de réponse : ~2s
                </p>
              </div>
            </div>

            <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2 border border-green-200">
              <HeadphonesIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Parler à un conseiller</span>
              <span className="sm:hidden">Conseiller</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.type === "bot" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {msg.type === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`flex flex-col max-w-[75%] ${msg.type === "user" ? "items-end" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.type === "bot"
                        ? "bg-gray-100 text-gray-900 rounded-tl-sm"
                        : "bg-blue-600 text-white rounded-tr-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>

                  {/* Service Cards inside bot message */}
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

          {/* Suggested Questions */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="px-3 py-1.5 bg-white text-gray-600 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(message);
                  }
                }}
                placeholder="Décrivez votre besoin ou posez une question..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={() => handleSendMessage(message)}
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
              L'assistant IA peut faire des erreurs. Pour les informations importantes, contactez un conseiller.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
