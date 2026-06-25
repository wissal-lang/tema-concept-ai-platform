import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Bot,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Eye,
  Edit,
  Send,
  Download,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Activity,
  MoreVertical,
  Phone,
  ArrowUpRight,
  MessageCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatusBadge from "../components/StatusBadge";

type TabType = "overview" | "requests" | "messages" | "conversations" | "services" | "users" | "settings";

/* ─── Nav items ─── */
const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "requests", label: "Demandes de devis", icon: FileText, badge: 18 },
  { id: "messages", label: "Messages contact", icon: Mail, badge: 7 },
  { id: "conversations", label: "Conversations IA", icon: Bot },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "users", label: "Clients", icon: Users },
];

/* ─── Stats ─── */
const statCards = [
  {
    label: "Total demandes de devis",
    value: "124",
    change: "+12%",
    up: true,
    icon: FileText,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    barColor: "bg-blue-500",
    barWidth: "75%",
  },
  {
    label: "Nouvelles demandes",
    value: "18",
    change: "+5 aujourd'hui",
    up: true,
    icon: Clock,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
    barColor: "bg-orange-400",
    barWidth: "25%",
  },
  {
    label: "Messages non lus",
    value: "7",
    change: "+2 nouveaux",
    up: true,
    icon: Mail,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    barColor: "bg-violet-500",
    barWidth: "15%",
  },
  {
    label: "Conversations IA",
    value: "256",
    change: "+23% ce mois",
    up: true,
    icon: Bot,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    barColor: "bg-emerald-500",
    barWidth: "90%",
  },
];

/* ─── Charts ─── */
const monthlyData = [
  { month: "Jan", demandes: 8, conversations: 22 },
  { month: "Fév", demandes: 12, conversations: 31 },
  { month: "Mar", demandes: 15, conversations: 38 },
  { month: "Avr", demandes: 18, conversations: 45 },
  { month: "Mai", demandes: 22, conversations: 52 },
  { month: "Jun", demandes: 24, conversations: 61 },
];

const serviceDistribution = [
  { name: "Dév. Web", value: 54, color: "#2563EB" },
  { name: "Apps Mobiles", value: 43, color: "#7C3AED" },
  { name: "Consulting IT", value: 31, color: "#059669" },
  { name: "Infrastructure", value: 28, color: "#F59E0B" },
];

/* ─── Requests ─── */
const requests = [
  { id: "REQ-2026-001", client: "Ahmed Benali", email: "ahmed.benali@email.ma", type: "App mobile e-commerce", budget: "35 000 MAD", status: "in_progress", priority: "high", date: "2026-06-05" },
  { id: "REQ-2026-002", client: "Sara El Amrani", email: "sara.amrani@email.ma", type: "Site web vitrine", budget: "12 000 MAD", status: "waiting", priority: "medium", date: "2026-06-03" },
  { id: "REQ-2026-003", client: "Youssef Karim", email: "youssef.karim@email.ma", type: "Infrastructure cloud", budget: "28 000 MAD", status: "new", priority: "high", date: "2026-05-28" },
  { id: "REQ-2026-004", client: "Imane Alaoui", email: "imane.alaoui@email.ma", type: "Chatbot IA personnalisé", budget: "18 500 MAD", status: "quote_sent", priority: "medium", date: "2026-05-25" },
  { id: "REQ-2026-005", client: "Hassan Tazi", email: "hassan.tazi@email.ma", type: "Développement Web", budget: "9 000 MAD", status: "completed", priority: "low", date: "2026-05-20" },
  { id: "REQ-2026-006", client: "Fatima Zahra", email: "fatima.z@email.ma", type: "Applications Mobiles", budget: "22 000 MAD", status: "closed", priority: "medium", date: "2026-05-15" },
];

/* ─── Messages ─── */
const recentMessages = [
  { from: "Ahmed Benali", subject: "Question sur les délais de livraison", date: "Il y a 5 min", read: false, initials: "AB" },
  { from: "Sara El Amrani", subject: "Demande de rappel téléphonique", date: "Il y a 1h", read: false, initials: "SE" },
  { from: "Youssef Karim", subject: "Confirmation de rendez-vous", date: "Il y a 3h", read: true, initials: "YK" },
  { from: "Imane Alaoui", subject: "Retour sur le devis envoyé", date: "Hier", read: true, initials: "IA" },
  { from: "Hassan Tazi", subject: "Satisfaction — site livré avec succès", date: "Hier", read: true, initials: "HT" },
];

