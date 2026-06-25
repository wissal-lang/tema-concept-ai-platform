import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogIn, Menu, X, Bot } from "lucide-react";

const navItems = [
  { label: "Accueil", sectionId: "accueil" },
  { label: "Services", sectionId: "services" },
  { label: "Comment ça marche", sectionId: "comment-ca-marche" },
  { label: "Contact", sectionId: "contact" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

type NavLinkProps = {
  label: string;
  sectionId: string;
  onClick?: () => void;
  className?: string;
};

function SectionNavLink({ label, sectionId, onClick, className = "" }: NavLinkProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    if (location.pathname === "/") {
      scrollToSection(sectionId);
    } else {
      navigate("/", { state: { scrollTo: sectionId } });
    }
  };

  return (
    <a href={`/#${sectionId}`} onClick={handleClick} className={className}>
      {label}
    </a>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDevisClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname === "/") {
      scrollToSection("demander-devis");
    } else {
      navigate("/", { state: { scrollTo: "demander-devis" } });
    }
  };

  const handleAssistanceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    navigate("/chatbot");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); if (location.pathname === "/") scrollToSection("accueil"); else navigate("/"); }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TC</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Tema Concept</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <SectionNavLink
                key={item.sectionId}
                label={item.label}
                sectionId={item.sectionId}
                className="text-gray-700 hover:text-blue-600 transition-colors text-sm cursor-pointer"
              />
            ))}
            <a
              href="/chatbot"
              onClick={handleAssistanceClick}
              className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition-colors text-sm cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              Assistance IA
            </a>
            <a
              href="/#demander-devis"
              onClick={handleDevisClick}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
            >
              Demander un devis
            </a>
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </Link>
          </nav>

          <button className="md:hidden p-2 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <SectionNavLink
              key={item.sectionId}
              label={item.label}
              sectionId={item.sectionId}
              onClick={() => setMobileOpen(false)}
              className="block text-gray-700 hover:text-blue-600 text-sm py-2 cursor-pointer"
            />
          ))}
          <a
            href="/chatbot"
            onClick={handleAssistanceClick}
            className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 text-sm py-2 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            Assistance IA
          </a>
          <a
            href="/#demander-devis"
            onClick={handleDevisClick}
            className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 cursor-pointer"
          >
            Demander un devis
          </a>
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            <LogIn className="w-4 h-4" />
            Connexion
          </Link>
        </div>
      )}
    </header>
  );
}
