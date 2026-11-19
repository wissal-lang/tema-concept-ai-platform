import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Mail,
  Bot,
  Briefcase,
  Users,
  User,
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
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  Phone,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatusBadge from "../components/StatusBadge";
import TemaLogo from "../components/TemaLogo";
import ThemeToggle from "../components/ThemeToggle";
import AdminSettingsPanel, { type SettingsSectionId } from "../components/admin/AdminSettingsPanel";
import { createAdmin, deleteAdmin, getAdmins, getContactList, getConversationById, getConversations, getDevisList, getSettings, handoffConversation, updateAdmin, updateContactStatus, updateDevisStatus, updateSetting } from "../../services/api";

type TabType = "overview" | "requests" | "messages" | "conversations" | "services" | "users" | "settings";

type DevisActivityItem = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  projectType: string;
  budget?: string | null;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
};

type ContactActivityItem = {
  id: string;
  fullName: string;
  email: string;
  subject?: string | null;
  message: string;
  status?: string;
  createdAt: string;
};

type ConversationActivityItem = {
  id: string;
  visitorId?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  status?: string;
  handoff?: boolean;
  lastMessage?: string;
  subject?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ConversationRow = {
  id: string;
  user: string;
  subject: string;
  lastMessage: string;
  date: string;
  status: string;
  count?: number;
};

type ConversationMessage = {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
};

/* ─── Nav items ─── */
const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: number; group: string }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, group: "Principal" },
  { id: "requests", label: "Demandes de devis", icon: FileText, group: "Principal" },
  { id: "messages", label: "Messages contact", icon: Mail, group: "Principal" },
  { id: "conversations", label: "Conversations IA", icon: Bot, group: "Principal" },
  { id: "services", label: "Services", icon: Briefcase, group: "Gestion" },
  { id: "users", label: "Clients", icon: Users, group: "Gestion" },
];

const navGroups = ["Principal", "Gestion"];

/* ─── UI tokens (style only) ─── */
const ui = {
  card: "bg-white dark:bg-card rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_rgba(15,23,42,0.03)] dark:shadow-none dark:border dark:border-border",
  cardHover: "transition-all duration-200 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] dark:hover:shadow-none hover:-translate-y-px",
  input: "rounded-lg border border-[#E2E8F0] dark:border-border bg-white dark:bg-input/30 px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-foreground placeholder:text-[#64748B] dark:placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15",
  btnPrimary: "inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#1D4ED8] active:scale-[0.98]",
  btnSecondary: "inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-foreground transition-all duration-200 hover:bg-[#F1F5F9] dark:hover:bg-accent active:scale-[0.98]",
  btnGhost: "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#64748B] dark:text-muted-foreground transition-all duration-200 hover:bg-[#F1F5F9] dark:hover:bg-accent hover:text-[#0F172A] dark:hover:text-foreground active:scale-[0.98]",
  tableHead: "sticky top-0 z-10 bg-[#F8FAFC]/95 dark:bg-muted/95 backdrop-blur-sm px-6 py-4 text-left text-xs font-medium text-[#64748B] dark:text-muted-foreground",
  tableRow: "border-b border-[#F1F5F9] dark:border-border transition-colors duration-150 hover:bg-[#F8FAFC] dark:hover:bg-muted/50",
};

/* ─── Charts ─── */
const monthlyData = [
  { month: "Jan", demandes: 8, conversations: 22 },
  { month: "Fév", demandes: 12, conversations: 31 },
  { month: "Mar", demandes: 15, conversations: 38 },
  { month: "Avr", demandes: 18, conversations: 45 },
  { month: "Mai", demandes: 22, conversations: 52 },
  { month: "Jun", demandes: 24, conversations: 61 },
];

/* ─── Requests ─── */
type AdminRequest = {
  id: string;
  client: string;
  email: string;
  type: string;
  budget: string;
  status: string;
  priority: string;
  date: string;
  phone?: string | null;
  description?: string;
};

const requestStatusLabels: Record<string, string> = {
  new: "Nouvelle",
  in_progress: "En cours",
  waiting: "En attente",
  quote_sent: "Devis envoyé",
  completed: "Traitée",
  closed: "Clôturée",
};

const requestPriorityLabels: Record<string, string> = {
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

const normalizeDevisStatus = (status?: string) => {
  const map: Record<string, string> = {
    NOUVELLE: "new",
    EN_COURS: "in_progress",
    DEVIS_ENVOYE: "quote_sent",
    CLOTUREE: "closed",
  };

  return status ? map[status] ?? status : "new";
};

const toBackendDevisStatus = (status: string) => {
  const map: Record<string, string> = {
    new: "NOUVELLE",
    in_progress: "EN_COURS",
    waiting: "EN_COURS",
    quote_sent: "DEVIS_ENVOYE",
    completed: "CLOTUREE",
    closed: "CLOTUREE",
  };

  return map[status] ?? "NOUVELLE";
};

const parseBudgetAmount = (budget: string) => {
  const amounts = budget
    .match(/\d[\d\s]*/g)
    ?.map((amount) => Number(amount.replace(/\s/g, "")))
    .filter((amount) => Number.isFinite(amount)) ?? [];

  return amounts.length > 0 ? Math.max(...amounts) : 0;
};

const calculateRequestPriority = (request: AdminRequest) => {
  const budgetAmount = parseBudgetAmount(request.budget);
  const projectType = request.type.toLowerCase();
  let score = 0;

  if (budgetAmount >= 30000) score += 3;
  else if (budgetAmount >= 18000) score += 2;
  else if (budgetAmount >= 10000) score += 1;

  if (/(mobile|application|infrastructure|cloud|ia|chatbot|e-commerce)/.test(projectType)) {
    score += 2;
  } else if (/(web|site|développement)/.test(projectType)) {
    score += 1;
  }

  if (request.status === "new" || request.status === "in_progress") score += 1;
  if (request.status === "completed" || request.status === "closed") score -= 1;

  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
};

const escapeCsvValue = (value: unknown) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const exportRequestsToCsv = (requestsToExport: AdminRequest[]) => {
  const headers = ["ID", "Client", "Email", "Type de projet", "Budget", "Statut", "Priorité", "Date"];
  const rows = requestsToExport.map((request) => [
    request.id,
    request.client,
    request.email,
    request.type,
    request.budget,
    requestStatusLabels[request.status] ?? request.status,
    requestPriorityLabels[request.priority] ?? request.priority,
    new Date(request.date).toLocaleDateString("fr-FR"),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(";"))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `demandes-de-devis-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/* ─── Conversations ─── */

/* ─── Services ─── */
const services = [
  { id: "SRV-001", name: "Développement Web", desc: "Création de sites et applications web sur mesure", requests: 54, status: "active", duration: "4–8 semaines" },
  { id: "SRV-002", name: "Applications Mobiles", desc: "Développement iOS et Android natifs", requests: 43, status: "active", duration: "6–12 semaines" },
  { id: "SRV-003", name: "Consulting IT", desc: "Conseil stratégique et audit technologique", requests: 31, status: "active", duration: "2–4 semaines" },
  { id: "SRV-004", name: "Infrastructure & Support", desc: "Gestion cloud et support technique continu", requests: 28, status: "active", duration: "Continu" },
];

/* ─── Users ─── */
type ClientUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
  joined: string;
  requests: number;
  initials: string;
};

const getClientInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "CL";
};

const initialUsers: ClientUser[] = [
  { id: "USR-001", name: "Ahmed Benali", email: "ahmed.benali@email.ma", phone: "+212 6 12 34 56 78", company: "StartupTech SARL", status: "active", joined: "2025-12-15", requests: 5, initials: "AB" },
  { id: "USR-002", name: "Sara El Amrani", email: "sara.amrani@email.ma", phone: "+212 6 23 45 67 89", company: "InnovaTech", status: "active", joined: "2026-01-10", requests: 3, initials: "SE" },
  { id: "USR-003", name: "Youssef Karim", email: "youssef.karim@email.ma", phone: "+212 6 34 56 78 90", company: "Digital Solutions", status: "active", joined: "2026-02-20", requests: 7, initials: "YK" },
  { id: "USR-004", name: "Imane Alaoui", email: "imane.alaoui@email.ma", phone: "+212 6 45 67 89 01", company: "EcommercePlus", status: "inactive", joined: "2025-11-05", requests: 2, initials: "IA" },
];

/* ─── Priority badge ─── */
function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    high: "bg-red-50 text-[#EF4444]",
    medium: "bg-amber-50 text-[#F59E0B]",
    low: "bg-slate-100 text-[#64748B]",
  };
  const label: Record<string, string> = { high: "Haute", medium: "Moyenne", low: "Basse" };
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${map[priority] ?? map.low}`}>
      {label[priority] ?? "—"}
    </span>
  );
}