/* ─── Conversations ─── */
const conversations = [
  { id: "CONV-001", user: "Ahmed Benali", subject: "Demande de devis mobile", lastMessage: "Je veux créer une application...", date: "Aujourd'hui", status: "pending", count: 5 },
  { id: "CONV-002", user: "Sara El Amrani", subject: "Services disponibles", lastMessage: "Quels services proposez-vous ?", date: "Hier", status: "resolved", count: 3 },
  { id: "CONV-003", user: "Youssef Karim", subject: "Support technique", lastMessage: "Je veux parler à un conseiller...", date: "2 juin", status: "transferred", count: 8 },
  { id: "CONV-004", user: "Imane Alaoui", subject: "Informations sur les tarifs", lastMessage: "Quel est le coût moyen d'un site web ?", date: "1 juin", status: "resolved", count: 4 },
  { id: "CONV-005", user: "Hassan Tazi", subject: "Délai de réalisation", lastMessage: "Combien de temps pour un projet mobile ?", date: "31 mai", status: "active", count: 6 },
];

/* ─── Services ─── */
const services = [
  { id: "SRV-001", name: "Développement Web", desc: "Création de sites et applications web sur mesure", requests: 54, status: "active", duration: "4–8 semaines" },
  { id: "SRV-002", name: "Applications Mobiles", desc: "Développement iOS et Android natifs", requests: 43, status: "active", duration: "6–12 semaines" },
  { id: "SRV-003", name: "Consulting IT", desc: "Conseil stratégique et audit technologique", requests: 31, status: "active", duration: "2–4 semaines" },
  { id: "SRV-004", name: "Infrastructure & Support", desc: "Gestion cloud et support technique continu", requests: 28, status: "active", duration: "Continu" },
];

/* ─── Users ─── */
const users = [
  { id: "USR-001", name: "Ahmed Benali", email: "ahmed.benali@email.ma", phone: "+212 6 12 34 56 78", company: "StartupTech SARL", status: "active", joined: "2025-12-15", requests: 5, initials: "AB" },
  { id: "USR-002", name: "Sara El Amrani", email: "sara.amrani@email.ma", phone: "+212 6 23 45 67 89", company: "InnovaTech", status: "active", joined: "2026-01-10", requests: 3, initials: "SE" },
  { id: "USR-003", name: "Youssef Karim", email: "youssef.karim@email.ma", phone: "+212 6 34 56 78 90", company: "Digital Solutions", status: "active", joined: "2026-02-20", requests: 7, initials: "YK" },
  { id: "USR-004", name: "Imane Alaoui", email: "imane.alaoui@email.ma", phone: "+212 6 45 67 89 01", company: "EcommercePlus", status: "inactive", joined: "2025-11-05", requests: 2, initials: "IA" },
];

