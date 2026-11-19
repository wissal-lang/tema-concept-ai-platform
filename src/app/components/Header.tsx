import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogIn, Menu, X, Bot } from "lucide-react";
import TemaLogo from "./TemaLogo";
import ThemeToggle from "./ThemeToggle";

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
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <TemaLogo
            variant="header"
            asLink
            to="/"
            onClick={(e) => {
              e.preventDefault();
              if (location.pathname === "/") scrollToSection("accueil");
              else navigate("/");
            }}
          />

          <nav className="hidden md:flex items-center gap-4">
            {navItems.slice(0, 1).map((item) => (
              <SectionNavLink
                key={item.sectionId}
                label={item.label}
                sectionId={item.sectionId}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              />
            ))}
            <a
              href="/chatbot"
              onClick={handleAssistanceClick}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              Assistance IA
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                Nouveau
              </span>
            </a>
            {navItems.slice(1).map((item) => (
              <SectionNavLink
                key={item.sectionId}
                label={item.label}
                sectionId={item.sectionId}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              />
            ))}
            <ThemeToggle />
            <a
              href="/#demander-devis"
              onClick={handleDevisClick}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors border border-blue-200 dark:border-blue-800 cursor-pointer"
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

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button className="p-2 text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-1">
          {navItems.slice(0, 1).map((item) => (
            <SectionNavLink
              key={item.sectionId}
              label={item.label}
              sectionId={item.sectionId}
              onClick={() => setMobileOpen(false)}
              className="block text-muted-foreground hover:text-primary text-sm py-2 cursor-pointer"
            />
          ))}
          <a
            href="/chatbot"
            onClick={handleAssistanceClick}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm py-2 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            Assistance IA
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              Nouveau
            </span>
          </a>
          {navItems.slice(1).map((item) => (
            <SectionNavLink
              key={item.sectionId}
              label={item.label}
              sectionId={item.sectionId}
              onClick={() => setMobileOpen(false)}
              className="block text-muted-foreground hover:text-primary text-sm py-2 cursor-pointer"
            />
          ))}
          <a
            href="/#demander-devis"
            onClick={handleDevisClick}
            className="block w-full text-center px-4 py-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800 cursor-pointer"
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
