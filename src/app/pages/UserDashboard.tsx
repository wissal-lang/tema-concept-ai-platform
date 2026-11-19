import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  Folder,
  HelpCircle,
  LogOut,
  MessageCircle,
  PlusCircle,
  Smartphone,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import TemaLogo from "../components/TemaLogo";
import { getMyDevis, getStoredClient, logoutClient, mapDevisStatus, type DevisFromApi } from "@/services/api";

type ClientRequest = {
  id: string;
  title: string;
  service: string;
  status: string;
  date: string;
  icon: LucideIcon;
  iconBg: string;
};

const getRequestIcon = (projectType: string): { icon: LucideIcon; iconBg: string } => {
  const type = projectType.toLowerCase();
  if (/(mobile|application)/.test(type)) {
    return { icon: Smartphone, iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300" };
  }
  if (/(web|site)/.test(type)) {
    return { icon: FileText, iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300" };
  }
  return { icon: Folder, iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300" };
};

const mapDevisToClientRequest = (devis: DevisFromApi): ClientRequest => {
  const { icon, iconBg } = getRequestIcon(devis.projectType);
  return {
    id: devis.id,
    title: devis.description.slice(0, 60) || devis.projectType,
    service: devis.projectType,
    status: mapDevisStatus(devis.status),
    date: devis.createdAt,
    icon,
    iconBg,
  };
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const client = getStoredClient();
  const firstName = client?.name?.trim().split(/\s+/)[0] || "cher client";
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await getMyDevis();
        if (response.success && Array.isArray(response.data)) {
          setRequests(response.data.map(mapDevisToClientRequest));
        }
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    void loadRequests();
  }, []);

  const handleLogout = () => {
    logoutClient();
    navigate("/login");
  };

  const latestRequest = requests[0] ?? null;
  const LatestIcon = latestRequest?.icon ?? Folder;

  const steps = useMemo(() => {
    if (!latestRequest) return [];

    const status = latestRequest.status;
    const isNew = status === "new";
    const isInProgress = status === "in_progress" || status === "waiting";
    const isQuoteSent = status === "quote_sent";
    const isClosed = status === "closed" || status === "completed";

    return [
      { label: "Reçue", date: "OK", done: true },
      { label: "En analyse", date: isNew ? "En cours" : "OK", done: !isNew, active: isNew },
      { label: "En traitement", date: isInProgress ? "En cours" : isQuoteSent || isClosed ? "OK" : "À venir", done: isQuoteSent || isClosed, active: isInProgress },
      { label: "Devis envoyé", date: isQuoteSent ? "OK" : "À venir", done: isQuoteSent || isClosed, active: isQuoteSent },
      { label: "Terminée", date: isClosed ? "OK" : "À venir", done: isClosed, active: false },
    ];
  }, [latestRequest]);

  const quickActions = [
    { to: "/new-request", icon: PlusCircle, title: "Créer une demande", desc: "Démarrer un nouveau projet" },
    { to: "/dashboard/requests", icon: Folder, title: "Voir mes demandes", desc: "Consulter l'historique" },
    { to: "/chatbot", icon: MessageCircle, title: "Contacter l'équipe", desc: "Discuter avec un expert" },
  ];

  const resources = [
    { label: "Guide d'utilisation", icon: BookOpen },
    { label: "FAQ", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#EEF2F7] bg-white/80 px-6 backdrop-blur-sm dark:border-border dark:bg-card/80 lg:px-8">
        <TemaLogo variant="sidebar" asLink to="/dashboard" />

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] transition-all hover:bg-[#F8FAFC] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
          >
            <User className="h-4 w-4" />
            Profil
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[#64748B] transition-all hover:bg-red-50 hover:text-[#EF4444] dark:text-muted-foreground dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-8">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-[#64748B] dark:text-muted-foreground">👋 Bonjour {firstName}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0F172A] dark:text-foreground md:text-4xl">
                  {requests.length > 0 ? "Suivez vos demandes simplement." : "Bienvenue sur votre espace client."}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#64748B] dark:text-muted-foreground">
                  {requests.length > 0
                    ? "Retrouvez l'état de vos projets, consultez les dernières mises à jour et contactez l'équipe Tema Concept en quelques clics."
                    : "Vous n'avez pas encore de demande de devis. Créez votre première demande pour démarrer un projet avec Tema Concept."}
                </p>
              </div>

              {loading ? (
                <div className="rounded-[24px] border border-[#EEF2F7] bg-white p-8 text-sm text-[#64748B] dark:border-border dark:bg-card dark:text-muted-foreground">
                  Chargement de vos demandes...
                </div>
              ) : latestRequest ? (
                <div className="rounded-[24px] border border-[#EEF2F7] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)] dark:border-border dark:bg-card">
                  <div className="mb-5 flex items-center gap-2">
                    <Folder className="h-4 w-4 text-[#7C3AED]" />
                    <p className="text-sm font-semibold text-[#0F172A] dark:text-foreground">Dernière demande</p>
                  </div>

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${latestRequest.iconBg}`}>
                        <LatestIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">{latestRequest.title}</h2>
                        <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">
                          {latestRequest.service} · {new Date(latestRequest.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={latestRequest.status} />
                  </div>

                  {steps.length > 0 && (
                    <div className="mt-7">
                      <div className="relative grid grid-cols-5 gap-2">
                        <div className="absolute left-[8%] right-[8%] top-4 h-px bg-[#E2E8F0] dark:bg-border" />
                        {steps.map((step) => (
                          <div key={step.label} className="relative flex flex-col items-center text-center">
                            <span className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white dark:bg-card ${
                              step.active
                                ? "border-[#2563EB] text-[#2563EB] ring-4 ring-blue-50 dark:ring-blue-950/40"
                                : step.done
                                  ? "border-[#2563EB] text-[#2563EB]"
                                  : "border-[#CBD5E1] text-[#CBD5E1]"
                            }`}>
                              {step.done ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                            </span>
                            <span className="mt-2 text-[11px] font-medium text-[#0F172A] dark:text-foreground">{step.label}</span>
                            <span className="mt-0.5 text-[10px] text-[#94A3B8] dark:text-muted-foreground">{step.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to="/chatbot"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] transition-all hover:bg-[#F8FAFC] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contacter l'équipe
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#CBD5E1] bg-white p-8 text-center dark:border-border dark:bg-card">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] dark:bg-blue-950/40">
                    <PlusCircle className="h-7 w-7" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#0F172A] dark:text-foreground">Aucune demande pour le moment</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B] dark:text-muted-foreground">
                    Lancez votre premier projet en quelques minutes. Notre équipe étudiera votre besoin et vous répondra rapidement.
                  </p>
                  <Link
                    to="/new-request"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Créer ma première demande
                  </Link>
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-[24px] border border-[#EEF2F7] bg-violet-50/60 p-6 dark:border-border dark:bg-violet-950/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-white text-[#7C3AED] shadow-sm dark:bg-card">
                    <MessageCircle className="h-9 w-9" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A] dark:text-foreground">Besoin d'aide ?</h3>
                    <p className="mt-1 text-sm leading-5 text-[#64748B] dark:text-muted-foreground">
                      Notre assistant IA est là pour répondre à vos questions.
                    </p>
                  </div>
                </div>
                <Link
                  to="/chatbot"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#4338CA]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discuter avec l'assistant IA
                </Link>
              </div>

              <div className="rounded-[24px] border border-[#EEF2F7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)] dark:border-border dark:bg-card">
                <div className="mb-4 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-[#7C3AED]" />
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-foreground">Actions rapides</h3>
                </div>
                <div className="space-y-2">
                  {quickActions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.title} to={item.to} className="flex items-center gap-3 rounded-2xl border border-[#EEF2F7] p-3 transition-all hover:bg-[#F8FAFC] dark:border-border dark:hover:bg-muted/40">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#2563EB] dark:bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{item.title}</p>
                          <p className="text-xs text-[#64748B] dark:text-muted-foreground">{item.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#EEF2F7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)] dark:border-border dark:bg-card">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#2563EB]" />
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-foreground">Ressources utiles</h3>
                </div>
                <div className="space-y-1">
                  {resources.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.label} type="button" className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-[#F8FAFC] dark:hover:bg-muted/40">
                        <Icon className="h-4 w-4 text-[#64748B] dark:text-muted-foreground" />
                        <span className="flex-1 text-sm font-medium text-[#0F172A] dark:text-foreground">{item.label}</span>
                        <ExternalLink className="h-4 w-4 text-[#94A3B8]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          </section>

          <section className="overflow-hidden rounded-[24px] border border-[#EEF2F7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)] dark:border-border dark:bg-card">
            <div className="flex items-center justify-between px-7 py-6">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#2563EB]" />
                  <h2 className="text-lg font-semibold tracking-tight text-[#0F172A] dark:text-foreground">Mes demandes</h2>
                </div>
                <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">
                  {requests.length > 0 ? "Une vue claire de vos projets en cours." : "Vos demandes de devis apparaîtront ici."}
                </p>
              </div>
              {requests.length > 0 && (
                <Link to="/dashboard/requests" className="hidden text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] sm:inline-flex">
                  Voir toutes
                </Link>
              )}
            </div>

            {loading ? (
              <div className="px-7 pb-8 text-sm text-[#64748B] dark:text-muted-foreground">Chargement...</div>
            ) : requests.length === 0 ? (
              <div className="px-7 pb-8 text-sm text-[#64748B] dark:text-muted-foreground">
                Aucune demande enregistrée pour votre compte.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-7 py-4 text-left text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Projet</th>
                      <th className="px-7 py-4 text-left text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Service</th>
                      <th className="px-7 py-4 text-left text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Statut</th>
                      <th className="px-7 py-4 text-left text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Date</th>
                      <th className="px-7 py-4 text-left text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => {
                      const RequestIcon = request.icon;
                      return (
                        <tr key={request.id} className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-muted/40">
                          <td className="px-7 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${request.iconBg}`}>
                                <RequestIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#0F172A] dark:text-foreground">{request.title}</p>
                                <p className="mt-1 text-xs text-[#94A3B8] dark:text-muted-foreground">{request.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-7 py-5 text-sm text-[#64748B] dark:text-muted-foreground">{request.service}</td>
                          <td className="px-7 py-5"><StatusBadge status={request.status} /></td>
                          <td className="px-7 py-5 text-sm text-[#64748B] dark:text-muted-foreground">
                            {new Date(request.date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-7 py-5">
                            <Link
                              to={`/request/${request.id}`}
                              className="inline-flex items-center justify-center rounded-lg border border-[#EEF2F7] p-2 text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A] dark:border-border dark:text-muted-foreground dark:hover:text-foreground"
                              title="Voir la demande"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
