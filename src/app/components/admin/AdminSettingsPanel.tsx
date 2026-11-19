import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  User,
  Bot,
  Users,
  Search,
  Plus,
  X,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil,
  UserX,
} from "lucide-react";
import { Switch } from "../../../components/ui/switch";
import ThemeToggle from "../ThemeToggle";
import { useTheme, type Theme } from "@/contexts/ThemeContext";

/* ─── Types ─── */
export type SettingsSectionId =
  | "admin-profile" | "password" | "appearance"
  | "ai-general" | "ai-prompt"
  | "admins" | "roles" | "permissions";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  roleLabel?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Toast = { type: "success" | "error"; message: string } | null;

const ui = {
  card: "rounded-2xl border border-[#E2E8F0]/60 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#111827] dark:shadow-none",
  input: "w-full rounded-lg border border-[#E2E8F0] dark:border-border bg-white dark:bg-input/30 px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-foreground placeholder:text-[#94A3B8] dark:placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15",
  btnPrimary: "inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#1D4ED8] active:scale-[0.98] disabled:opacity-50",
  btnSecondary: "inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-foreground transition-all duration-200 hover:bg-[#F1F5F9] dark:hover:bg-accent active:scale-[0.98]",
  btnGhost: "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#64748B] dark:text-muted-foreground transition-all duration-200 hover:bg-[#F1F5F9] dark:hover:bg-accent hover:text-[#0F172A] dark:hover:text-foreground",
  tableHead: "sticky top-0 z-10 bg-[#F8FAFC] dark:bg-muted px-4 py-3 text-left text-xs font-medium text-[#64748B] dark:text-muted-foreground",
  tableRow: "border-b border-[#F1F5F9] dark:border-border transition-colors hover:bg-[#F8FAFC]/80 dark:hover:bg-muted/50",
};

const NAV_GROUPS: {
  label: string;
  icon: React.ElementType;
  items: { id: SettingsSectionId; label: string }[];
}[] = [
  {
    label: "Compte",
    icon: User,
    items: [
      { id: "admin-profile", label: "Profil administrateur" },
      { id: "password", label: "Mot de passe" },
      { id: "appearance", label: "Apparence" },
    ],
  },
  {
    label: "Chatbot IA",
    icon: Bot,
    items: [
      { id: "ai-general", label: "Activation du chatbot" },
      { id: "ai-prompt", label: "Gestion des prompts" },
    ],
  },
  {
    label: "Administration",
    icon: Users,
    items: [
      { id: "admins", label: "Administrateurs" },
      { id: "roles", label: "Rôles" },
      { id: "permissions", label: "Permissions" },
    ],
  },
];

const SECTION_SAVE_KEY: Partial<Record<SettingsSectionId, string>> = {
  "admin-profile": "profile",
  password: "profile",
  "ai-general": "chatbot",
  "ai-prompt": "chatbot",
};

