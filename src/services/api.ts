const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const TOKEN_KEY = "tema_admin_token";

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

interface DevisFromApi {
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

interface ConversationFromApi {
  id: string;
  visitorId?: string | null;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  handoff?: boolean;
  messagesCount?: number;
  lastMessage?: string;
  subject?: string;
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

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ token: string; admin: { id: string; name: string; email: string } }>(response);
  if (data.data?.token) {
    setToken(data.data.token);
  }
  return data;
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
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

export async function getDevisById(id: string) {
  const response = await fetch(`${API_URL}/devis/${id}`);
  return handleResponse(response);
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
  return handleResponse(response);
}

export async function getServices() {
  const response = await fetch(`${API_URL}/services`);
  return handleResponse<{ title: string; description: string; id: string }[]>(response);
}

export async function sendChatMessage(
  message: string,
  conversationId: string | null = null,
  visitorId: string | null = null
) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversationId, visitorId }),
  });
  return handleResponse<{ conversationId: string; reply: string }>(response);
}

export async function getConversations() {
  const response = await fetch(`${API_URL}/chat/conversations`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ConversationFromApi[]>(response);
}

export async function getConversationById(id: string) {
  const response = await fetch(`${API_URL}/chat/conversations/${id}`);
  return handleResponse(response);
}

export async function handoffConversation(id: string, message?: string) {
  const response = await fetch(`${API_URL}/chat/conversations/${id}/handoff`, {
    method: "POST",
    headers: getAuthHeaders(),
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

export async function updateSetting(key: string, value: unknown) {
  const response = await fetch(`${API_URL}/settings/${key}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ value }),
  });
  return handleResponse(response);
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