/* ─── Conv status badge ─── */
function ConvBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active: { cls: "bg-green-50 text-[#22C55E]", label: "Active" },
    pending: { cls: "bg-amber-50 text-[#F59E0B]", label: "À revoir" },
    needs_support: { cls: "bg-amber-50 text-[#F59E0B]", label: "Support requis" },
    transferred: { cls: "bg-blue-50 text-[#2563EB]", label: "Transférée" },
    resolved: { cls: "bg-slate-100 text-[#64748B]", label: "Résolue" },
  };
  const c = map[status] ?? map.resolved;
  return <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${c.cls}`}>{c.label}</span>;
}

/* ─── Custom Tooltip for charts ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs shadow-[0_4px_16px_rgba(15,23,42,0.08)]">
      <p className="mb-1.5 font-medium text-[#0F172A]">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

const toDate = (value?: string | Date | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatRelativeTime = (value?: string | Date | null) => {
  const date = toDate(value);
  if (!date) return "Date inconnue";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;

  return date.toLocaleDateString("fr-FR");
};

/* ═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [manualResponse, setManualResponse] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState("");
  const [requestPriorityFilter, setRequestPriorityFilter] = useState("");
  const [admins, setAdmins] = useState<Array<{ id: string; name: string; email: string; role: string; isActive: boolean; roleLabel?: string; createdAt?: string; updatedAt?: string }>>([]);
  const [devisList, setDevisList] = useState<DevisActivityItem[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactActivityItem[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationActivityItem[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationDetailsOpen, setConversationDetailsOpen] = useState(false);
  const [selectedConversationMessages, setSelectedConversationMessages] = useState<ConversationMessage[]>([]);
  const [conversationDetailLoading, setConversationDetailLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [selectedRequestStatus, setSelectedRequestStatus] = useState("");
  const [requestStatusSaving, setRequestStatusSaving] = useState(false);
  const [requestStatusMessage, setRequestStatusMessage] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsFocusSection, setSettingsFocusSection] = useState<SettingsSectionId>("admin-profile");
  const [settingsFocusVersion, setSettingsFocusVersion] = useState(0);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [clientList, setClientList] = useState<ClientUser[]>(initialUsers);
  const [clientPanelOpen, setClientPanelOpen] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "active" as ClientUser["status"],
  });
  const [settingDrafts, setSettingDrafts] = useState<Record<string, any>>({
    profile: { name: "", email: "", currentPassword: "", password: "" },
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
    setSelectedRequest(null);
    setConversationDetailsOpen(false);
    setNotificationsOpen(false);
    setSidebarOpen(false);
  };

  const resetClientForm = () => {
    setEditingClientId(null);
    setClientForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "active",
    });
    setClientError(null);
  };

  const handleEditClient = (client: ClientUser) => {
    setEditingClientId(client.id);
    setClientError(null);
    setClientMessage(null);
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone === "Non renseigné" ? "" : client.phone,
      company: client.company === "Non renseignée" ? "" : client.company,
      status: client.status,
    });
    setClientPanelOpen(true);
  };

  const handleClientSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);
    setClientMessage(null);

    const name = clientForm.name.trim();
    const email = clientForm.email.trim().toLowerCase();
    const phone = clientForm.phone.trim();
    const company = clientForm.company.trim();

    if (!name || !email) {
      setClientError("Le nom et l'email sont obligatoires.");
      return;
    }

    if (clientList.some((client) => client.email.toLowerCase() === email && client.id !== editingClientId)) {
      setClientError("Un client avec cet email existe déjà.");
      return;
    }

    if (editingClientId) {
      setClientList((currentClients) =>
        currentClients.map((client) =>
          client.id === editingClientId
            ? {
                ...client,
                name,
                email,
                phone: phone || "Non renseigné",
                company: company || "Non renseignée",
                status: clientForm.status,
                initials: getClientInitials(name),
              }
            : client
        )
      );
      setClientMessage("Client modifié avec succès.");
      setClientPanelOpen(false);
      resetClientForm();
      return;
    }

    const lastClientNumber = clientList.reduce((max, client) => {
      const match = client.id.match(/^USR-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    const newClient: ClientUser = {
      id: `USR-${String(lastClientNumber + 1).padStart(3, "0")}`,
      name,
      email,
      phone: phone || "Non renseigné",
      company: company || "Non renseignée",
      status: clientForm.status,
      joined: new Date().toISOString(),
      requests: 0,
      initials: getClientInitials(name),
    };

    setClientList((currentClients) => [newClient, ...currentClients]);
    setClientMessage("Client ajouté avec succès.");
    setClientPanelOpen(false);
    resetClientForm();
  };

  const openAdminProfile = () => {
    setSettingsFocusSection("admin-profile");
    setSettingsFocusVersion((version) => version + 1);
    setActiveTab("settings");
    setSelectedRequest(null);
    setNotificationsOpen(false);
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
    } catch {
      // chargement silencieux en cas d'erreur
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadDevis = async () => {
    try {
      const response = await getDevisList();
      if (response.success && Array.isArray(response.data)) {
        setDevisList(response.data as DevisActivityItem[]);
      }
    } catch {
      // chargement silencieux en cas d'erreur
    }
  };

  const loadContacts = async () => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      const response = await getContactList();
      if (response.success && Array.isArray(response.data)) {
        setContactMessages(response.data as ContactActivityItem[]);
      }
    } catch (error) {
      setContactMessages([]);
      setContactsError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les messages. Connectez-vous en tant qu'admin."
      );
    } finally {
      setContactsLoading(false);
    }
  };

  const handleOpenContact = async (contactId: string) => {
    setSelectedContactId(contactId);
    const contact = contactMessages.find((item) => item.id === contactId);
    if (contact?.status === "NON_LU") {
      try {
        await updateContactStatus(contactId, "LU");
        setContactMessages((prev) =>
          prev.map((item) => (item.id === contactId ? { ...item, status: "LU" } : item))
        );
      } catch {
        // lecture locale même si la mise à jour échoue
      }
    }
  };

  const loadConversations = async () => {
    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const response = await getConversations();
      if (response.success && Array.isArray(response.data)) {
        const loaded = response.data as ConversationActivityItem[];
        setConversations(loaded);
        if (loaded.length > 0 && !selectedConversationId) {
          setSelectedConversationId(loaded[0].id);
        }
      }
    } catch (error) {
      setConversations([]);
      setConversationsError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les conversations. Connectez-vous en tant qu'admin."
      );
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadConversationDetail = async (conversationId: string) => {
    setConversationDetailLoading(true);
    try {
      const response = await getConversationById(conversationId);
      if (response.success && response.data?.messages) {
        setSelectedConversationMessages(response.data.messages as ConversationMessage[]);
      } else {
        setSelectedConversationMessages([]);
      }
    } catch {
      setSelectedConversationMessages([]);
    } finally {
      setConversationDetailLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview" || activeTab === "requests") {
      void loadDevis();
    }
    if (activeTab === "overview" || activeTab === "messages") {
      void loadContacts();
    }
    if (activeTab === "overview" || activeTab === "conversations" || activeTab === "settings") {
      void loadConversations();
    }
    if (activeTab === "overview" || activeTab === "settings") {
      loadAdmins();
    }
    if (activeTab === "settings") {
      loadSettings();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "messages" && activeTab !== "overview") return;

    const interval = window.setInterval(() => {
      void loadContacts();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "conversations" && activeTab !== "overview") return;

    const interval = window.setInterval(() => {
      void loadConversations();
      if (conversationDetailsOpen && selectedConversationId) {
        void loadConversationDetail(selectedConversationId);
      }
    }, 8000);

    return () => window.clearInterval(interval);
  }, [activeTab, conversationDetailsOpen, selectedConversationId]);

  const unreadContactCount = useMemo(
    () => contactMessages.filter((contact) => contact.status === "NON_LU").length,
    [contactMessages]
  );

  const filteredContactMessages = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();
    if (!query) return contactMessages;

    return contactMessages.filter((contact) =>
      [
        contact.fullName,
        contact.email,
        contact.subject || "",
        contact.message,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [contactMessages, contactSearch]);

  const selectedContact = useMemo(
    () => contactMessages.find((contact) => contact.id === selectedContactId) ?? null,
    [contactMessages, selectedContactId]
  );

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

  const handleDeactivateAdmin = async (admin: { id: string; name: string; email: string; role: string; isActive: boolean }) => {
    setAdminError(null);
    setAdminMessage(null);
    try {
      const response = await updateAdmin(admin.id, {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: false,
      });
      if (!response.success) {
        throw new Error(response.message || "La désactivation a échoué.");
      }
      setAdminMessage("Administrateur désactivé.");
      await loadAdmins();
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  const handleSettingSave = async (key: string, value: unknown) => {
    const response = await updateSetting(key, value);
    if (!response.success) {
      throw new Error(response.message || "La sauvegarde a échoué.");
    }
    await loadSettings();
  };

  const handleHandoff = async (conversationId?: string) => {
    const targetConversationId = conversationId || selectedConversationId;
    if (!targetConversationId) {
      return;
    }

    setHandoffLoading(true);
    try {
      const response = await handoffConversation(targetConversationId, manualResponse || "Un conseiller humain prend en charge cette conversation.");
      if (!response.success) {
        throw new Error(response.message || "Échec du transfert.");
      }
      setConversations((prev) => prev.map((conversation) => conversation.id === targetConversationId ? { ...conversation, status: "transferred", handoff: true } : conversation));
      setManualResponse("");
      await loadConversations();
      await loadConversationDetail(targetConversationId);
    } finally {
      setHandoffLoading(false);
    }
  };

  const handleRequestStatusUpdate = async () => {
    if (!selectedRequest || !selectedRequestStatus) {
      return;
    }

    setRequestStatusSaving(true);
    setRequestStatusMessage(null);
    try {
      const backendStatus = toBackendDevisStatus(selectedRequestStatus);
      const response = await updateDevisStatus(selectedRequest.id, backendStatus);
      if (!response.success) {
        throw new Error(response.message || "La mise à jour du statut a échoué.");
      }
      setSelectedRequest((prev) => prev ? { ...prev, status: selectedRequestStatus, priority: calculateRequestPriority({ ...prev, status: selectedRequestStatus }) } : prev);
      setRequestStatusMessage("Statut mis à jour avec succès.");
      await loadDevis();
    } catch (error) {
      setRequestStatusMessage(error instanceof Error ? error.message : "La mise à jour du statut a échoué.");
    } finally {
      setRequestStatusSaving(false);
    }
  };

  const recentActivities = useMemo(() => {
    const activities = [
      ...devisList.map((devis) => ({
        id: `devis-${devis.id}`,
        title: "Nouvelle demande reçue",
        description: `${devis.fullName} · ${devis.projectType}`,
        date: toDate(devis.createdAt),
        icon: FileText,
      })),
      ...contactMessages.map((contact) => ({
        id: `contact-${contact.id}`,
        title: "Nouveau message contact",
        description: contact.fullName,
        date: toDate(contact.createdAt),
        icon: Mail,
      })),
      ...conversations.map((conversation) => ({
        id: `conversation-${conversation.id}`,
        title: conversation.status === "needs_support"
          ? "Support requis"
          : conversation.handoff
            ? "Conversation transférée"
            : "Conversation IA en attente",
        description: conversation.subject || conversation.clientName || conversation.visitorId || "Visiteur anonyme",
        date: toDate(conversation.updatedAt || conversation.createdAt),
        icon: MessageCircle,
      })),
      ...admins.map((admin) => ({
        id: `admin-${admin.id}`,
        title: "Administrateur ajouté",
        description: admin.name,
        date: toDate(admin.createdAt),
        icon: UserPlus,
      })),
    ]
      .filter((activity) => activity.date)
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .slice(0, 5);

    return activities;
  }, [admins, contactMessages, conversations, devisList]);

  const newRequestsCount = devisList.filter((devis) => devis.status === "NOUVELLE").length;
  const pendingConversationsCount = conversations.filter((conversation) => conversation.status === "needs_support" || conversation.handoff || conversation.status === "pending").length;
  const connectedAdminsCount = admins.filter((admin) => admin.isActive).length;
  const realRequests = useMemo<AdminRequest[]>(
    () => devisList.map((devis) => ({
      id: devis.id,
      client: devis.fullName,
      email: devis.email,
      type: devis.projectType,
      budget: devis.budget || "À définir",
      status: normalizeDevisStatus(devis.status),
      priority: "low",
      date: devis.createdAt,
      phone: devis.phone,
      description: devis.description,
    })),
    [devisList]
  );
  const scoredRequests = useMemo(
    () => realRequests.map((request) => ({ ...request, priority: calculateRequestPriority(request) })),
    [realRequests]
  );
  const filteredRequests = useMemo(() => {
    const query = requestSearch.trim().toLowerCase();

    return scoredRequests.filter((request) => {
      const matchesSearch = !query || [
        request.id,
        request.client,
        request.email,
        request.type,
        request.budget,
        requestStatusLabels[request.status],
        requestPriorityLabels[request.priority],
      ].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = !requestStatusFilter || request.status === requestStatusFilter;
      const matchesPriority = !requestPriorityFilter || request.priority === requestPriorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requestPriorityFilter, requestSearch, requestStatusFilter, scoredRequests]);
  const conversationRows: ConversationRow[] = conversations.map((conversation) => ({
    id: conversation.id,
    user: conversation.clientName || conversation.clientEmail || conversation.visitorId || "Visiteur anonyme",
    subject: conversation.subject || "Conversation IA",
    lastMessage: conversation.lastMessage || "Aucun message récent",
    date: toDate(conversation.updatedAt || conversation.createdAt)?.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) ?? "Date inconnue",
    status: conversation.status === "needs_support"
      ? "needs_support"
      : conversation.handoff
        ? "transferred"
        : conversation.status || "active",
  }));
  const selectedConversation = conversationRows.find((conversation) => conversation.id === selectedConversationId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-background font-sans text-[#0F172A] dark:text-foreground">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-[#0F172A]/20 backdrop-blur-sm transition-opacity duration-200 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-[250px] flex-shrink-0 flex-col
          bg-white dark:bg-card transition-transform duration-250 ease-out
          lg:static
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[72px] flex-shrink-0 items-center gap-3 px-6">
          <div className="min-w-0 flex-1">
            <TemaLogo variant="admin" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`${ui.btnGhost} !p-1.5 lg:hidden`}
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-3">
          {navGroups.map((group) => (
            <div key={group}>
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8] dark:text-muted-foreground">{group}</p>
              <div className="space-y-1">
                {navItems.filter((item) => item.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`
                        group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm
                        transition-all duration-200 hover:translate-x-0.5
                        ${active
                          ? "bg-[#F8FAFC] dark:bg-muted/60 font-semibold text-[#0F172A] dark:text-foreground"
                          : "font-medium text-[#64748B] dark:text-muted-foreground hover:bg-[#F8FAFC] dark:hover:bg-muted/40 hover:text-[#0F172A] dark:hover:text-foreground"}
                      `}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[#2563EB]" />
                      )}
                      <Icon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${active ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-[#64748B]"}`} />
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      {item.id === "messages" && unreadContactCount > 0 && (
                        <span className={`min-w-[20px] rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold ${active ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] dark:bg-muted text-[#64748B] dark:text-muted-foreground"}`}>
                          {unreadContactCount}
                        </span>
                      )}
                      {item.badge !== undefined && (
                        <span className={`min-w-[20px] rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold ${active ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] dark:bg-muted text-[#64748B] dark:text-muted-foreground"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="flex-shrink-0 space-y-1 border-t border-[#EEF2F7] px-4 py-4 dark:border-border">
          <button
            onClick={() => handleNav("settings")}
            className={`
              flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 hover:translate-x-0.5
              ${activeTab === "settings" ? "bg-[#F8FAFC] dark:bg-muted/60 font-semibold text-[#0F172A] dark:text-foreground" : "text-[#64748B] dark:text-muted-foreground hover:bg-[#F8FAFC] dark:hover:bg-muted/40 hover:text-[#0F172A] dark:hover:text-foreground"}
            `}
          >
            <Settings className="h-[18px] w-[18px] text-[#94A3B8]" />
            Paramètres
          </button>
          <Link
            to="/"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#64748B] dark:text-muted-foreground transition-all duration-200 hover:translate-x-0.5 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-[#EF4444]"
          >
            <LogOut className="h-[18px] w-[18px] text-[#94A3B8]" />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* ══════════ MAIN AREA ══════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <header className="flex h-[72px] flex-shrink-0 items-center gap-4 border-b border-[#EEF2F7] bg-white/80 px-8 backdrop-blur-sm dark:border-border dark:bg-card/80">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`${ui.btnGhost} lg:hidden`}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="relative hidden flex-1 md:block md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full rounded-full border border-[#EEF2F7] bg-[#F8FAFC] px-4 py-2.5 pl-10 text-sm text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#CBD5E1] focus:bg-white dark:border-border dark:bg-muted/40 dark:text-foreground dark:focus:bg-card"
            />
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <ThemeToggle />
            {/* Notification */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className={`${ui.btnGhost} relative !p-2.5`}
                aria-label="Afficher les notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {recentActivities.length > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-card" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:border-border dark:bg-card">
                  <div className="border-b border-[#F1F5F9] px-4 py-3 dark:border-border">
                    <p className="text-sm font-semibold text-[#0F172A] dark:text-foreground">Notifications</p>
                    <p className="mt-0.5 text-xs text-[#64748B] dark:text-muted-foreground">Dernières activités de la plateforme</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {recentActivities.length === 0 ? (
                      <div className="rounded-xl px-3 py-6 text-center text-sm text-[#64748B] dark:text-muted-foreground">
                        Aucune notification pour le moment.
                      </div>
                    ) : (
                      recentActivities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <button
                            key={activity.id}
                            type="button"
                            onClick={() => setNotificationsOpen(false)}
                            className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#F8FAFC] dark:hover:bg-muted/50"
                          >
                            <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] dark:bg-muted dark:text-muted-foreground">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-[#0F172A] dark:text-foreground">{activity.title}</span>
                              <span className="mt-0.5 block truncate text-xs text-[#64748B] dark:text-muted-foreground">{activity.description}</span>
                              <span className="mt-1 block text-xs text-[#94A3B8] dark:text-muted-foreground">{formatRelativeTime(activity.date)}</span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">Admin</p>
                <p className="text-xs text-[#64748B] dark:text-muted-foreground">Super Admin</p>
              </div>
              <button
                type="button"
                onClick={openAdminProfile}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#2563EB] transition-transform duration-200 hover:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                aria-label="Ouvrir le profil administrateur"
              >
                <span className="text-xs font-semibold text-white">AD</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className={`flex-1 overflow-y-auto ${activeTab === "settings" ? "" : "space-y-8 p-8"}`} style={{ scrollbarWidth: "thin" }}>

          {activeTab !== "settings" && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] dark:text-foreground">
                {selectedRequest ? "Détail de la demande" : pageTitle[activeTab]}
              </h1>
              {activeTab === "overview" && (
                <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">Vue générale des activités de Tema Concept</p>
              )}
              {selectedRequest && (
                <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">
                  {selectedRequest.id} · {selectedRequest.client}
                </p>
              )}
            </div>
            {activeTab === "overview" && (
              <div className="hidden items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs text-[#64748B] shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                Mis à jour à l&apos;instant
              </div>
            )}
          </div>
          )}

          {/* ════════ OVERVIEW TAB ════════ */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <section className={`${ui.card} ${ui.cardHover} overflow-hidden rounded-[24px] border border-[#EEF2F7] dark:border-border p-8 md:p-10`}>
                <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm font-medium text-[#64748B] dark:text-muted-foreground">Bonjour Admin</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0F172A] dark:text-foreground md:text-4xl">
                      Votre plateforme est en bonne santé.
                    </h2>
                    <div className="mt-8 grid gap-6 sm:grid-cols-3">
                      {[
                        { value: String(newRequestsCount), label: "nouvelles demandes" },
                        { value: String(pendingConversationsCount), label: "conversations en attente" },
                        { value: String(connectedAdminsCount), label: "administrateurs actifs" },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-3xl font-semibold tracking-tight text-[#0F172A] dark:text-foreground">{item.value}</p>
                          <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab("requests")} className={`${ui.btnPrimary} mt-9`}>
                      Voir les demandes
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative hidden h-44 w-44 flex-shrink-0 items-center justify-center lg:flex">
                    <div className="absolute inset-0 rounded-[36px] border border-[#EEF2F7] dark:border-border" />
                    <Bot className="h-20 w-20 text-[#CBD5E1] dark:text-muted-foreground/50" strokeWidth={1.4} />
                    <span className="absolute right-8 top-8 h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
                  </div>
                </div>
              </section>

              <section className="grid gap-8 xl:grid-cols-[minmax(0,1.85fr)_minmax(320px,1fr)]">
                <div className={`${ui.card} rounded-[24px] border border-[#EEF2F7] dark:border-border p-7`}>
                  <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-[#0F172A] dark:text-foreground">Évolution des demandes de devis</h3>
                      <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">Vue simplifiée des demandes reçues.</p>
                    </div>
                    <div className="flex rounded-full bg-[#F8FAFC] dark:bg-muted p-1 text-xs">
                      {["Today", "7 days", "30 days", "Year"].map((period, index) => (
                        <button
                          key={period}
                          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${index === 2 ? "bg-white dark:bg-card text-[#0F172A] dark:text-foreground shadow-sm" : "text-[#64748B] dark:text-muted-foreground hover:text-[#0F172A] dark:hover:text-foreground"}`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={42} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="demandes" name="Demandes" stroke="#2563EB" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#2563EB" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={`${ui.card} rounded-[24px] border border-[#EEF2F7] dark:border-border p-7`}>
                  <h3 className="text-lg font-semibold tracking-tight text-[#0F172A] dark:text-foreground">Activités récentes</h3>
                  <div className="mt-7 space-y-6">
                    {recentActivities.length === 0 && (
                      <div className="rounded-2xl bg-[#F8FAFC] p-5 text-sm text-[#64748B] dark:bg-muted dark:text-muted-foreground">
                        Aucune activité récente pour le moment.
                      </div>
                    )}
                    {recentActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-4">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] dark:bg-muted">
                            <Icon className="h-4 w-4 text-[#64748B] dark:text-muted-foreground" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{activity.title}</p>
                            <p className="mt-0.5 truncate text-xs text-[#64748B] dark:text-muted-foreground">{activity.description}</p>
                            <p className="mt-1 text-xs text-[#94A3B8] dark:text-muted-foreground">{formatRelativeTime(activity.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* ════════ REQUESTS TAB ════════ */}
          {activeTab === "requests" && (
            selectedRequest ? (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedRequestStatus("");
                    setRequestStatusMessage(null);
                  }}
                  className={`${ui.btnGhost} !px-0 hover:!bg-transparent`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux demandes
                </button>

                <section className={`${ui.card} rounded-[24px] border border-[#EEF2F7] p-7 dark:border-border`}>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold tracking-tight text-[#0F172A] dark:text-foreground">{selectedRequest.type}</h2>
                        <StatusBadge status={selectedRequest.status} />
                        <PriorityBadge priority={selectedRequest.priority} />
                      </div>
                      <p className="text-sm text-[#64748B] dark:text-muted-foreground">ID : {selectedRequest.id}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={ui.btnSecondary}>Imprimer</button>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 dark:bg-muted/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] dark:bg-blue-950/40">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] dark:text-muted-foreground">Type de service</p>
                        <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{selectedRequest.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 dark:bg-muted/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#16A34A] dark:bg-green-950/40">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] dark:text-muted-foreground">Date</p>
                        <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{new Date(selectedRequest.date).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 dark:bg-muted/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-[#7C3AED] dark:bg-violet-950/40">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] dark:text-muted-foreground">Budget</p>
                        <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{selectedRequest.budget}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                  <div className="space-y-6">
                    <div className={`${ui.card} rounded-[24px] border border-[#EEF2F7] p-6 dark:border-border`}>
                      <h3 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">Informations du client</h3>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {[
                          { label: "Nom complet", value: selectedRequest.client, icon: User },
                          { label: "Email", value: selectedRequest.email, icon: Mail },
                          { label: "Téléphone", value: "+212 6XX-XXXXXX", icon: Phone },
                          { label: "Entreprise", value: "Non renseignée", icon: Briefcase },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 dark:bg-muted/40">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#64748B] shadow-sm dark:bg-card dark:text-muted-foreground">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-xs text-[#64748B] dark:text-muted-foreground">{item.label}</p>
                                <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{item.value}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`${ui.card} rounded-[24px] border border-[#EEF2F7] p-6 dark:border-border`}>
                      <h3 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">Réponse admin</h3>
                      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-[#64748B] dark:text-muted-foreground">Statut de la demande</label>
                          <select
                            className={`${ui.input} w-full`}
                            value={selectedRequestStatus || selectedRequest.status}
                            onChange={(event) => {
                              setSelectedRequestStatus(event.target.value);
                              setRequestStatusMessage(null);
                            }}
                          >
                            <option value="new">Nouvelle</option>
                            <option value="in_progress">En cours</option>
                            <option value="quote_sent">Devis envoyé</option>
                            <option value="closed">Clôturée</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => void handleRequestStatusUpdate()}
                            disabled={requestStatusSaving || selectedRequestStatus === selectedRequest.status}
                            className={`${ui.btnPrimary} w-full disabled:cursor-not-allowed disabled:opacity-60 md:w-auto`}
                          >
                            {requestStatusSaving ? "Mise à jour..." : "Enregistrer le statut"}
                          </button>
                        </div>
                      </div>
                      {requestStatusMessage && (
                        <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                          requestStatusMessage.includes("succès")
                            ? "bg-green-50 text-[#16A34A] dark:bg-green-950/30"
                            : "bg-red-50 text-[#EF4444] dark:bg-red-950/30"
                        }`}>
                          {requestStatusMessage}
                        </p>
                      )}
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <select className={ui.input} defaultValue={selectedRequest.priority}>
                          <option value="low">Basse</option>
                          <option value="medium">Moyenne</option>
                          <option value="high">Haute</option>
                        </select>
                      </div>
                      <textarea
                        rows={5}
                        className={`${ui.input} mt-4 w-full resize-none`}
                        placeholder="Rédigez votre réponse au client..."
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" className={ui.btnPrimary}>
                          <Send className="h-4 w-4" />
                          Envoyer la réponse
                        </button>
                        <button type="button" className={ui.btnSecondary}>Brouillon</button>
                      </div>
                    </div>
                  </div>

                  <div className={`${ui.card} h-fit rounded-[24px] border border-[#EEF2F7] p-6 dark:border-border`}>
                    <h3 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">Suivi de la demande</h3>
                    <div className="mt-6 space-y-6">
                      {[
                        { label: "Demande soumise", date: selectedRequest.date, done: true },
                        { label: "En cours de révision", date: "En cours", done: true, active: true },
                        { label: "Préparation du devis", date: "À venir", done: false },
                        { label: "Réponse envoyée", date: "À venir", done: false },
                      ].map((step, index, stepsList) => (
                        <div key={step.label} className="relative flex gap-4">
                          {index < stepsList.length - 1 && (
                            <span className={`absolute left-4 top-9 h-full w-px ${step.done ? "bg-green-200 dark:bg-green-900" : "bg-[#E2E8F0] dark:bg-border"}`} />
                          )}
                          <span className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${step.done ? "bg-green-500 text-white" : "bg-[#F1F5F9] text-[#94A3B8] dark:bg-muted"}`}>
                            {step.done ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-4 w-4" />}
                          </span>
                          <div className="pb-1">
                            <p className={`text-sm font-medium ${step.active ? "text-[#2563EB]" : "text-[#0F172A] dark:text-foreground"}`}>{step.label}</p>
                            <p className="mt-0.5 text-xs text-[#64748B] dark:text-muted-foreground">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            ) : (
            <div className={`${ui.card} overflow-hidden`}>
              <div className="px-6 py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Rechercher une demande, un client ou un service..."
                      value={requestSearch}
                      onChange={(event) => setRequestSearch(event.target.value)}
                      className={`${ui.input} w-full pl-10`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      className={`${ui.input} !w-auto`}
                      value={requestStatusFilter}
                      onChange={(event) => setRequestStatusFilter(event.target.value)}
                    >
                      <option value="">Statut</option>
                      <option value="new">Nouvelle</option>
                      <option value="in_progress">En cours</option>
                      <option value="waiting">En attente</option>
                      <option value="quote_sent">Devis envoyé</option>
                      <option value="completed">Traitée</option>
                      <option value="closed">Clôturée</option>
                    </select>
                    <select
                      className={`${ui.input} !w-auto`}
                      value={requestPriorityFilter}
                      onChange={(event) => setRequestPriorityFilter(event.target.value)}
                    >
                      <option value="">Priorité</option>
                      <option value="high">Haute</option>
                      <option value="medium">Moyenne</option>
                      <option value="low">Basse</option>
                    </select>
                    <button type="button" onClick={() => exportRequestsToCsv(filteredRequests)} className={ui.btnSecondary}>
                      <Download className="h-4 w-4" />
                      Exporter
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={ui.tableHead}>ID</th>
                      <th className={ui.tableHead}>Client</th>
                      <th className={ui.tableHead}>Type de projet</th>
                      <th className={ui.tableHead}>Budget</th>
                      <th className={ui.tableHead}>Statut</th>
                      <th className={ui.tableHead}>Priorité</th>
                      <th className={ui.tableHead}>Date</th>
                      <th className={ui.tableHead}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className={ui.tableRow}>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-[#64748B]">{req.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#0F172A]">{req.client}</p>
                          <p className="text-xs text-[#64748B]">{req.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">{req.type}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-[#0F172A]">{req.budget}</span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                        <td className="px-6 py-4"><PriorityBadge priority={req.priority} /></td>
                        <td className="px-6 py-4 text-xs text-[#64748B]">{new Date(req.date).toLocaleDateString("fr-FR")}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(req);
                                setSelectedRequestStatus(req.status);
                                setRequestStatusMessage(null);
                              }}
                              className={`${ui.btnGhost} !p-2 !text-[#2563EB]`}
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className={`${ui.btnGhost} !p-2`} title="Modifier">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className={`${ui.btnGhost} !p-2`} title="Répondre">
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">Aucune demande trouvée</p>
                          <p className="mt-1 text-xs text-[#64748B] dark:text-muted-foreground">Essayez de modifier la recherche ou les filtres.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-5">
                <p className="text-xs text-[#64748B] dark:text-muted-foreground">
                  Affichage de {filteredRequests.length} sur <strong className="text-[#0F172A] dark:text-foreground">{scoredRequests.length}</strong> demandes
                </p>
                <div className="flex gap-2">
                  <button className={ui.btnSecondary}>Précédent</button>
                  <button className={ui.btnPrimary}>Suivant</button>
                </div>
              </div>
            </div>
            )
          )}

          {/* ════════ MESSAGES TAB ════════ */}
          {activeTab === "messages" && (
            selectedContact ? (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setSelectedContactId(null)}
                  className={`${ui.btnGhost} !px-0 hover:!bg-transparent`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux messages
                </button>

                <section className={`${ui.card} rounded-[24px] border border-[#EEF2F7] p-6 dark:border-border`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#64748B] dark:text-muted-foreground">
                        {toDate(selectedContact.createdAt)?.toLocaleString("fr-FR")}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A] dark:text-foreground">
                        {selectedContact.subject || "Message de contact"}
                      </h2>
                      <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">
                        {selectedContact.fullName} · {selectedContact.email}
                      </p>
                    </div>
                    <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      selectedContact.status === "NON_LU"
                        ? "bg-blue-50 text-[#2563EB]"
                        : selectedContact.status === "REPONDU"
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-[#64748B]"
                    }`}>
                      {selectedContact.status === "NON_LU" ? "Nouveau" : selectedContact.status === "REPONDU" ? "Répondu" : "Lu"}
                    </span>
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5 dark:bg-muted/40">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8] dark:text-muted-foreground">Message</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#0F172A] dark:text-foreground">
                      {selectedContact.message}
                    </p>
                  </div>

                  <div className="mt-4">
                    <a
                      href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(`Re: ${selectedContact.subject || "Votre message Tema Concept"}`)}`}
                      className={ui.btnPrimary}
                    >
                      <Mail className="h-4 w-4" />
                      Répondre par email
                    </a>
                  </div>
                </section>
              </div>
            ) : (
            <div className={`${ui.card} overflow-hidden`}>
              <div className="flex items-center justify-between px-6 py-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#0F172A] dark:text-foreground">Messages contact</h2>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">
                    {contactMessages.length > 0
                      ? `${unreadContactCount} non lu${unreadContactCount > 1 ? "s" : ""} sur ${contactMessages.length} message${contactMessages.length > 1 ? "s" : ""}`
                      : "Les messages envoyés depuis la page d'accueil apparaîtront ici."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => void loadContacts()} className={ui.btnSecondary}>
                    Actualiser
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      value={contactSearch}
                      onChange={(event) => setContactSearch(event.target.value)}
                      placeholder="Rechercher..."
                      className={`${ui.input} w-48 pl-10`}
                    />
                  </div>
                </div>
              </div>

              {contactsError && (
                <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                  {contactsError}
                </div>
              )}

              <div>
                {contactsLoading ? (
                  <div className="px-6 py-8 text-sm text-[#64748B] dark:text-muted-foreground">
                    Chargement des messages...
                  </div>
                ) : filteredContactMessages.length === 0 ? (
                  <div className="px-6 py-8 text-sm text-[#64748B] dark:text-muted-foreground">
                    Aucun message de contact pour le moment.
                  </div>
                ) : (
                  filteredContactMessages.map((msg) => {
                    const isUnread = msg.status === "NON_LU";
                    const initials = getClientInitials(msg.fullName);
                    const preview = msg.subject || msg.message.slice(0, 80);

                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => void handleOpenContact(msg.id)}
                        className={`flex w-full cursor-pointer items-start gap-4 px-6 py-5 text-left transition-colors duration-150 hover:bg-[#F8FAFC] dark:hover:bg-muted/40 ${isUnread ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
                          <span className="text-xs font-semibold text-[#2563EB]">{initials}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-2">
                            <p className={`text-sm ${isUnread ? "font-semibold text-[#0F172A] dark:text-foreground" : "font-medium text-[#64748B] dark:text-muted-foreground"}`}>
                              {msg.fullName}
                            </p>
                            {isUnread && (
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#2563EB] dark:bg-blue-950/40">
                                Nouveau
                              </span>
                            )}
                            <span className="ml-auto text-xs text-[#94A3B8]">
                              {formatRelativeTime(toDate(msg.createdAt))}
                            </span>
                          </div>
                          <p className="truncate text-xs text-[#94A3B8] dark:text-muted-foreground">{msg.email}</p>
                          <p className={`mt-1 truncate text-sm ${isUnread ? "text-[#0F172A] dark:text-foreground" : "text-[#64748B] dark:text-muted-foreground"}`}>
                            {preview}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            )
          )}

          {/* ════════ CONVERSATIONS TAB ════════ */}
          {activeTab === "conversations" && (
            conversationDetailsOpen && selectedConversation ? (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => {
                    setConversationDetailsOpen(false);
                    setManualResponse("");
                  }}
                  className={`${ui.btnGhost} !px-0 hover:!bg-transparent`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux conversations
                </button>

                <section className={`${ui.card} rounded-[24px] border border-[#EEF2F7] p-6 dark:border-border`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#64748B] dark:text-muted-foreground">{selectedConversation.date}</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A] dark:text-foreground">{selectedConversation.subject}</h2>
                      <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">{selectedConversation.user}</p>
                    </div>
                    <ConvBadge status={selectedConversation.status} />
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#F8FAFC] p-5 dark:bg-muted/40">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8] dark:text-muted-foreground">Historique des messages</p>
                    {conversationDetailLoading ? (
                      <p className="mt-3 text-sm text-[#64748B] dark:text-muted-foreground">Chargement des messages...</p>
                    ) : selectedConversationMessages.length === 0 ? (
                      <p className="mt-3 text-sm text-[#64748B] dark:text-muted-foreground">Aucun message enregistré pour cette conversation.</p>
                    ) : (
                      <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto">
                        {selectedConversationMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                              msg.sender === "USER"
                                ? "bg-white text-[#0F172A] dark:bg-card dark:text-foreground"
                                : msg.sender === "SUPPORT"
                                  ? "bg-violet-50 text-violet-900 dark:bg-violet-950/30 dark:text-violet-100"
                                  : "bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100"
                            }`}
                          >
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
                              {msg.sender === "USER" ? "Client" : msg.sender === "SUPPORT" ? "Support" : "Assistant IA"}
                              {" · "}
                              {new Date(msg.createdAt).toLocaleString("fr-FR")}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className={`${ui.card} rounded-[24px] border border-[#EEF2F7] p-6 dark:border-border`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] dark:bg-blue-950/40">
                      <Send className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">Répondre comme support</h3>
                      <p className="text-sm text-[#64748B] dark:text-muted-foreground">Le support humain prend la main sur cette conversation.</p>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    value={manualResponse}
                    onChange={(event) => setManualResponse(event.target.value)}
                    className={`${ui.input} mt-5 w-full resize-none`}
                    placeholder="Écrivez votre réponse support au client..."
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleHandoff(selectedConversation.id)}
                      disabled={handoffLoading || !manualResponse.trim()}
                      className={ui.btnPrimary}
                    >
                      <Send className="h-4 w-4" />
                      {handoffLoading ? "Envoi..." : "Envoyer la réponse"}
                    </button>
                    <button type="button" onClick={() => setManualResponse("")} className={ui.btnSecondary}>
                      Effacer
                    </button>
                  </div>
                </section>
              </div>
            ) : (
              <div className={`${ui.card} overflow-hidden`}>
                <div className="flex items-center justify-between px-6 py-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0F172A] dark:text-foreground">Conversations IA</h2>
                    <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">Voir une conversation et répondre comme support.</p>
                  </div>
                  <button type="button" onClick={() => void loadConversations()} className={ui.btnSecondary}>
                    Actualiser
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {conversationsError && (
                    <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                      {conversationsError}
                    </div>
                  )}
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={ui.tableHead}>Date</th>
                        <th className={`${ui.tableHead} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversationsLoading ? (
                        <tr>
                          <td colSpan={2} className="px-6 py-8 text-sm text-[#64748B] dark:text-muted-foreground">
                            Chargement des conversations...
                          </td>
                        </tr>
                      ) : conversationRows.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-6 py-8 text-sm text-[#64748B] dark:text-muted-foreground">
                            Aucune conversation enregistrée pour le moment. Les messages du chatbot apparaîtront ici.
                          </td>
                        </tr>
                      ) : conversationRows.map((conv) => (
                        <tr key={conv.id} className={ui.tableRow}>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{conv.date}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <p className="max-w-xl truncate text-xs text-[#64748B] dark:text-muted-foreground">{conv.lastMessage}</p>
                              <ConvBadge status={conv.status} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedConversationId(conv.id);
                                  setConversationDetailsOpen(true);
                                  setManualResponse("");
                                  void loadConversationDetail(conv.id);
                                }}
                                className={`${ui.btnGhost} !px-2.5 !py-1.5 !text-[#2563EB] hover:!bg-blue-50 dark:hover:!bg-blue-950/30`}
                              >
                                <Eye className="h-4 w-4" />
                                Voir
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedConversationId(conv.id);
                                  setConversationDetailsOpen(true);
                                  setManualResponse("");
                                  void loadConversationDetail(conv.id);
                                }}
                                className={ui.btnPrimary}
                              >
                                <Send className="h-4 w-4" />
                                Répondre support
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* ════════ SERVICES TAB ════════ */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button className={ui.btnPrimary}>
                  + Ajouter un service
                </button>
              </div>
              <div className="grid gap-6">
                {services.map((s) => (
                  <div key={s.id} className={`${ui.card} ${ui.cardHover} p-6`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-base font-semibold text-[#0F172A]">{s.name}</h3>
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-medium text-[#22C55E]">
                            Actif
                          </span>
                        </div>
                        <p className="mb-4 text-sm text-[#64748B]">{s.desc}</p>
                        <div className="flex items-center gap-6 text-xs text-[#64748B]">
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-[#94A3B8]" />
                            <strong className="text-[#0F172A]">{s.requests}</strong> demandes
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-[#94A3B8]" />
                            Délai : {s.duration}
                          </span>
                          <span className="text-[#CBD5E1]">{s.id}</span>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 gap-1">
                        <button className={`${ui.btnGhost} !p-2`}>
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className={`${ui.btnGhost} !p-2`}>
                          <MoreVertical className="h-4 w-4" />
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
            <div className={`${ui.card} overflow-hidden`}>
              <div className="flex items-center justify-between px-6 py-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#0F172A]">Gestion des clients</h2>
                  <p className="mt-1 text-sm text-[#64748B]">{clientList.length} clients inscrits sur la plateforme</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" />
                    <input placeholder="Rechercher..." className={`${ui.input} w-48 pl-10`} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClientMessage(null);
                      setEditingClientId(null);
                      setClientPanelOpen(true);
                    }}
                    className={ui.btnPrimary}
                  >
                    <UserPlus className="h-4 w-4" />
                    Ajouter
                  </button>
                </div>
              </div>
              {(clientMessage || clientError) && (
                <div className="mx-6 mb-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm">
                  <p className={clientError ? "text-[#EF4444]" : "text-[#22C55E]"}>
                    {clientError ?? clientMessage}
                  </p>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={ui.tableHead}>Client</th>
                      <th className={ui.tableHead}>Contact</th>
                      <th className={ui.tableHead}>Entreprise</th>
                      <th className={ui.tableHead}>Statut</th>
                      <th className={ui.tableHead}>Demandes</th>
                      <th className={ui.tableHead}>Inscrit le</th>
                      <th className={ui.tableHead}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientList.map((user) => (
                      <tr key={user.id} className={ui.tableRow}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                              <span className="text-xs font-semibold text-[#2563EB]">{user.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#0F172A]">{user.name}</p>
                              <p className="text-xs text-[#64748B]">{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="flex items-center gap-1.5 text-xs text-[#64748B]"><Mail className="h-3.5 w-3.5 text-[#94A3B8]" />{user.email}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B]"><Phone className="h-3.5 w-3.5 text-[#94A3B8]" />{user.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">{user.company}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${user.status === "active" ? "bg-green-50 text-[#22C55E]" : "bg-slate-100 text-[#64748B]"}`}>
                            {user.status === "active" ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-[#0F172A]">{user.requests}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#64748B]">{new Date(user.joined).toLocaleDateString("fr-FR")}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button className={`${ui.btnGhost} !p-2 !text-[#2563EB]`}><Eye className="h-4 w-4" /></button>
                            <button type="button" onClick={() => handleEditClient(user)} className={`${ui.btnGhost} !p-2`}><Edit className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-5">
                <p className="text-xs text-[#64748B]">Affichage de <strong className="text-[#0F172A]">{clientList.length}</strong> clients</p>
                <div className="flex gap-2">
                  <button className={ui.btnSecondary}>Précédent</button>
                  <button className={ui.btnPrimary}>Suivant</button>
                </div>
              </div>
            </div>
          )}

          {clientPanelOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-[#0F172A]/20 backdrop-blur-sm transition-opacity"
                onClick={() => {
                  setClientPanelOpen(false);
                  resetClientForm();
                }}
              />
              <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-250 dark:bg-[#111827]">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-5 dark:border-border">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">
                      {editingClientId ? "Modifier le client" : "Ajouter un client"}
                    </h2>
                    <p className="text-sm text-[#64748B] dark:text-muted-foreground">
                      {editingClientId ? "Mettez à jour les informations du client" : "Remplissez les informations du client"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClientPanelOpen(false);
                      resetClientForm();
                    }}
                    className={ui.btnGhost}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleClientSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
                  <div className="space-y-4">
                    {clientError && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-[#EF4444]">
                        {clientError}
                      </div>
                    )}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#0F172A] dark:text-foreground">Nom complet</label>
                      <input
                        required
                        className={`${ui.input} w-full`}
                        value={clientForm.name}
                        onChange={(event) => setClientForm((previous) => ({ ...previous, name: event.target.value }))}
                        placeholder="Ex. Ahmed Benali"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#0F172A] dark:text-foreground">Email</label>
                      <input
                        required
                        type="email"
                        className={`${ui.input} w-full`}
                        value={clientForm.email}
                        onChange={(event) => setClientForm((previous) => ({ ...previous, email: event.target.value }))}
                        placeholder="client@email.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#0F172A] dark:text-foreground">Téléphone</label>
                      <input
                        className={`${ui.input} w-full`}
                        value={clientForm.phone}
                        onChange={(event) => setClientForm((previous) => ({ ...previous, phone: event.target.value }))}
                        placeholder="+212 6 00 00 00 00"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#0F172A] dark:text-foreground">Entreprise</label>
                      <input
                        className={`${ui.input} w-full`}
                        value={clientForm.company}
                        onChange={(event) => setClientForm((previous) => ({ ...previous, company: event.target.value }))}
                        placeholder="Nom de l'entreprise"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#0F172A] dark:text-foreground">Statut</label>
                      <select
                        className={`${ui.input} w-full`}
                        value={clientForm.status}
                        onChange={(event) => setClientForm((previous) => ({ ...previous, status: event.target.value as ClientUser["status"] }))}
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2 border-t border-[#F1F5F9] pt-5 dark:border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setClientPanelOpen(false);
                        resetClientForm();
                      }}
                      className={`${ui.btnSecondary} flex-1`}
                    >
                      Annuler
                    </button>
                    <button type="submit" className={`${ui.btnPrimary} flex-1`}>
                      {editingClientId ? "Enregistrer les modifications" : "Ajouter le client"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ════════ SETTINGS TAB ════════ */}
          {activeTab === "settings" && (
            <AdminSettingsPanel
              settingDrafts={settingDrafts}
              setSettingDrafts={setSettingDrafts}
              settingsLoading={settingsLoading}
              handleSettingSave={handleSettingSave}
              chatbotEnabled={chatbotEnabled}
              setChatbotEnabled={setChatbotEnabled}
              admins={admins}
              adminLoading={adminLoading}
              adminForm={adminForm}
              setAdminForm={setAdminForm}
              editingAdminId={editingAdminId}
              adminError={adminError}
              adminMessage={adminMessage}
              resetAdminForm={resetAdminForm}
              handleAdminSubmit={handleAdminSubmit}
              handleEditAdmin={handleEditAdmin}
              handleDeleteAdmin={handleDeleteAdmin}
              onDeactivateAdmin={handleDeactivateAdmin}
              focusSection={settingsFocusSection}
              focusVersion={settingsFocusVersion}
            />
          )}

        </main>
      </div>
    </div>
  );
}