function SectionBlock({ title, description, children, onSave, onReset, saving }: {
  title: string;
  description: string;
  children: ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  saving?: boolean;
}) {
  return (
    <section className={`${ui.card} overflow-hidden`}>
      <div className="border-b border-[#F1F5F9] px-6 py-5 dark:border-border">
        <h2 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
      {(onSave || onReset) && (
        <div className="flex items-center justify-end gap-2 border-t border-[#F1F5F9] bg-[#FAFBFC] px-6 py-4 dark:border-border dark:bg-muted/30">
          {onReset && (
            <button type="button" onClick={onReset} className={ui.btnGhost}>
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </button>
          )}
          {onSave && (
            <button type="button" onClick={onSave} disabled={saving} className={ui.btnPrimary}>
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#0F172A] dark:text-foreground">{label}</label>
      {hint && <p className="text-xs text-[#94A3B8] dark:text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onCheckedChange }: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F8FAFC] px-4 py-3.5 dark:bg-muted/40">
      <div>
        <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-[#64748B] dark:text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; desc: string }[] = [
    { value: "light", label: "Clair", desc: "Interface lumineuse" },
    { value: "dark", label: "Sombre", desc: "Réduit la fatigue visuelle" },
    { value: "system", label: "Système", desc: "Suit les préférences de l'appareil" },
  ];

  return (
    <SectionBlock title="Apparence" description="Personnalisez le thème visuel de toute la plateforme.">
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`rounded-xl border p-4 text-left transition-all ${
              theme === opt.value
                ? "border-[#2563EB] bg-blue-50 dark:bg-blue-950/30 ring-2 ring-[#2563EB]/20"
                : "border-[#E2E8F0] dark:border-border hover:bg-[#F8FAFC] dark:hover:bg-accent"
            }`}
          >
            <p className="font-medium text-[#0F172A] dark:text-foreground">{opt.label}</p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-muted-foreground">{opt.desc}</p>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] dark:bg-muted px-4 py-3.5">
        <div>
          <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">Basculer rapidement</p>
          <p className="text-xs text-[#64748B] dark:text-muted-foreground">Disponible aussi dans la barre supérieure</p>
        </div>
        <ThemeToggle />
      </div>
    </SectionBlock>
  );
}

function SkeletonBlock() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-[#E2E8F0] dark:bg-muted" />
      <div className="h-4 w-full max-w-md rounded bg-[#F1F5F9] dark:bg-muted" />
      <div className="h-10 w-full rounded-lg bg-[#F1F5F9] dark:bg-muted" />
      <div className="h-10 w-full rounded-lg bg-[#F1F5F9] dark:bg-muted" />
    </div>
  );
}

export interface AdminSettingsPanelProps {
  settingDrafts: Record<string, any>;
  setSettingDrafts: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  settingsLoading: boolean;
  handleSettingSave: (key: string, value: unknown) => Promise<void>;
  chatbotEnabled: boolean;
  setChatbotEnabled: (v: boolean) => void;
  admins: Admin[];
  adminLoading: boolean;
  adminForm: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    isActive: boolean;
  };
  setAdminForm: React.Dispatch<React.SetStateAction<AdminSettingsPanelProps["adminForm"]>>;
  editingAdminId: string | null;
  adminError: string | null;
  adminMessage: string | null;
  resetAdminForm: () => void;
  handleAdminSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleEditAdmin: (admin: Admin) => void;
  handleDeleteAdmin: (adminId: string) => Promise<void>;
  onDeactivateAdmin: (admin: Admin) => Promise<void>;
  focusSection?: SettingsSectionId;
  focusVersion?: number;
}

export default function AdminSettingsPanel(props: AdminSettingsPanelProps) {
  const {
    settingDrafts, setSettingDrafts, settingsLoading,
    handleSettingSave, chatbotEnabled, setChatbotEnabled,
    admins, adminLoading, adminForm, setAdminForm, editingAdminId, adminError, adminMessage,
    resetAdminForm, handleAdminSubmit, handleEditAdmin, handleDeleteAdmin, onDeactivateAdmin,
    focusSection, focusVersion,
  } = props;

  const [activeSection, setActiveSection] = useState<SettingsSectionId>("admin-profile");
  const [settingsSearch, setSettingsSearch] = useState("");
  const [dirtySection, setDirtySection] = useState<SettingsSectionId | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("");
  const [sendInvitation, setSendInvitation] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<Admin | null>(null);
  const markDirty = useCallback(() => setDirtySection(activeSection), [activeSection]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredNav = useMemo(() => {
    const q = settingsSearch.trim().toLowerCase();
    if (!q) return NAV_GROUPS;
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q) || g.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [settingsSearch]);

  const currentSaveKey = SECTION_SAVE_KEY[activeSection];
  const hasUnsaved = dirtySection === activeSection;

  const handleSectionChange = (sectionId: SettingsSectionId) => {
    setActiveSection(sectionId);
    setSettingsSearch("");
  };

  const clearPasswordFields = () => {
    setSettingDrafts((prev) => ({
      ...prev,
      profile: { ...prev.profile, currentPassword: "", password: "" },
    }));
  };

  const saveSection = async () => {
    if (!currentSaveKey) {
      showToast("success", "Préférences enregistrées localement.");
      setDirtySection(null);
      return;
    }
    setSaving(true);
    try {
      let payload = settingDrafts[currentSaveKey];
      if (activeSection === "password") {
        if (!settingDrafts.profile.currentPassword || !settingDrafts.profile.password) {
          showToast("error", "Veuillez saisir le mot de passe actuel et le nouveau mot de passe.");
          return;
        }
      }
      if (currentSaveKey === "chatbot") {
        payload = { ...payload, enabled: chatbotEnabled };
        setSettingDrafts((prev) => ({ ...prev, chatbot: payload }));
      }
      await handleSettingSave(currentSaveKey, payload);
      if (activeSection === "password") clearPasswordFields();
      setDirtySection(null);
      showToast("success", "Modifications enregistrées avec succès.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const resetSection = () => {
    if (activeSection === "password") clearPasswordFields();
    setDirtySection(null);
    showToast("success", "Section réinitialisée.");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirtySection === activeSection) void saveSection();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("settings-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (adminMessage) showToast("success", adminMessage);
    if (adminError) showToast("error", adminError);
  }, [adminMessage, adminError]);

  useEffect(() => {
    if (focusSection) {
      setActiveSection(focusSection);
      setSettingsSearch("");
    }
  }, [focusSection, focusVersion]);

  const filteredAdmins = admins.filter((a) => {
    const q = adminSearch.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    const matchRole = !adminRoleFilter || a.role === adminRoleFilter;
    return matchSearch && matchRole;
  });

  const openAddAdmin = () => {
    resetAdminForm();
    setAdminPanelOpen(true);
  };

  const openEditAdmin = (admin: Admin) => {
    handleEditAdmin(admin);
    setAdminPanelOpen(true);
  };

  const onAdminFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    await handleAdminSubmit(e);
    setAdminPanelOpen(false);
  };

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const renderContent = () => {
    if (settingsLoading && activeSection !== "admins") {
      return <SkeletonBlock />;
    }

    switch (activeSection) {
      case "admin-profile":
        return (
          <SectionBlock title="Profil administrateur" description="Votre identité sur la plateforme." onSave={() => void saveSection()} onReset={resetSection} saving={saving}>
            <Field label="Nom complet"><input className={ui.input} value={settingDrafts.profile.name} onChange={(e) => { setSettingDrafts((p) => ({ ...p, profile: { ...p.profile, name: e.target.value } })); markDirty(); }} /></Field>
            <Field label="Email"><input type="email" className={ui.input} value={settingDrafts.profile.email} onChange={(e) => { setSettingDrafts((p) => ({ ...p, profile: { ...p.profile, email: e.target.value } })); markDirty(); }} /></Field>
          </SectionBlock>
        );

      case "password":
        return (
          <SectionBlock title="Mot de passe" description="Confirmez votre mot de passe actuel avant d'en définir un nouveau." onSave={() => void saveSection()} onReset={resetSection} saving={saving}>
            <Field label="Mot de passe actuel" hint="Obligatoire pour vérifier votre identité">
              <input
                type="password"
                autoComplete="current-password"
                className={ui.input}
                value={settingDrafts.profile.currentPassword || ""}
                onChange={(e) => { setSettingDrafts((p) => ({ ...p, profile: { ...p.profile, currentPassword: e.target.value } })); markDirty(); }}
              />
            </Field>
            <Field label="Nouveau mot de passe" hint="Minimum 8 caractères">
              <input
                type="password"
                autoComplete="new-password"
                className={ui.input}
                value={settingDrafts.profile.password || ""}
                onChange={(e) => { setSettingDrafts((p) => ({ ...p, profile: { ...p.profile, password: e.target.value } })); markDirty(); }}
              />
            </Field>
          </SectionBlock>
        );

      case "appearance":
        return <AppearanceSection />;

      case "ai-general":
        return (
          <SectionBlock title="Activation du chatbot" description="Activez ou désactivez l'assistant IA sur la plateforme." onSave={() => void saveSection()} onReset={resetSection} saving={saving}>
            <ToggleRow label="Activer le chatbot" hint="L'assistant sera visible pour les visiteurs" checked={Boolean(settingDrafts.chatbot.enabled)} onCheckedChange={(v) => { setSettingDrafts((p) => ({ ...p, chatbot: { ...p.chatbot, enabled: v } })); setChatbotEnabled(v); markDirty(); }} />
            <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3.5 dark:bg-muted/40">
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${chatbotEnabled ? "bg-green-50 text-[#22C55E] dark:bg-green-950/40" : "bg-red-50 text-[#EF4444] dark:bg-red-950/40"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${chatbotEnabled ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
                {chatbotEnabled ? "Chatbot actif" : "Chatbot désactivé"}
              </span>
            </div>
          </SectionBlock>
        );

      case "ai-prompt":
        return (
          <SectionBlock title="Gestion des prompts" description="Prompt système utilisé par le modèle IA." onSave={() => void saveSection()} onReset={resetSection} saving={saving}>
            <Field label="Prompt système" hint="Instructions fondamentales pour l'IA">
              <textarea
                className={`${ui.input} min-h-40 font-mono text-xs`}
                value={settingDrafts.chatbot?.systemPrompt || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSettingDrafts((previous) => ({
                    ...previous,
                    chatbot: {
                      ...previous.chatbot,
                      systemPrompt: value,
                    },
                  }));
                  markDirty();
                }}
              />
            </Field>
          </SectionBlock>
        );

      case "admins":
        return (
          <div className="space-y-4">
            <div className={`${ui.card} p-5`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">Administrateurs</h2>
                  <p className="text-sm text-[#64748B] dark:text-muted-foreground">{admins.length} comptes · Gérez les accès à la plateforme</p>
                </div>
                <button type="button" onClick={openAddAdmin} className={ui.btnPrimary}>
                  <Plus className="h-4 w-4" /> Ajouter un administrateur
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  <input className={`${ui.input} pl-10`} placeholder="Rechercher par nom ou email…" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} />
                </div>
                <select className={`${ui.input} sm:w-44`} value={adminRoleFilter} onChange={(e) => setAdminRoleFilter(e.target.value)}>
                  <option value="">Tous les rôles</option>
                  <option value="SUPER_ADMIN">Admin principal</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
            </div>

            <div className={`${ui.card} overflow-hidden`}>
              {adminLoading ? (
                <div className="p-6"><SkeletonBlock /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr>
                        <th className={ui.tableHead}>Utilisateur</th>
                        <th className={ui.tableHead}>Email</th>
                        <th className={ui.tableHead}>Rôle</th>
                        <th className={ui.tableHead}>Statut</th>
                        <th className={ui.tableHead}>Dernière activité</th>
                        <th className={ui.tableHead}>Créé le</th>
                        <th className={ui.tableHead}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map((admin) => (
                        <tr key={admin.id} className={ui.tableRow}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">{initials(admin.name)}</div>
                              <span className="text-sm font-medium text-[#0F172A] dark:text-foreground">{admin.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-[#64748B] dark:text-muted-foreground">{admin.email}</td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#64748B] dark:bg-muted dark:text-muted-foreground">{admin.roleLabel || admin.role}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${admin.isActive ? "bg-green-50 text-[#22C55E] dark:bg-green-950/40" : "bg-slate-100 text-[#64748B] dark:bg-muted dark:text-muted-foreground"}`}>
                              {admin.isActive ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[#94A3B8]">{admin.updatedAt ? new Date(admin.updatedAt).toLocaleDateString("fr-FR") : "—"}</td>
                          <td className="px-4 py-3.5 text-xs text-[#94A3B8]">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("fr-FR") : "—"}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex gap-1">
                              <button type="button" onClick={() => openEditAdmin(admin)} className={`${ui.btnGhost} !p-2`} title="Modifier"><Pencil className="h-4 w-4" /></button>
                              {admin.isActive && (
                                <button type="button" onClick={() => void onDeactivateAdmin(admin)} className={`${ui.btnGhost} !p-2`} title="Désactiver"><UserX className="h-4 w-4" /></button>
                              )}
                              <button type="button" onClick={() => setDeleteConfirm(admin)} className={`${ui.btnGhost} !p-2 !text-[#EF4444]`} title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case "roles":
        return (
          <SectionBlock title="Rôles" description="Hiérarchie des rôles administrateurs.">
            {[
              { role: "SUPER_ADMIN", label: "Admin principal", desc: "Accès complet à toutes les fonctionnalités" },
              { role: "ADMIN", label: "Admin", desc: "Gestion quotidienne de la plateforme" },
              { role: "SUPPORT", label: "Agent support", desc: "Conversations et messages clients" },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3.5 dark:bg-muted/40">
                <div>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{r.label}</p>
                  <p className="text-xs text-[#64748B] dark:text-muted-foreground">{r.desc}</p>
                </div>
                <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs text-[#64748B] dark:bg-card dark:text-muted-foreground">{r.role}</span>
              </div>
            ))}
          </SectionBlock>
        );

      case "permissions":
        return (
          <SectionBlock title="Permissions" description="Matrice des permissions par rôle.">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9] dark:border-border">
                    <th className="py-2 text-left text-xs font-medium text-[#64748B] dark:text-muted-foreground">Permission</th>
                    <th className="py-2 text-center text-xs font-medium text-[#64748B] dark:text-muted-foreground">Super Admin</th>
                    <th className="py-2 text-center text-xs font-medium text-[#64748B] dark:text-muted-foreground">Admin</th>
                    <th className="py-2 text-center text-xs font-medium text-[#64748B] dark:text-muted-foreground">Support</th>
                  </tr>
                </thead>
                <tbody>
                  {["Gérer les devis", "Gérer les messages", "Configurer l'IA", "Gérer les admins", "Paramètres système"].map((perm, i) => (
                    <tr key={perm} className="border-b border-[#F1F5F9] dark:border-border">
                      <td className="py-2.5 text-[#0F172A] dark:text-foreground">{perm}</td>
                      <td className="py-2.5 text-center text-[#22C55E]">✓</td>
                      <td className="py-2.5 text-center">{i < 3 ? "✓" : "—"}</td>
                      <td className="py-2.5 text-center">{i < 2 ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionBlock>
        );

      default:
        return null;
    }
  };

  const activeLabel = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeSection)?.label ?? "Paramètres";

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] flex-col bg-[#F8FAFC] dark:bg-background">
      {/* Header */}
      <div className="border-b border-[#E2E8F0]/60 bg-white px-6 py-5 dark:border-white/10 dark:bg-[#111827] lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-foreground">Paramètres</h1>
            <p className="mt-0.5 text-sm text-[#64748B] dark:text-muted-foreground">{activeLabel}</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              id="settings-search"
              className={`${ui.input} pl-10`}
              placeholder="Rechercher un paramètre… (⌘K)"
              value={settingsSearch}
              onChange={(e) => setSettingsSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left nav */}
        <nav className="w-full shrink-0 border-b border-[#E2E8F0]/60 bg-white dark:border-white/10 dark:bg-[#111827] lg:w-[260px] lg:border-b-0 lg:border-r">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
            {filteredNav.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.label} className="mb-5">
                  <p className="mb-2 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    <GroupIcon className="h-3.5 w-3.5" />
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSectionChange(item.id)}
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-all duration-150 ${
                          activeSection === item.id
                            ? "bg-blue-50 font-semibold text-[#2563EB] dark:bg-blue-950/30 dark:text-blue-300"
                            : "font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] dark:text-muted-foreground dark:hover:bg-muted/40 dark:hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Right content */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 dark:bg-background lg:p-8">
          <div className="mx-auto max-w-3xl space-y-6 transition-opacity duration-200">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      {hasUnsaved && currentSaveKey !== undefined && activeSection !== "admins" && (
        <div className="sticky bottom-0 z-30 border-t border-[#E2E8F0] bg-white/95 px-6 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-[#111827]/95 lg:px-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-[#F59E0B]">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              Modifications non enregistrées
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={resetSection} className={ui.btnGhost}>Annuler</button>
              <button type="button" onClick={() => void saveSection()} disabled={saving} className={ui.btnPrimary}>
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin slide-over */}
      {adminPanelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-[#0F172A]/20 backdrop-blur-sm transition-opacity" onClick={() => { setAdminPanelOpen(false); resetAdminForm(); }} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-250 dark:bg-[#111827]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-5 dark:border-border">
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">{editingAdminId ? "Modifier l'administrateur" : "Ajouter un administrateur"}</h2>
                <p className="text-sm text-[#64748B] dark:text-muted-foreground">Remplissez les informations du compte</p>
              </div>
              <button type="button" onClick={() => { setAdminPanelOpen(false); resetAdminForm(); }} className={ui.btnGhost}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={onAdminFormSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <Field label="Nom complet"><input required className={ui.input} value={adminForm.name} onChange={(e) => setAdminForm((p) => ({ ...p, name: e.target.value }))} /></Field>
                <Field label="Email"><input required type="email" className={ui.input} value={adminForm.email} onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))} /></Field>
                <Field label="Mot de passe"><input type="password" className={ui.input} value={adminForm.password} onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))} placeholder={editingAdminId ? "Optionnel" : "Requis"} /></Field>
                <Field label="Confirmer le mot de passe"><input type="password" className={ui.input} value={adminForm.confirmPassword} onChange={(e) => setAdminForm((p) => ({ ...p, confirmPassword: e.target.value }))} /></Field>
                <Field label="Rôle">
                  <select className={ui.input} value={adminForm.role} onChange={(e) => setAdminForm((p) => ({ ...p, role: e.target.value }))}>
                    <option value="SUPER_ADMIN">Admin principal</option>
                    <option value="ADMIN">Admin simple</option>
                    <option value="SUPPORT">Agent support</option>
                  </select>
                </Field>
                <ToggleRow label="Compte actif" checked={adminForm.isActive} onCheckedChange={(v) => setAdminForm((p) => ({ ...p, isActive: v }))} />
                <ToggleRow label="Envoyer une invitation par email" checked={sendInvitation} onCheckedChange={setSendInvitation} />
                <div className="rounded-xl bg-[#F8FAFC] p-4 dark:bg-muted/40">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Permissions</p>
                  {["Lire les devis", "Gérer le chatbot", "Modifier les paramètres"].map((perm) => (
                    <label key={perm} className="flex items-center gap-2 py-1.5 text-sm text-[#64748B] dark:text-muted-foreground">
                      <input type="checkbox" defaultChecked className="rounded" /> {perm}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-auto flex gap-2 border-t border-[#F1F5F9] pt-5 dark:border-border">
                <button type="button" onClick={() => { setAdminPanelOpen(false); resetAdminForm(); }} className={`${ui.btnSecondary} flex-1`}>Annuler</button>
                <button type="submit" className={`${ui.btnPrimary} flex-1`}>
                  {editingAdminId ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-[#0F172A]/30 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111827]">
            <h3 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">Supprimer l'administrateur ?</h3>
            <p className="mt-2 text-sm text-[#64748B] dark:text-muted-foreground">
              <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email}) sera définitivement supprimé. Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteConfirm(null)} className={ui.btnSecondary}>Annuler</button>
              <button type="button" onClick={() => { void handleDeleteAdmin(deleteConfirm.id); setDeleteConfirm(null); }} className="inline-flex items-center gap-2 rounded-lg bg-[#EF4444] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600">
                <Trash2 className="h-4 w-4" /> Supprimer
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 ${toast.type === "success" ? "bg-[#0F172A]" : "bg-[#EF4444]"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-[#22C55E]" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
