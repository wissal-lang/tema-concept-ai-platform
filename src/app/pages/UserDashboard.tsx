import { Link } from "react-router";
import { FileText, Clock, CheckCircle, AlertCircle, PlusCircle, MessageCircle, HeadphonesIcon, Eye } from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import StatusBadge from "../components/StatusBadge";
import FloatingChatbot from "../components/FloatingChatbot";

export default function UserDashboard() {
  const stats = [
    {
      label: "Total des demandes",
      value: "12",
      icon: FileText,
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "En cours",
      value: "3",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      label: "Complétées",
      value: "8",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "En attente d'info",
      value: "1",
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const recentRequests = [
    {
      id: "REQ-2026-001",
      title: "Application mobile e-commerce",
      service: "Applications Mobiles",
      status: "in_progress",
      date: "2026-06-05",
    },
    {
      id: "REQ-2026-002",
      title: "Site web vitrine corporate",
      service: "Développement Web",
      status: "waiting",
      date: "2026-06-03",
    },
    {
      id: "REQ-2026-003",
      title: "Consulting infrastructure cloud",
      service: "Consulting IT",
      status: "in_progress",
      date: "2026-05-28",
    },
    {
      id: "REQ-2026-004",
      title: "Intégration API paiement",
      service: "Intégration Système",
      status: "completed",
      date: "2026-05-20",
    },
    {
      id: "REQ-2026-005",
      title: "Support technique mensuel",
      service: "Infrastructure & Support",
      status: "completed",
      date: "2026-05-15",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <FloatingChatbot />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, Ahmed!</h1>
            <p className="text-gray-600">Voici un aperçu de vos demandes et projets en cours.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/new-request"
              className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Nouvelle demande</h3>
                <p className="text-sm text-blue-100">Créer une demande de devis</p>
              </div>
            </Link>

            <Link
              to="/chatbot"
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Ouvrir le chatbot</h3>
                <p className="text-sm text-gray-600">Assistance instantanée</p>
              </div>
            </Link>

            <button className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HeadphonesIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Support humain</h3>
                <p className="text-sm text-gray-600">Parler à un conseiller</p>
              </div>
            </button>
          </div>

          {/* Recent Requests Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Demandes récentes</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID & Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.title}</p>
                          <p className="text-xs text-gray-500">{request.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{request.service}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(request.date).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/request/${request.id}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Voir toutes les demandes →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
