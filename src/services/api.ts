const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const TOKEN_KEY = "tema_admin_token";
const CLIENT_TOKEN_KEY = "tema_client_token";
const CLIENT_KEY = "tema_client";
const CHAT_CONVERSATION_KEY_PREFIX = "tema_chat_conversation_id";

const clearStoredChatConversations = (): void => {
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CHAT_CONVERSATION_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
};

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface DevisData {
  fullName: string;
  email: string;
  phone?: string;
  projectType: string;
  budget?: string;
  description: string;
}

interface ContactData {
  fullName: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactFromApi {
  id: string;
  fullName: string;
  email: string;
  subject?: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface DevisFromApi {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  projectType: string;
  budget?: string | null;
  description: string;
  status: string;
  createdAt: string;
}

export interface ConversationFromApi {
  id: string;
  visitorId?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  handoff?: boolean;
  messagesCount?: number;
  lastMessage?: string;
  subject?: string;
}

interface ChatMessageFromApi {
  id: string;
  conversationId: string;
  sender: "USER" | "BOT" | "SUPPORT";
  content: string;
  createdAt: string;
}

interface ConversationDetailFromApi {
  id: string;
  status: string;
  handoff: boolean;
  messages: ChatMessageFromApi[];
  client?: { id: string; name: string; email: string } | null;
}

interface AdminFromApi {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleLabel?: string;
}

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}

export const getClientToken = (): string | null => localStorage.getItem(CLIENT_TOKEN_KEY);
export const setClientToken = (token: string): void => localStorage.setItem(CLIENT_TOKEN_KEY, token);
export const removeClientToken = (): void => localStorage.removeItem(CLIENT_TOKEN_KEY);

export const getStoredClient = (): ClientAccount | null => {
  const raw = localStorage.getItem(CLIENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClientAccount;
  } catch {
    return null;
  }
};
export const setStoredClient = (client: ClientAccount): void =>
  localStorage.setItem(CLIENT_KEY, JSON.stringify(client));

export const logoutClient = (): void => {
  removeClientToken();
  localStorage.removeItem(CLIENT_KEY);
  clearStoredChatConversations();
};

const getClientAuthHeaders = (): Record<string, string> => {
  const token = getClientToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json().catch(() => ({})) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(data.message || "Une erreur est survenue.");
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{
    token: string;
    role: "admin" | "client";
    admin?: { id: string; name: string; email: string };
    client?: ClientAccount;
  }>(response);

  if (data.data?.token) {
    if (data.data.role === "admin") {
      logoutClient();
      setToken(data.data.token);
    } else {
      removeToken();
      setClientToken(data.data.token);
      if (data.data.client) {
        setStoredClient(data.data.client);
      }
    }
  }

  return data;
}

/** @deprecated Utiliser loginUser */
export async function loginAdmin(email: string, password: string) {
  return loginUser(email, password);
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function registerClient(payload: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch(`${API_URL}/auth/client/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ token: string; client: ClientAccount }>(response);
  if (data.data?.token) {
    removeToken();
    setClientToken(data.data.token);
    setStoredClient(data.data.client);
  }
  return data;
}

export async function loginClient(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/client/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ token: string; client: ClientAccount }>(response);
  if (data.data?.token) {
    removeToken();
    setClientToken(data.data.token);
    setStoredClient(data.data.client);
  }
  return data;
}

export async function getClientMe() {
  const response = await fetch(`${API_URL}/auth/client/me`, {
    headers: getClientAuthHeaders(),
  });
  return handleResponse<ClientAccount>(response);
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ debugResetUrl?: string }>(response);
}

export async function resetPassword(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getAdmins() {
  const response = await fetch(`${API_URL}/auth/admins`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<AdminFromApi[]>(response);
}

export async function createAdmin(payload: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  isActive?: boolean;
}) {
  const response = await fetch(`${API_URL}/auth/admins`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AdminFromApi>(response);
}

export async function updateAdmin(id: string, payload: {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}) {
  const response = await fetch(`${API_URL}/auth/admins/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AdminFromApi>(response);
}

export async function deleteAdmin(id: string) {
  const response = await fetch(`${API_URL}/auth/admins/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createDevis(devisData: DevisData) {
  const response = await fetch(`${API_URL}/devis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(devisData),
  });
  return handleResponse(response);
}

export async function getDevisList() {
  const response = await fetch(`${API_URL}/devis`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<DevisFromApi[]>(response);
}

export async function getMyDevis() {
  const response = await fetch(`${API_URL}/devis/mine`, {
    headers: getClientAuthHeaders(),
  });
  return handleResponse<DevisFromApi[]>(response);
}

export async function getDevisById(id: string) {
  const response = await fetch(`${API_URL}/devis/${id}`);
  return handleResponse<DevisFromApi>(response);
}

export async function updateDevisStatus(id: string, status: string) {
  const response = await fetch(`${API_URL}/devis/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export async function deleteDevis(id: string) {
  const response = await fetch(`${API_URL}/devis/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createContact(contactData: ContactData) {
  const response = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });
  return handleResponse(response);
}

export async function getContactList() {
  const response = await fetch(`${API_URL}/contact`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ContactFromApi[]>(response);
}

export async function updateContactStatus(id: string, status: "NON_LU" | "LU" | "REPONDU") {
  const response = await fetch(`${API_URL}/contact/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse<ContactFromApi>(response);
}

export async function getServices() {
  const response = await fetch(`${API_URL}/services`);
  return handleResponse<{ title: string; description: string; id: string }[]>(response);
}

const getChatHeaders = (): Record<string, string> => {
  const token = getClientToken() || getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function sendChatMessage(
  message: string,
  conversationId: string | null = null,
  visitorId: string | null = null
) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: getChatHeaders(),
    body: JSON.stringify({ message, conversationId, visitorId }),
  });
  return handleResponse<{
    conversationId: string;
    reply: string | null;
    handoff?: boolean;
    status?: string;
    supportReason?: string;
    awaitingSupport?: boolean;
    messages?: ChatMessageFromApi[];
  }>(response);
}

export async function getClientConversations() {
  const response = await fetch(`${API_URL}/chat/client/conversations`, {
    headers: getClientAuthHeaders(),
  });
  return handleResponse<ConversationFromApi[]>(response);
}

export async function getConversations() {
  const response = await fetch(`${API_URL}/chat/conversations`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ConversationFromApi[]>(response);
}

export async function getConversationById(id: string) {
  const response = await fetch(`${API_URL}/chat/conversations/${id}`, {
    headers: getChatHeaders(),
  });
  return handleResponse<ConversationDetailFromApi>(response);
}

export async function handoffConversation(id: string, message?: string) {
  const response = await fetch(`${API_URL}/chat/conversations/${id}/handoff`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  return handleResponse<{ id: string; handoff: boolean; status: string }>(response);
}

export async function requestConversationSupport(id: string, message?: string) {
  const response = await fetch(`${API_URL}/chat/conversations/${id}/support-request`, {
    method: "POST",
    headers: getClientAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  return handleResponse<{ id: string; handoff: boolean; status: string }>(response);
}

export async function getSettings() {
  const response = await fetch(`${API_URL}/settings`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Record<string, unknown>>(response);
}

export async function getSettingsMeta() {
  const response = await fetch(`${API_URL}/settings/meta`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getSettingByKey(key: string) {
  const response = await fetch(`${API_URL}/settings/${encodeURIComponent(key)}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<{ key: string; value: unknown }>(response);
}

export async function updateSetting(key: string, value: unknown) {
  const response = await fetch(`${API_URL}/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ value }),
  });
  return handleResponse(response);
}

export async function updateSettings(values: Record<string, unknown>) {
  const response = await fetch(`${API_URL}/settings`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(values),
  });
  return handleResponse<Record<string, unknown>>(response);
}

export async function resetSetting(key: string) {
  const response = await fetch(`${API_URL}/settings/${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function resetAllSettings() {
  const response = await fetch(`${API_URL}/settings/reset`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<Record<string, unknown>>(response);
}

export function mapDevisStatus(status: string): string {
  const map: Record<string, string> = {
    NOUVELLE: "new",
    EN_COURS: "in_progress",
    DEVIS_ENVOYE: "quote_sent",
    CLOTUREE: "closed",
  };
  return map[status] || "new";
}

export function mapDevisToUI(devis: DevisFromApi) {
  return {
    id: devis.id,
    client: devis.fullName,
    email: devis.email,
    service: devis.projectType,
    status: mapDevisStatus(devis.status),
    priority: "medium",
    date: devis.createdAt,
    phone: devis.phone,
    budget: devis.budget,
    description: devis.description,
  };
}

export function mapConversationToUI(conv: ConversationFromApi) {
  return {
    id: conv.id,
    user: conv.visitorId || "Visiteur anonyme",
    subject: conv.subject || "Conversation",
    lastMessage: conv.lastMessage || "",
    date: new Date(conv.createdAt).toLocaleDateString("fr-FR"),
    status: "active",
    messagesCount: conv.messagesCount || 0,
  };
}