/* ─── Priority badge ─── */
function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    high: "bg-red-50 text-red-600 border border-red-100",
    medium: "bg-amber-50 text-amber-600 border border-amber-100",
    low: "bg-slate-100 text-slate-500",
  };
  const label: Record<string, string> = { high: "Haute", medium: "Moyenne", low: "Basse" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[priority] ?? map.low}`}>
      {label[priority] ?? "—"}
    </span>
  );
}

/* ─── Conv status badge ─── */
function ConvBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-100", label: "Active" },
    pending: { cls: "bg-amber-50 text-amber-700 border border-amber-100", label: "À revoir" },
    transferred: { cls: "bg-blue-50 text-blue-700 border border-blue-100", label: "Transférée" },
    resolved: { cls: "bg-slate-100 text-slate-600", label: "Résolue" },
  };
  const c = map[status] ?? map.resolved;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
}

/* ─── Custom Tooltip for charts ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-lg px-3 py-2 text-xs">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNav = (tab: TabType) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const pageTitle: Record<TabType, string> = {
    overview: "Tableau de bord",
    requests: "Demandes de devis",
    messages: "Messages contact",
    conversations: "Conversations IA",
    services: "Services",
    users: "Clients",
    settings: "Paramètres",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#F1F5F9" }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 flex-shrink-0
          bg-white border-r border-slate-100 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-bold text-xs tracking-tight">TC</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">Tema Concept</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Administration</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Principal</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {item.badge}
                  </span>
                )}
                {active && <div className="w-1 h-4 rounded-full bg-blue-600" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex-shrink-0 border-t border-slate-100 px-3 py-3 space-y-0.5">
          <button
            onClick={() => handleNav("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "settings" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Paramètres
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* ══════════ MAIN AREA ══════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ── */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-slate-100 flex items-center gap-4 px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <p className="text-sm text-slate-500">
              Bonjour, <span className="font-semibold text-slate-900">Admin</span> 👋
            </p>
          </div>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 w-56 transition-all"
            />
          </div>

          {/* Notification */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-4.5 h-4.5 text-slate-500" style={{ width: "18px", height: "18px" }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm cursor-pointer">
            <span className="text-white text-xs font-bold">AD</span>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6" style={{ scrollbarWidth: "none" }}>

          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{pageTitle[activeTab]}</h1>
              {activeTab === "overview" && (
                <p className="text-sm text-slate-500 mt-0.5">Vue générale des activités de Tema Concept</p>
              )}
            </div>
            {activeTab === "overview" && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-100 rounded-xl px-3 py-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Mis à jour à l'instant
              </div>
            )}
          </div>

          {/* ════════ OVERVIEW TAB ════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${card.iconColor}`} />
                        </div>
                        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${card.up ? "text-emerald-600" : "text-red-500"}`}>
                          {card.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {card.change}
                        </span>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{card.label}</p>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${card.barColor} transition-all`} style={{ width: card.barWidth }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts row */}
              <div className="grid xl:grid-cols-3 gap-4">
                {/* Area chart */}
                <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Évolution des demandes</h3>
                      <p className="text-xs text-slate-500">Demandes et conversations — 6 derniers mois</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Demandes</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />Conversations</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradDemandes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="conversations" name="Conversations" stroke="#7C3AED" strokeWidth={2} fill="url(#gradConv)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="demandes" name="Demandes" stroke="#2563EB" strokeWidth={2} fill="url(#gradDemandes)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">Répartition par service</h3>
                    <p className="text-xs text-slate-500">156 demandes au total</p>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={serviceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {serviceDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number, name: string) => [`${v} demandes`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2">
                    {serviceDistribution.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="flex-1 text-slate-600 truncate">{s.name}</span>
                        <span className="font-semibold text-slate-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requests table + side panels */}
              <div className="grid xl:grid-cols-3 gap-4">

                {/* Requests table */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">Dernières demandes</h3>
                    <button
                      onClick={() => setActiveTab("requests")}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      Voir tout <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type de projet</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Budget</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {requests.slice(0, 5).map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="text-sm font-medium text-slate-900">{req.client}</p>
                              <p className="text-xs text-slate-400">{req.email}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-slate-700">{req.type}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm font-medium text-slate-800" style={{ fontFamily: "'DM Mono', monospace" }}>{req.budget}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={req.status} />
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs text-slate-500">{new Date(req.date).toLocaleDateString("fr-FR")}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <Link
                                to={`/request/${req.id}`}
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Détails
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Side: Recent messages + AI activity */}
                <div className="space-y-4">
                  {/* Recent messages */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-900">Messages récents</h3>
                      <button
                        onClick={() => setActiveTab("messages")}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Voir tout <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {recentMessages.slice(0, 4).map((msg, i) => (
                        <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/60 cursor-pointer transition-colors">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-blue-700">{msg.initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-slate-900 truncate">{msg.from}</p>
                              {!msg.read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{msg.subject}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{msg.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI chatbot activity */}
                  <div className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl p-5 text-white shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Activité de l'IA</h3>
                        <p className="text-[10px] text-white/70">Assistant Tema</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/80">Conversations totales</span>
                        <span className="text-sm font-bold">256</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/80">Taux de résolution</span>
                        <span className="text-sm font-bold">91%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/80">Temps de réponse moy.</span>
                        <span className="text-sm font-bold">1.8s</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/20 rounded-full mt-2">
                        <div className="h-full w-[91%] bg-white/80 rounded-full" />
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("conversations")}
                      className="mt-4 w-full py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Voir les conversations
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance bar */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Performances de la plateforme</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Taux de traitement", value: "60%", color: "text-emerald-600" },
                    { label: "Service populaire", value: "Dev Web", color: "text-blue-600" },
                    { label: "Réponse IA moyenne", value: "1.8s", color: "text-blue-600" },
                    { label: "Satisfaction client", value: "94%", color: "text-emerald-600" },
                  ].map((p, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">{p.label}</span>
                      <span className={`text-2xl font-bold ${p.color} tracking-tight`}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ REQUESTS TAB ════════ */}
          {activeTab === "requests" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une demande, un client ou un service..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <select className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                      <option value="">Statut</option>
                      <option value="new">Nouvelle</option>
                      <option value="in_progress">En cours</option>
                      <option value="waiting">En attente</option>
                      <option value="quote_sent">Devis envoyé</option>
                      <option value="completed">Traitée</option>
                      <option value="closed">Clôturée</option>
                    </select>
                    <select className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                      <option value="">Priorité</option>
                      <option value="high">Haute</option>
                      <option value="medium">Moyenne</option>
                      <option value="low">Basse</option>
                    </select>
                    <button className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                      <Download className="w-4 h-4" />
                      Exporter
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type de projet</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Priorité</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-slate-500">{req.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">{req.client}</p>
                          <p className="text-xs text-slate-400">{req.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{req.type}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'DM Mono', monospace" }}>{req.budget}</span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                        <td className="px-6 py-4"><PriorityBadge priority={req.priority} /></td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(req.date).toLocaleDateString("fr-FR")}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Link to={`/request/${req.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir détails">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Modifier">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Répondre">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500">Affichage de 6 sur <strong className="text-slate-700">124</strong> demandes</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Précédent</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Suivant</button>
                </div>
              </div>
            </div>
          )}

          {/* ════════ MESSAGES TAB ════════ */}
          {activeTab === "messages" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Messages contact</h2>
                  <p className="text-xs text-slate-500 mt-0.5">7 messages non lus sur 42 au total</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Rechercher..." className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-48" />
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {recentMessages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 cursor-pointer transition-colors ${!msg.read ? "bg-blue-50/30" : ""}`}>
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">{msg.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm ${!msg.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>{msg.from}</p>
                        {!msg.read && <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">Nouveau</span>}
                        <span className="ml-auto text-xs text-slate-400">{msg.date}</span>
                      </div>
                      <p className={`text-sm truncate ${!msg.read ? "text-slate-700" : "text-slate-500"}`}>{msg.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ CONVERSATIONS TAB ════════ */}
          {activeTab === "conversations" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Conversations IA récentes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Analyser les échanges avec l'assistant intelligent</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Rechercher..." className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-48" />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sujet</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Dernier message</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Messages</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {conversations.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{conv.user}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{conv.subject}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{conv.lastMessage}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{conv.count} msgs</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{conv.date}</td>
                        <td className="px-6 py-4"><ConvBadge status={conv.status} /></td>
                        <td className="px-6 py-4">
                          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                            Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500">Affichage de 5 sur <strong className="text-slate-700">256</strong> conversations</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Précédent</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Suivant</button>
                </div>
              </div>
            </div>
          )}

          {/* ════════ SERVICES TAB ════════ */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  + Ajouter un service
                </button>
              </div>
              <div className="grid gap-4">
                {services.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-slate-900">{s.name}</h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Actif
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{s.desc}</p>
                        <div className="flex items-center gap-6 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <strong className="text-slate-700">{s.requests}</strong> demandes
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Délai : {s.duration}
                          </span>
                          <span className="text-slate-300">{s.id}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ USERS TAB ════════ */}
          {activeTab === "users" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Gestion des clients</h2>
                  <p className="text-xs text-slate-500 mt-0.5">89 clients inscrits sur la plateforme</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Rechercher..." className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-48" />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Entreprise</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Demandes</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Inscrit le</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-700">{user.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-400">{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-600 flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" />{user.email}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><Phone className="w-3 h-3 text-slate-400" />{user.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{user.company}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500"}`}>
                            {user.status === "active" ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'DM Mono', monospace" }}>{user.requests}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(user.joined).toLocaleDateString("fr-FR")}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                            <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500">Affichage de 4 sur <strong className="text-slate-700">89</strong> clients</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Précédent</button>
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Suivant</button>
                </div>
              </div>
            </div>
          )}

          {/* ════════ SETTINGS TAB ════════ */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Paramètres</h3>
              <p className="text-sm text-slate-500">La section paramètres sera disponible prochainement.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}


