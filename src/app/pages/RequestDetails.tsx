import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import StatusBadge from "../components/StatusBadge";
import { getDevisById, getStoredClient, mapDevisStatus, type DevisFromApi } from "@/services/api";

export default function RequestDetails() {
  const { id: requestId } = useParams();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const client = getStoredClient();

  const [request, setRequest] = useState<DevisFromApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError("Demande introuvable.");
      setLoading(false);
      return;
    }

    const loadRequest = async () => {
      try {
        const response = await getDevisById(requestId);
        if (!response.success || !response.data) {
          setError("Demande introuvable.");
          return;
        }

        const devis = response.data as DevisFromApi;

        if (!isAdminRoute && client?.email && devis.email.toLowerCase() !== client.email.toLowerCase()) {
          setError("Vous n'avez pas accès à cette demande.");
          return;
        }

        setRequest(devis);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger la demande.");
      } finally {
        setLoading(false);
      }
    };

    void loadRequest();
  }, [requestId, isAdminRoute, client?.email]);

  const status = request ? mapDevisStatus(request.status) : "new";
  const isNew = status === "new";
  const isInProgress = status === "in_progress" || status === "waiting";
  const isQuoteSent = status === "quote_sent";
  const isClosed = status === "closed" || status === "completed";

  const timeline = request
    ? [
        {
          status: "completed" as const,
          label: "Demande soumise",
          date: new Date(request.createdAt).toLocaleString("fr-FR"),
          description: "La demande a été reçue et enregistrée",
        },
        {
          status: isNew ? ("current" as const) : ("completed" as const),
          label: "En cours de révision",
          date: isNew ? "En cours" : "Terminé",
          description: "Analyse des besoins en cours",
        },
        {
          status: isInProgress ? ("current" as const) : isQuoteSent || isClosed ? ("completed" as const) : ("pending" as const),
          label: "Préparation du devis",
          date: isInProgress ? "En cours" : isQuoteSent || isClosed ? "Terminé" : "En attente",
          description: "Notre équipe prépare une proposition détaillée",
        },
        {
          status: isQuoteSent ? ("current" as const) : isClosed ? ("completed" as const) : ("pending" as const),
          label: "Envoi de la réponse",
          date: isQuoteSent || isClosed ? "Terminé" : "En attente",
          description: "Devis et proposition seront envoyés au client",
        },
        {
          status: isClosed ? ("completed" as const) : ("pending" as const),
          label: "Clôture",
          date: isClosed ? "Terminé" : "En attente",
          description: "Finalisation du dossier",
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background">
      <DashboardSidebar isAdmin={isAdminRoute} />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <Link
            to={isAdminRoute ? "/admin" : "/dashboard"}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord {isAdminRoute ? "admin" : ""}
          </Link>

          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-sm text-gray-500 dark:border-border dark:bg-card">
              Chargement de la demande...
            </div>
          ) : error || !request ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-border dark:bg-card">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-foreground">{error || "Demande introuvable."}</h1>
              <Link
                to={isAdminRoute ? "/admin" : "/dashboard"}
                className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Retour au tableau de bord
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                        {request.description.slice(0, 80) || request.projectType}
                      </h1>
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-sm text-gray-500">ID: {request.id}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type de service</p>
                      <p className="font-medium text-gray-900 dark:text-foreground">{request.projectType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date de soumission</p>
                      <p className="font-medium text-gray-900 dark:text-foreground">
                        {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Budget estimé</p>
                      <p className="font-medium text-gray-900 dark:text-foreground">{request.budget || "Non précisé"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Informations du client</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Nom complet</p>
                          <p className="font-medium text-gray-900 dark:text-foreground">{request.fullName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-gray-900 dark:text-foreground">{request.email}</p>
                        </div>
                      </div>

                      {request.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Téléphone</p>
                            <p className="font-medium text-gray-900 dark:text-foreground">{request.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Description du projet</h2>
                    <p className="text-gray-700 dark:text-muted-foreground leading-relaxed">{request.description}</p>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-6 sticky top-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-6">Suivi de la demande</h2>

                    <div className="space-y-6">
                      {timeline.map((step, index) => (
                        <div key={step.label} className="relative">
                          {index < timeline.length - 1 && (
                            <div
                              className={`absolute left-4 top-10 w-0.5 h-full ${
                                step.status === "completed" ? "bg-green-200" : "bg-gray-200"
                              }`}
                            />
                          )}

                          <div className="flex gap-4">
                            <div
                              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.status === "completed"
                                  ? "bg-green-500"
                                  : step.status === "current"
                                    ? "bg-blue-500"
                                    : "bg-gray-200"
                              }`}
                            >
                              {step.status === "completed" ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : step.status === "current" ? (
                                <Clock className="w-5 h-5 text-white" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>

                            <div className="flex-1 pb-6">
                              <h3 className={`font-medium ${step.status === "pending" ? "text-gray-500" : "text-gray-900 dark:text-foreground"}`}>
                                {step.label}
                              </h3>
                              <p className="text-xs text-gray-500 mb-1">{step.date}</p>
                              <p className="text-sm text-gray-600 dark:text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
