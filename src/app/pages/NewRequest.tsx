import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Upload, MessageCircle, Send } from "lucide-react";
import Header from "../components/Header";
import FloatingChatbot from "../components/FloatingChatbot";
import { createDevis, getStoredClient } from "@/services/api";

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function NewRequest() {
  const navigate = useNavigate();
  const storedClient = getStoredClient();
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [loading, setLoading] = useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDeadlineDate = toDateInputValue(tomorrow);

  const services = [
    "Développement Web",
    "Applications Mobiles",
    "Consulting IT",
    "Intégration Système",
    "Infrastructure & Support",
    "Solutions IA"
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const desiredDeadline = (formData.get("desiredDeadline") as string) || "";

    if (!desiredDeadline || desiredDeadline < minDeadlineDate) {
      alert("Le délai souhaité doit être au minimum à J+1 (demain).");
      return;
    }

    setLoading(true);
    try {
      await createDevis({
        fullName: (formData.get("fullName") as string) || storedClient?.name || "",
        email: storedClient?.email || (formData.get("email") as string),
        phone: (formData.get("phone") as string) || storedClient?.phone || undefined,
        projectType: formData.get("projectType") as string,
        budget: (formData.get("budget") as string) || undefined,
        description: formData.get("description") as string,
      });
      alert("Votre demande a été soumise avec succès !");
      navigate("/dashboard");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la soumission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      <FloatingChatbot />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouvelle demande de devis</h1>
          <p className="text-gray-600">
            Remplissez le formulaire ci-dessous pour soumettre votre demande de projet
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        defaultValue={storedClient?.name || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Votre nom complet"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        readOnly={Boolean(storedClient?.email)}
                        defaultValue={storedClient?.email || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent read-only:bg-gray-50 read-only:text-gray-600"
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        defaultValue={storedClient?.phone || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+212 6XX-XXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'entreprise
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="border-t border-gray-100 dark:border-border pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du projet</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de service *
                      </label>
                      <select
                        name="projectType"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionnez un service</option>
                        {services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description du projet *
                      </label>
                      <textarea
                        name="description"
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Décrivez votre projet en détail..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Incluez les objectifs, fonctionnalités souhaitées, et tout autre détail pertinent
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget estimé
                        </label>
                        <select name="budget" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">Sélectionnez une fourchette</option>
                          <option value="10k-25k">10 000 - 25 000 MAD</option>
                          <option value="25k-50k">25 000 - 50 000 MAD</option>
                          <option value="50k-100k">50 000 - 100 000 MAD</option>
                          <option value="more-100k">Plus de 100 000 MAD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Délai souhaité *
                        </label>
                        <input
                          type="date"
                          name="desiredDeadline"
                          required
                          min={minDeadlineDate}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          La date doit être au minimum demain (J+1).
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fichiers joints
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Cliquez pour télécharger ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, images jusqu'à 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="border-t border-gray-100 dark:border-border pt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {loading ? "Envoi en cours..." : "Soumettre la demande"}
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Brouillon
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 sticky top-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Assistant IA</h3>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Disponible
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                Besoin d'aide pour décrire votre projet? Notre assistant IA peut vous guider!
              </p>

              {!showAIHelper ? (
                <button
                  onClick={() => setShowAIHelper(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Démarrer la conversation
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white dark:bg-card rounded-lg p-3 text-sm text-gray-900 shadow-sm">
                    Bonjour! Je peux vous aider à mieux structurer votre demande. Quel type de projet souhaitez-vous réaliser?
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Répondez ici..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-blue-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Questions fréquentes:</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Quel est le délai moyen pour un projet web?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Comment estimer le budget de mon projet?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Quelles informations dois-je fournir?</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/chatbot"
                className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ouvrir le chatbot complet →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
