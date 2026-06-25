import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Code,
  Smartphone,
  Lightbulb,
  Network,
  Server,
  Bot,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Zap,
  CheckCircle,
  Clock,
  Shield,
  ChevronRight
} from "lucide-react";
import Header from "../components/Header";
import FloatingChatbot from "../components/FloatingChatbot";
import { createDevis, createContact, getServices } from "@/services/api";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingPage() {
  const location = useLocation();
  const [selectedService, setSelectedService] = useState("");
  const [apiServices, setApiServices] = useState<string[]>([]);
  const [devisLoading, setDevisLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const serviceSelectRef = useRef<HTMLSelectElement>(null);

  // Handle scroll-to from navigation state (e.g. coming from another page)
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      setTimeout(() => scrollToSection(state.scrollTo!), 100);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  useEffect(() => {
    getServices()
      .then((res: Awaited<ReturnType<typeof getServices>>) => {
        if (res.data?.length) {
          setApiServices(res.data.map((s) => s.title));
        }
      })
      .catch(() => {});
  }, []);

  const handleDevisScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection("demander-devis");
  };

  const handleServiceRequest = (serviceName: string) => {
    setSelectedService(serviceName);
    scrollToSection("demander-devis");
    setTimeout(() => serviceSelectRef.current?.focus(), 400);
  };

  const services = [
    { icon: Code, title: "Sites web & plateformes web", description: "Création de sites modernes, applications web et plateformes personnalisées." },
    { icon: Smartphone, title: "Applications mobiles", description: "Développement d'applications mobiles iOS et Android adaptées à vos besoins." },
    { icon: Lightbulb, title: "Conseil & transformation digitale", description: "Accompagnement stratégique pour digitaliser vos processus et améliorer vos services." },
    { icon: Network, title: "Intégration de solutions", description: "Connexion et intégration fluide de vos systèmes et outils existants." },
    { icon: Server, title: "Maintenance & support IT", description: "Support technique, maintenance applicative et gestion de votre infrastructure." },
    { icon: Bot, title: "Chatbots & automatisation IA", description: "Mise en place d'assistants intelligents pour automatiser les interactions utilisateurs." }
  ];

  const advantages = [
    { icon: Zap, title: "Réponse rapide", text: "Les utilisateurs obtiennent rapidement des informations et une orientation adaptée." },
    { icon: CheckCircle, title: "Suivi personnalisé", text: "Chaque demande peut être suivie depuis sa création jusqu'à son traitement." },
    { icon: Shield, title: "Solutions adaptées", text: "Les services sont proposés selon les besoins spécifiques de chaque client." },
    { icon: Bot, title: "Assistance intelligente", text: "Le chatbot IA aide les utilisateurs à formuler leurs besoins et à trouver le bon service." }
  ];

  const steps = [
    { number: "01", title: "Décrivez votre besoin", description: "Expliquez votre projet ou posez une question à l'assistant IA." },
    { number: "02", title: "Recevez une assistance IA", description: "L'assistant vous guide et vous propose le service le plus adapté." },
    { number: "03", title: "Envoyez votre demande de devis", description: "Complétez les informations nécessaires pour permettre l'analyse de votre projet." },
    { number: "04", title: "Suivez son traitement", description: "Consultez l'état d'avancement de votre demande depuis votre espace." }
  ];

  const serviceTypes = apiServices.length > 0 ? [...apiServices, "Autre"] : [
    "Sites web & plateformes web",
    "Applications mobiles",
    "Conseil & transformation digitale",
    "Intégration de solutions",
    "Maintenance & support IT",
    "Chatbots & automatisation IA",
    "Autre"
  ];

  const budgets = ["Moins de 5 000 MAD", "5 000 – 20 000 MAD", "20 000 – 50 000 MAD", "Plus de 50 000 MAD", "À définir"];
  const delais = ["Moins d'un mois", "1 – 3 mois", "3 – 6 mois", "Plus de 6 mois", "Flexible"];

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setContactLoading(true);
    try {
      await createContact({
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        message: formData.get("message") as string,
      });
      alert("Votre message a été envoyé. Nous vous répondrons dans les meilleurs délais.");
      form.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'envoi du message.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleDevisSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const projectType = (formData.get("projectType") as string) || selectedService;
    if (!projectType) {
      alert("Veuillez sélectionner un type de service.");
      return;
    }

    const entreprise = formData.get("entreprise") as string;
    const delai = formData.get("delai") as string;
    let description = formData.get("description") as string;
    if (entreprise) description += `\n\nEntreprise : ${entreprise}`;
    if (delai) description += `\nDélai souhaité : ${delai}`;

    setDevisLoading(true);
    try {
      await createDevis({
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        phone: (formData.get("phone") as string) || undefined,
        projectType,
        budget: (formData.get("budget") as string) || undefined,
        description,
      });
      alert("Votre demande de devis a été envoyée. Notre équipe vous contactera bientôt.");
      form.reset();
      setSelectedService("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'envoi de la demande.");
    } finally {
      setDevisLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FloatingChatbot />

      {/* Hero Section */}
      <section id="accueil" className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
                Simplifiez vos interactions avec Tema Concept grâce à l'IA
              </h1>
              <p className="text-lg text-blue-100 mb-7">
                Découvrez nos services, posez vos questions et soumettez vos demandes de projet en quelques clics grâce à notre assistant intelligent.
              </p>
              <div className="flex flex-wrap gap-4 mb-5">
                <Link
                  to="/chatbot"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <Bot className="w-5 h-5" />
                  Discuter avec l'assistant IA
                </Link>
                <a
                  href="#demander-devis"
                  onClick={handleDevisScroll}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-400 transition-colors border border-blue-400 cursor-pointer"
                >
                  Demander un devis
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <p className="text-blue-200 text-sm flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>Réponse rapide</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>Demande suivie</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>Assistance disponible</span>
              </p>
            </div>

            {/* Chatbot preview card — compact */}
            <div className="bg-white rounded-2xl shadow-xl p-5 max-w-sm mx-auto w-full">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Assistant IA de Tema Concept</h3>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                    En ligne • Temps de réponse : ~2s
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2 text-gray-800 text-xs max-w-[90%]">
                  Bonjour ! Je suis l'assistant IA de Tema Concept. Je peux vous aider à découvrir nos services, demander un devis ou suivre une demande.
                </div>
                <div className="bg-blue-600 rounded-xl rounded-tr-sm px-3 py-2 text-white text-xs ml-auto max-w-[72%]">
                  Je veux créer un site web pour mon entreprise.
                </div>
                <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2 text-gray-800 text-xs max-w-[90%]">
                  Très bien. Je peux vous aider à préciser votre besoin et préparer une demande de devis.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <a
                  href="#services"
                  onClick={(e) => { e.preventDefault(); scrollToSection("services"); }}
                  className="px-2 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 text-center cursor-pointer"
                >
                  Voir les services
                </a>
                <a
                  href="#demander-devis"
                  onClick={handleDevisScroll}
                  className="px-2 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 text-center cursor-pointer"
                >
                  Créer une demande
                </a>
                <Link
                  to="/chatbot"
                  className="px-2 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 text-center"
                >
                  Parler à un conseiller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nos services</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Des solutions digitales pour accompagner votre transformation numérique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-100 group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{service.description}</p>
                  <button
                    onClick={() => handleServiceRequest(service.title)}
                    className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:gap-2 transition-all cursor-pointer"
                  >
                    Demander ce service <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Vous ne savez pas quel service choisir ?</h3>
            <p className="text-gray-500 mb-5">Notre assistant IA peut vous guider selon votre besoin.</p>
            <Link
              to="/chatbot"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Bot className="w-5 h-5" />
              Demander conseil à l'assistant IA
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi Tema Concept */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Pourquoi choisir Tema Concept ?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, index) => {
              const Icon = adv.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-gray-500 text-sm">{adv.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="comment-ca-marche" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Comment ça marche ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Un parcours simple pour transformer votre besoin en projet concret.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-blue-100 z-0"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative z-10">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="#demander-devis"
              onClick={handleDevisScroll}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Demander un devis */}
      <section id="demander-devis" className="py-20 bg-gray-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vous avez un projet digital ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Décrivez votre besoin et recevez une estimation personnalisée de la part de l'équipe Tema Concept.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <form onSubmit={handleDevisSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                    <input type="text" name="fullName" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" name="email" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="votre@email.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                    <input type="tel" name="phone" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="+212 6XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Entreprise</label>
                    <input type="text" name="entreprise" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Nom de votre entreprise" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de service</label>
                    <select
                      ref={serviceSelectRef}
                      name="projectType"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="">Choisir...</option>
                      {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget estimé</label>
                    <select name="budget" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white">
                      <option value="">Choisir...</option>
                      {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Délai souhaité</label>
                    <select name="delai" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white">
                      <option value="">Choisir...</option>
                      {delais.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description du projet</label>
                  <textarea name="description" rows={4} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Décrivez votre projet en quelques lignes..." />
                </div>
                <button type="submit" disabled={devisLoading} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                  {devisLoading ? "Envoi en cours..." : "Envoyer la demande"}
                </button>
              </form>
            </div>

            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700">
                    Besoin d'aide pour décrire votre projet ? L'assistant IA peut vous accompagner.
                  </p>
                </div>
                <Link
                  to="/chatbot"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Utiliser l'assistant IA
                </Link>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Suivi de demande
                </h4>
                <div className="space-y-3">
                  {["Nouvelle", "En cours", "Devis envoyé", "Clôturée"].map((status, i) => (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${i === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                        {i + 1}
                      </div>
                      <span className={`text-sm ${i === 0 ? "text-blue-600 font-medium" : "text-gray-400"}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Contactez-nous</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une question ou un projet à discuter ? Envoyez-nous un message, notre équipe vous répondra dans les meilleurs délais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-5">
              {[
                { icon: Mail, label: "Email", value: "contact@temaconcept.ma" },
                { icon: Phone, label: "Téléphone", value: "+212 XXX XXX XXX" },
                { icon: MapPin, label: "Adresse", value: "Maroc" }
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="font-medium text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                  <input type="text" name="fullName" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" name="email" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea name="message" rows={4} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Votre message..." />
                </div>
                <button type="submit" disabled={contactLoading} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                  {contactLoading ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TC</span>
                </div>
                <span className="text-lg font-semibold text-white">Tema Concept</span>
              </div>
              <p className="text-sm text-gray-400">
                Plateforme digitale avec assistant IA pour accompagner vos projets numériques.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Services</h3>
              <ul className="space-y-2 text-sm">
                {["Sites web & plateformes web", "Applications mobiles", "Solutions IA", "Support IT"].map(s => (
                  <li key={s}><button onClick={() => handleServiceRequest(s)} className="hover:text-white transition-colors text-left">{s}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Entreprise</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }} className="hover:text-white transition-colors cursor-pointer">Contact</a></li>
                <li><a href="#demander-devis" onClick={handleDevisScroll} className="hover:text-white transition-colors cursor-pointer">Demander un devis</a></li>
                <li><Link to="/chatbot" className="hover:text-white transition-colors">Assistance IA</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 Tema Concept. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
