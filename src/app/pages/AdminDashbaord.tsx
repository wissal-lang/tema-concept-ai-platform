import { useEffect, useState, type FormEvent } from "react";
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
  TrendingDown,
  Clock,
  MoreVertical,
  Phone,
  ArrowUpRight,
  MessageCircle,
  ChevronRight,
  Zap,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  MessageSquareMore,
  BadgeCheck,
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
import { createAdmin, deleteAdmin, getAdmins, getConversations, getSettings, handoffConversation, sendChatMessage, updateAdmin, updateSetting } from "../../services/api";

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

const settingsSections = [
  {
    title: "Profil administrateur",
    description: "Gérez votre identité, votre email et votre mot de passe.",
    icon: UserPlus,
    accent: "from-blue-600 to-blue-500",
    details: ["Nom", "Email", "Mot de passe", "Avatar"],
  },
  {
    title: "Informations de l’entreprise",
    description: "Personnalisez les informations visibles sur votre plateforme.",
    icon: Briefcase,
    accent: "from-slate-700 to-slate-600",
    details: ["Nom", "Logo", "Email", "Téléphone", "Adresse", "Réseaux"],
  },
  {
    title: "Gestion des services",
    description: "Ajoutez, modifiez et organisez vos offres de services.",
    icon: SlidersHorizontal,
    accent: "from-emerald-600 to-emerald-500",
    details: ["Ajouter", "Modifier", "Activer", "Ordre d’affichage"],
  },
  {
    title: "Demandes de devis",
    description: "Définissez les notifications et l’email de réception.",
    icon: FileText,
    accent: "from-violet-600 to-violet-500",
    details: ["Email", "Statut", "Notifications", "Message auto"],
  },
  {
    title: "Chatbot IA",
    description: "Contrôlez le comportement et le ton de votre assistant IA.",
    icon: Bot,
    accent: "from-cyan-600 to-cyan-500",
    details: ["Activer", "Nom", "Accueil", "Ton", "FAQ"],
  },
  {
    title: "Notifications",
    description: "Choisissez les alertes à recevoir par email et dashboard.",
    icon: Bell,
    accent: "from-amber-500 to-orange-500",
    details: ["Devis", "Contact", "Chatbot", "Dashboard"],
  },
  {
    title: "Sécurité",
    description: "Renforcez la protection de votre espace administrateur.",
    icon: ShieldCheck,
    accent: "from-rose-600 to-rose-500",
    details: ["Mot de passe", "Session", "Déconnexion"],
  },
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
const mockConversations = [
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
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState("Les modifications sont sauvegardées dans la base de données.");
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [manualResponse, setManualResponse] = useState("");
  const [settingsData, setSettingsData] = useState<Record<string, unknown>>({});
  const settingsCount = Object.keys(settingsData).length;
  const chatbotStatusLabel = chatbotEnabled ? "Actif" : "Désactivé";
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [admins, setAdmins] = useState<Array<{ id: string; name: string; email: string; role: string; isActive: boolean; roleLabel?: string }>>([]);
  const [conversations, setConversations] = useState<Array<{ id: string; visitorId?: string | null; status?: string; handoff?: boolean; lastMessage?: string; subject?: string }>>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [settingDrafts, setSettingDrafts] = useState<Record<string, any>>({
    profile: { name: "", email: "", password: "" },
    company: { name: "", email: "", phone: "", address: "", website: "" },
    devis: { recipientEmail: "", autoReply: true, message: "" },
    chatbot: { enabled: true, name: "Tema Assistant", welcomeMessage: "Bonjour, comment puis-je vous aider ?", tone: "professionnel" },
    notifications: { devis: true, contact: true, chatbot: true, dashboard: true },
    security: { require2FA: false, sessionTimeout: "60", autoLogout: true },
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN" as string,
    isActive: true,
  });

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

  const loadAdmins = async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const response = await getAdmins();
      if (response.success && Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        throw new Error(response.message || "Impossible de charger les administrateurs.");
      }
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Impossible de charger les administrateurs.");
    } finally {
      setAdminLoading(false);
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await getSettings();
      if (response.success && response.data) {
        const data = response.data as Record<string, unknown>;
        setSettingsData(data);
        setSettingDrafts((prev) => ({
          ...prev,
          profile: { ...prev.profile, ...(typeof data.profile === "object" && data.profile ? data.profile as Record<string, unknown> : {}) },
          company: { ...prev.company, ...(typeof data.company === "object" && data.company ? data.company as Record<string, unknown> : {}) },
          devis: { ...prev.devis, ...(typeof data.devis === "object" && data.devis ? data.devis as Record<string, unknown> : {}) },
          chatbot: { ...prev.chatbot, ...(typeof data.chatbot === "object" && data.chatbot ? data.chatbot as Record<string, unknown> : {}) },
          notifications: { ...prev.notifications, ...(typeof data.notifications === "object" && data.notifications ? data.notifications as Record<string, unknown> : {}) },
          security: { ...prev.security, ...(typeof data.security === "object" && data.security ? data.security as Record<string, unknown> : {}) },
        }));
        const chatbotSettings = data.chatbot as { enabled?: boolean } | undefined;
        setChatbotEnabled(Boolean(chatbotSettings?.enabled));
      }
    } catch (error) {
      setSettingsMessage("Impossible de charger les réglages depuis le backend.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await getConversations();
      if (response.success && Array.isArray(response.data)) {
        const loaded = response.data as Array<{ id: string; visitorId?: string | null; status?: string; handoff?: boolean; lastMessage?: string; subject?: string }>;
        setConversations(loaded);
        if (loaded.length > 0 && !selectedConversationId) {
          setSelectedConversationId(loaded[0].id);
        }
        if (loaded.length === 0) {
          const created = await sendChatMessage("Bonjour, je souhaite parler à un conseiller.", null, "demo-visitor");
          if (created.success && created.data?.conversationId) {
            setConversations([{ id: created.data.conversationId, visitorId: "demo-visitor", status: "active", handoff: false, lastMessage: created.data.reply, subject: "Conversation de test" }]);
            setSelectedConversationId(created.data.conversationId);
          }
        }
      }
    } catch (error) {
      setSettingsMessage("Impossible de charger les conversations du backend.");
    }
  };

  useEffect(() => {
    if (activeTab === "settings") {
      loadAdmins();
      loadSettings();
      void loadConversations();
    }
  }, [activeTab]);

  const resetAdminForm = () => {
    setEditingAdminId(null);
    setAdminForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "ADMIN",
      isActive: true,
    });
  };

  const handleAdminSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminError(null);
    setAdminMessage(null);

    try {
      if (editingAdminId) {
        const payload: Record<string, unknown> = {
          name: adminForm.name,
          email: adminForm.email,
          role: adminForm.role,
          isActive: adminForm.isActive,
        };
        if (adminForm.password) {
          payload.password = adminForm.password;
        }
        const response = await updateAdmin(editingAdminId, payload);
        if (!response.success) {
          throw new Error(response.message || "La mise à jour a échoué.");
        }
        setAdminMessage("Administrateur mis à jour avec succès.");
      } else {
        if (!adminForm.password || !adminForm.confirmPassword) {
          throw new Error("Le mot de passe et sa confirmation sont obligatoires.");
        }
        const response = await createAdmin({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
          confirmPassword: adminForm.confirmPassword,
          role: adminForm.role,
          isActive: adminForm.isActive,
        });
        if (!response.success) {
          throw new Error(response.message || "L’ajout a échoué.");
        }
        setAdminMessage("Administrateur ajouté avec succès.");
      }
      resetAdminForm();
      await loadAdmins();
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  const handleEditAdmin = (admin: { id: string; name: string; email: string; role: string; isActive: boolean }) => {
    setEditingAdminId(admin.id);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: "",
      confirmPassword: "",
      role: admin.role,
      isActive: admin.isActive,
    });
    setAdminMessage(null);
    setAdminError(null);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm("Supprimer cet administrateur ?")) return;
    setAdminError(null);
    setAdminMessage(null);
    try {
      const response = await deleteAdmin(adminId);
      if (!response.success) {
        throw new Error(response.message || "La suppression a échoué.");
      }
      setAdminMessage("Administrateur supprimé.");
      await loadAdmins();
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  const handleSettingSave = async (key: string, value: unknown) => {
    try {
      const response = await updateSetting(key, value);
      if (!response.success) {
        throw new Error(response.message || "La sauvegarde a échoué.");
      }
      setSettingsData((prev) => ({ ...prev, [key]: value }));
      setSettingsMessage(`Réglage “${key}” enregistré.`);
      await loadSettings();
    } catch (error) {
      setSettingsMessage(error instanceof Error ? error.message : "Erreur pendant la sauvegarde.");
    }
  };

  const saveCurrentSetting = async () => {
    if (!selectedSetting) {
      setSettingsMessage("Sélectionnez d’abord une section à enregistrer.");
      return;
    }

    const keyMap: Record<string, string> = {
      "Profil administrateur": "profile",
      "Informations de l’entreprise": "company",
      "Demandes de devis": "devis",
      "Chatbot IA": "chatbot",
      "Notifications": "notifications",
      "Sécurité": "security",
    };

    const key = keyMap[selectedSetting];
    if (!key) {
      setSettingsMessage("Section non prise en charge.");
      return;
    }

    await handleSettingSave(key, settingDrafts[key]);
  };

  const handleHandoff = async (conversationId?: string) => {
    const targetConversationId = conversationId || selectedConversationId;
    if (!targetConversationId) {
      setSettingsMessage("Aucune conversation n’est disponible pour le transfert.");
      return;
    }

    setHandoffLoading(true);
    try {
      const response = await handoffConversation(targetConversationId, manualResponse || "Un conseiller humain prend en charge cette conversation.");
      if (!response.success) {
        throw new Error(response.message || "Échec du transfert.");
      }
      setConversations((prev) => prev.map((conversation) => conversation.id === targetConversationId ? { ...conversation, status: "transferred", handoff: true } : conversation));
      setSettingsMessage("Conversation transférée vers l’équipe humaine.");
      setManualResponse("");
    } catch (error) {
      setSettingsMessage(error instanceof Error ? error.message : "Erreur lors du transfert.");
    } finally {
      setHandoffLoading(false);
    }
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
                      <Tooltip />
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
                    {mockConversations.map((conv) => (
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
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
                      <Settings className="w-3.5 h-3.5" />
                      Paramètres
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">Paramètres</h3>
                    <p className="text-sm text-slate-500 mt-2">Gérez la configuration générale de la plateforme Tema Concept.</p>
                  </div>
                  <button
                    onClick={() => {
                      void saveCurrentSetting();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Enregistrer les changements
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-700">
                {settingsMessage}
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {settingsSections.map(({ title, description, icon: Icon, accent, details }) => (
                  <div key={title} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                    <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="mt-4">
                      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{description}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {details.map((detail) => (
                        <span key={detail} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {detail}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedSetting(selectedSetting === title ? null : title)}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {selectedSetting === title ? "Masquer" : "Configurer"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {selectedSetting && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Section active</p>
                      <p className="text-sm text-slate-500">{selectedSetting}</p>
                    </div>
                    <button
                      onClick={() => setSelectedSetting(null)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Fermer
                    </button>
                  </div>

                  {settingsLoading ? (
                    <p className="mt-4 text-sm text-slate-500">Chargement des réglages…</p>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {selectedSetting === "Profil administrateur" && (
                        <>
                          <input value={settingDrafts.profile.name} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, profile: { ...prev.profile, name: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Nom de l’administrateur" />
                          <input value={settingDrafts.profile.email} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, profile: { ...prev.profile, email: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Email de contact" />
                          <input type="password" value={settingDrafts.profile.password} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, profile: { ...prev.profile, password: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Nouveau mot de passe" />
                        </>
                      )}
                      {selectedSetting === "Informations de l’entreprise" && (
                        <>
                          <input value={settingDrafts.company.name} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, company: { ...prev.company, name: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Nom de l’entreprise" />
                          <input value={settingDrafts.company.email} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, company: { ...prev.company, email: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Email de l’entreprise" />
                          <input value={settingDrafts.company.phone} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, company: { ...prev.company, phone: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Téléphone" />
                          <input value={settingDrafts.company.address} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, company: { ...prev.company, address: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Adresse" />
                          <input value={settingDrafts.company.website} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, company: { ...prev.company, website: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Site web" />
                        </>
                      )}
                      {selectedSetting === "Demandes de devis" && (
                        <>
                          <input value={settingDrafts.devis.recipientEmail} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, devis: { ...prev.devis, recipientEmail: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Email destinataire" />
                          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={Boolean(settingDrafts.devis.autoReply)} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, devis: { ...prev.devis, autoReply: event.target.checked } }))} /> Réponse automatique</label>
                          <textarea value={settingDrafts.devis.message} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, devis: { ...prev.devis, message: event.target.value } }))} className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Message automatique" />
                        </>
                      )}
                      {selectedSetting === "Chatbot IA" && (
                        <>
                          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={Boolean(settingDrafts.chatbot.enabled)} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, chatbot: { ...prev.chatbot, enabled: event.target.checked } }))} /> Activer le chatbot</label>
                          <input value={settingDrafts.chatbot.name} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, chatbot: { ...prev.chatbot, name: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Nom du chatbot" />
                          <input value={settingDrafts.chatbot.welcomeMessage} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, chatbot: { ...prev.chatbot, welcomeMessage: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Message d’accueil" />
                          <select value={settingDrafts.chatbot.tone} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, chatbot: { ...prev.chatbot, tone: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                            <option value="professionnel">Professionnel</option>
                            <option value="chaleureux">Chaleureux</option>
                            <option value="direct">Direct</option>
                          </select>
                        </>
                      )}
                      {selectedSetting === "Notifications" && (
                        <>
                          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={Boolean(settingDrafts.notifications.devis)} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, notifications: { ...prev.notifications, devis: event.target.checked } }))} /> Notifications de devis</label>
                          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={Boolean(settingDrafts.notifications.contact)} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, notifications: { ...prev.notifications, contact: event.target.checked } }))} /> Notifications de contact</label>
                          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={Boolean(settingDrafts.notifications.chatbot)} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, notifications: { ...prev.notifications, chatbot: event.target.checked } }))} /> Notifications chatbot</label>
                          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={Boolean(settingDrafts.notifications.dashboard)} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, notifications: { ...prev.notifications, dashboard: event.target.checked } }))} /> Notifications tableau de bord</label>
                        </>
                      )}
                      {selectedSetting === "Sécurité" && (
                        <>
                          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={Boolean(settingDrafts.security.require2FA)} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, security: { ...prev.security, require2FA: event.target.checked } }))} /> Activer la 2FA</label>
                          <input value={settingDrafts.security.sessionTimeout} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, security: { ...prev.security, sessionTimeout: event.target.value } }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Délai de session (min)" />
                          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={Boolean(settingDrafts.security.autoLogout)} onChange={(event) => setSettingDrafts((prev) => ({ ...prev, security: { ...prev.security, autoLogout: event.target.checked } }))} /> Déconnexion automatique</label>
                        </>
                      )}
                      <button onClick={() => { void saveCurrentSetting(); }} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Enregistrer cette section</button>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Gestion des administrateurs</h3>
                    <p className="text-sm text-slate-500 mt-2">Ajoutez, modifiez ou supprimez les accès administrateurs directement depuis la plateforme.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">Liste des administrateurs</h4>
                      <span className="text-xs text-slate-500">{admins.length} comptes</span>
                    </div>
                    {adminLoading ? (
                      <p className="mt-4 text-sm text-slate-500">Chargement…</p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {admins.map((admin) => (
                          <div key={admin.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{admin.name}</p>
                              <p className="text-xs text-slate-500">{admin.email}</p>
                              <p className="text-[11px] text-slate-400 mt-1">{admin.roleLabel || admin.role}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditAdmin(admin)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Modifier</button>
                              <button onClick={() => handleDeleteAdmin(admin.id)} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Supprimer</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAdminSubmit} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">{editingAdminId ? "Modifier un administrateur" : "Ajouter un administrateur"}</h4>
                      {editingAdminId && (
                        <button type="button" onClick={resetAdminForm} className="text-xs font-medium text-slate-500 hover:text-slate-700">Annuler</button>
                      )}
                    </div>

                    {adminError && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{adminError}</div>
                    )}
                    {adminMessage && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{adminMessage}</div>
                    )}

                    <div className="mt-4 space-y-3">
                      <input
                        value={adminForm.name}
                        onChange={(event) => setAdminForm((prev) => ({ ...prev, name: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                        placeholder="Nom complet"
                        required
                      />
                      <input
                        type="email"
                        value={adminForm.email}
                        onChange={(event) => setAdminForm((prev) => ({ ...prev, email: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                        placeholder="Email"
                        required
                      />
                      <input
                        type="password"
                        value={adminForm.password}
                        onChange={(event) => setAdminForm((prev) => ({ ...prev, password: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                        placeholder={editingAdminId ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                      />
                      <input
                        type="password"
                        value={adminForm.confirmPassword}
                        onChange={(event) => setAdminForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                        placeholder={editingAdminId ? "Confirmation du nouveau mot de passe" : "Confirmer le mot de passe"}
                      />
                      <select
                        value={adminForm.role}
                        onChange={(event) => setAdminForm((prev) => ({ ...prev, role: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      >
                        <option value="SUPER_ADMIN">Admin principal</option>
                        <option value="ADMIN">Admin simple</option>
                        <option value="SUPPORT">Agent support</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={adminForm.isActive}
                          onChange={(event) => setAdminForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                        />
                        Compte actif
                      </label>
                    </div>

                    <button type="submit" className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                      {editingAdminId ? "Mettre à jour" : "Ajouter l’administrateur"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 md:p-8 text-white shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 mb-3">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Important
                    </div>
                    <h3 className="text-xl font-semibold">Gestion des réponses humaines</h3>
                    <p className="text-sm text-slate-300 mt-2">L’agent peut reprendre une conversation, désactiver le chatbot et répondre manuellement au client.</p>
                    <p className="mt-2 text-xs text-blue-100">{settingsCount} réglages chargés depuis la base de données · Chatbot {chatbotStatusLabel}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChatbotEnabled(false)}
                      className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                    >
                      Désactiver le chatbot
                    </button>
                    <button
                      onClick={() => setChatbotEnabled(true)}
                      className="rounded-xl bg-blue-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-400 transition-colors"
                    >
                      Réactiver le chatbot
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Conversations réelles</p>
                      <select
                        value={selectedConversationId ?? ""}
                        onChange={(event) => setSelectedConversationId(event.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-950/30 px-2.5 py-2 text-xs text-white"
                      >
                        {conversations.map((conversation) => (
                          <option key={conversation.id} value={conversation.id}>{conversation.subject || conversation.id}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      {conversations.length === 0 ? (
                        <p className="text-sm text-slate-300">Aucune conversation n’est encore disponible. Une conversation de test sera créée automatiquement au chargement.</p>
                      ) : conversations.map((conversation) => (
                        <div key={conversation.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold">{conversation.subject || conversation.id}</p>
                            <p className="text-xs text-slate-300 mt-1">{conversation.lastMessage || "Aucun message"}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-100">
                              {conversation.handoff ? "Transférée" : conversation.status === "transferred" ? "Transférée" : "Active"}
                            </span>
                            <button onClick={() => { setSelectedConversationId(conversation.id); void handleHandoff(conversation.id); }} className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-200 hover:text-white">
                              <MessageSquareMore className="w-3.5 h-3.5" />
                              {handoffLoading ? "Transfert..." : "Transférer"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
                      <MessageCircle className="w-4 h-4" />
                      Réponse manuelle
                    </div>
                    <textarea
                      value={manualResponse}
                      onChange={(event) => setManualResponse(event.target.value)}
                      className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Rédigez la réponse à envoyer au client..."
                    />
                    <button
                      onClick={() => {
                        void handleHandoff(selectedConversationId ?? undefined);
                      }}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}


