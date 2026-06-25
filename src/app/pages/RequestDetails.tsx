import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Send
} from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import StatusBadge from "../components/StatusBadge";

export default function RequestDetails() {
  const { id: requestId } = useParams();

  const request = {
    id: requestId ?? "REQ-2026-001",
    title: "Application mobile e-commerce",
    client: {
      name: "Ahmed Bennani",
      email: "ahmed.bennani@example.com",
      phone: "+212 6XX-XXXXXX",
      company: "Tech Solutions Maroc"
    },
    service: "Applications Mobiles",
    description:
      "Je souhaite développer une application mobile e-commerce pour iOS et Android. L'application doit permettre aux utilisateurs de parcourir un catalogue de produits, ajouter des articles au panier, et passer des commandes. Intégration avec un système de paiement mobile est essentielle. Design moderne et intuitive requis.",
    budget: "50 000 - 100 000 MAD",
    deadline: "2026-09-15",
    status: "in_progress",
    submittedDate: "2026-06-05",
    files: [
      { name: "Cahier_des_charges.pdf", size: "2.4 MB" },
      { name: "Maquettes_UI.fig", size: "5.1 MB" }
    ]
  };

  const timeline = [
    {
      status: "completed",
      label: "Demande soumise",
      date: "2026-06-05 14:30",
      description: "La demande a été reçue et enregistrée"
    },
    {
      status: "completed",
      label: "En cours de révision",
      date: "2026-06-05 15:45",
      description: "Analyse des besoins en cours"
    },
    {
      status: "current",
      label: "Préparation du devis",
      date: "2026-06-06 10:00",
      description: "Notre équipe prépare une proposition détaillée"
    },
    {
      status: "pending",
      label: "Envoi de la réponse",
      date: "En attente",
      description: "Devis et proposition seront envoyés au client"
    },
    {
      status: "pending",
      label: "Clôture",
      date: "En attente",
      description: "Finalisation du dossier"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-sm text-gray-500">ID: {request.id}</p>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Modifier le statut
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Imprimer
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type de service</p>
                  <p className="font-medium text-gray-900">{request.service}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date de soumission</p>
                  <p className="font-medium text-gray-900">
                    {new Date(request.submittedDate).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Budget estimé</p>
                  <p className="font-medium text-gray-900">{request.budget}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du client</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nom complet</p>
                      <p className="font-medium text-gray-900">{request.client.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{request.client.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Téléphone</p>
                      <p className="font-medium text-gray-900">{request.client.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Entreprise</p>
                      <p className="font-medium text-gray-900">{request.client.company}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description du projet</h2>
                <p className="text-gray-700 leading-relaxed">{request.description}</p>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Délai souhaité</span>
                    <span className="font-medium text-gray-900">
                      {new Date(request.deadline).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fichiers joints</h2>
                <div className="space-y-2">
                  {request.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Response Area */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Zone de réponse admin</h2>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modifier le statut
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="new">Nouvelle</option>
                      <option value="in_progress" selected>
                        En cours
                      </option>
                      <option value="waiting">En attente d'informations</option>
                      <option value="quote_sent">Devis envoyé</option>
                      <option value="completed">Traitée</option>
                      <option value="closed">Clôturée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorité
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message au client
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rédigez votre réponse au client..."
                  />
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Envoyer la réponse
                  </button>
                  <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Brouillon
                  </button>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes internes</h2>
                <div className="space-y-3 mb-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Sarah Admin</span>
                      <span className="text-xs text-gray-500">Il y a 2h</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Le client a déjà travaillé avec nous sur un projet similaire en 2025. Budget approuvé.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Karim Manager</span>
                      <span className="text-xs text-gray-500">Hier</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Devis en préparation. Délai de livraison estimé à 8 semaines.
                    </p>
                  </div>
                </div>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  placeholder="Ajouter une note interne..."
                />
                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  Ajouter note
                </button>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Suivi de la demande</h2>

                <div className="space-y-6">
                  {timeline.map((step, index) => (
                    <div key={index} className="relative">
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
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-medium ${
                                step.status === "pending" ? "text-gray-500" : "text-gray-900"
                              }`}
                            >
                              {step.label}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{step.date}</p>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
