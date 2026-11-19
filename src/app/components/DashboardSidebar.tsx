import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageCircle,
  User,
  LogOut,
  BarChart3,
} from "lucide-react";
import TemaLogo from "./TemaLogo";
import ThemeToggle from "./ThemeToggle";

interface SidebarProps {
  isAdmin?: boolean;
}

export default function DashboardSidebar({ isAdmin = false }: SidebarProps) {
  const location = useLocation();

  const userLinks = [
    { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/dashboard/requests", label: "Mes demandes", icon: FileText },
    { to: "/new-request", label: "Nouvelle demande", icon: PlusCircle },
    { to: "/chatbot", label: "Assistance IA", icon: MessageCircle },
    { to: "/dashboard/profile", label: "Profil", icon: User },
  ];

  const adminLinks = [
    { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/dashboard", label: "Vue Client", icon: User },
    { to: "/", label: "Site Web", icon: BarChart3 },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          <TemaLogo variant="sidebar" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">Tema Concept</p>
            <p className="text-xs text-muted-foreground">{isAdmin ? "Admin Panel" : "Client Portal"}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:translate-x-0.5 ${
                isActive
                  ? "bg-[#F8FAFC] text-foreground dark:bg-muted/60"
                  : "text-muted-foreground hover:bg-[#F8FAFC] hover:text-foreground dark:hover:bg-muted/40"
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[#2563EB]" />}
              <Icon className={`h-5 w-5 ${isActive ? "text-[#2563EB]" : "text-muted-foreground group-hover:text-foreground"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-xs text-muted-foreground">Apparence</span>
          <ThemeToggle />
        </div>
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:translate-x-0.5 hover:bg-red-50 hover:text-[#EF4444] dark:hover:bg-red-950/30">
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
