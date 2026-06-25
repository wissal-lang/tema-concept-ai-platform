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
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">TC</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Tema Concept</h1>
            <p className="text-xs text-gray-500">{isAdmin ? "Admin Panel" : "Client Portal"}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg w-full transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
