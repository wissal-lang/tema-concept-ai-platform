import { Bot } from "lucide-react";
import { Link } from "react-router";

export default function FloatingChatbot() {
  return (
    <Link
      to="/chatbot"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 p-3.5"
      aria-label="Assistance IA"
    >
      <Bot className="w-5 h-5 flex-shrink-0" />
      {/* Label: visible on mobile always, on desktop only on hover */}
      <span className="sm:max-w-0 sm:overflow-hidden sm:opacity-0 group-hover:sm:max-w-xs group-hover:sm:opacity-100 transition-all duration-200 whitespace-nowrap text-sm font-medium pr-1">
        Besoin d'aide ?
      </span>
    </Link>
  );
}
