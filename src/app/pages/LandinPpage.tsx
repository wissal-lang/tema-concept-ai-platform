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
  PlayCircle,
  Star,
  MessageCircle,
  Headphones,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Zap,
  CheckCircle,
  Clock,
  Shield,
  ChevronRight
} from "lucide-react";
import Header from "../components/Header";
import TemaLogo from "../components/TemaLogo";
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

  const heroStats = [
    { icon: MessageCircle, value: "1500+", label: "Conversations", description: "avec notre IA" },
    { icon: CheckCircle, value: "98%", label: "Clients satisfaits", description: "service de qualité" },
    { icon: Zap, value: "2 s", label: "Temps moyen", description: "de réponse" },
    { icon: Clock, value: "24h/24", label: "Disponibilité", description: "7j/7 sans interruption" },
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
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <style>{`
        @keyframes landingFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <Header />
      <FloatingChatbot />

      {/* Hero Section */}
      <section id="accueil" className="relative overflow-hidden bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.14),transparent_34%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)] py-20 sm:py-24 lg:py-28 dark:bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.18),transparent_34%),linear-gradient(180deg,#0F172A_0%,#111827_100%)]">
        <div className="pointer-events-none absolute left-[55%] top-16 hidden h-72 w-72 rounded-full bg-blue-100/60 blur-3xl lg:block dark:bg-blue-950/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] items-center">
            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-300">
              <h1 className="max-w-[650px] text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-foreground md:text-4xl lg:text-[42px] lg:leading-[1.15]">
                Votre assistant intelligent pour obtenir un devis et des réponses en <span className="text-blue-600">quelques secondes</span>
              </h1>
              <p className="mt-6 max-w-[600px] text-base leading-8 text-[#475569] dark:text-muted-foreground md:text-lg">
                Découvrez nos services, posez vos questions et échangez avec notre assistant IA disponible 24h/24 pour vous accompagner efficacement.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/chatbot"
                  aria-label="Commencer la discussion avec l'assistant IA"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-[0_16px_34px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_20px_45px_rgba(37,99,235,0.34)] focus:outline-none focus:ring-2 focus:ring-blue-300 sm:w-auto"
                >
                  <MessageCircle className="w-5 h-5" />
                  Commencer la discussion
                </Link>
                <a
                  href="#demander-devis"
                  onClick={handleDevisScroll}
                  aria-label="Demander un devis pour votre projet"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-7 py-3.5 font-semibold text-[#0F172A] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted sm:w-auto"
                >
                  <Calendar className="w-5 h-5" />
                  Demander un devis
                </a>
              </div>
              <a
                href="#comment-ca-marche"
                onClick={(e) => { e.preventDefault(); scrollToSection("comment-ca-marche"); }}
                aria-label="Voir comment fonctionne l'assistant"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition-colors hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
              >
                <PlayCircle className="w-5 h-5" />
                Voir comment ça fonctionne
              </a>
              <div className="mt-9 flex flex-col gap-4 text-sm text-[#64748B] dark:text-muted-foreground sm:flex-row sm:items-center sm:gap-8">
                <div className="flex items-center gap-1.5" aria-label="Note cinq étoiles">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  ))}
                  <span className="ml-2 text-xs">4.9/5 sur plus de 250 avis clients</span>
                </div>
                <p className="font-medium">Plus de 250 entreprises accompagnées</p>
              </div>
            </div>

            {/* Chatbot preview card — compact */}
            <div className="relative z-10 bg-white dark:bg-card rounded-[28px] shadow-[0_24px_70px_rgba(15,23,42,0.14)] p-5 sm:p-6 max-w-md mx-auto w-full border border-[#E2E8F0]/70 dark:border-border motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-300 lg:[animation:landingFloat_6s_ease-in-out_infinite]">
              <div className="flex items-start gap-2.5 mb-3">
                <TemaLogo variant="message" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-foreground text-sm">Assistant IA de Tema Concept</h3>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-muted-foreground">
                    <span>Réponse moyenne : 2 secondes</span>
                    <span>Disponible 24h/24</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <TemaLogo variant="message" />
                  <div className="bg-gray-100 dark:bg-muted rounded-2xl rounded-tl-sm px-4 py-3 text-gray-800 dark:text-foreground text-xs max-w-[86%] leading-5">
                    Bonjour ! Je suis votre assistant virtuel. Je peux vous aider à découvrir nos services, obtenir un devis ou répondre à vos questions. Comment puis-je vous aider aujourd'hui ?
                  </div>
                </div>
                <div className="bg-blue-600 rounded-xl rounded-tr-sm px-3 py-2 text-white text-xs ml-auto max-w-[72%]">
                  Je veux créer un site web pour mon entreprise.
                </div>
                <div className="flex items-start gap-2">
                  <TemaLogo variant="message" />
                  <div className="bg-gray-100 dark:bg-muted rounded-2xl rounded-tl-sm px-4 py-3 text-gray-800 dark:text-foreground text-xs max-w-[86%] leading-5">
                    Très bien ! Je vais vous aider à préciser votre besoin et préparer une demande de devis.
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <a
                  href="#services"
                  onClick={(e) => { e.preventDefault(); scrollToSection("services"); }}
                  aria-label="Découvrir nos services"
                  className="inline-flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-50 dark:bg-muted/30 text-gray-600 dark:text-muted-foreground rounded-lg text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 dark:border-border text-center cursor-pointer"
                >
                  <Code className="h-3.5 w-3.5" />
                  Découvrir nos services
                </a>
                <a
                  href="#demander-devis"
                  onClick={handleDevisScroll}
                  aria-label="Obtenir un devis"
                  className="inline-flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-50 dark:bg-muted/30 text-gray-600 dark:text-muted-foreground rounded-lg text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 dark:border-border text-center cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Obtenir un devis
                </a>
                <Link
                  to="/chatbot"
                  aria-label="Contacter un expert"
                  className="inline-flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-50 dark:bg-muted/30 text-gray-600 dark:text-muted-foreground rounded-lg text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 dark:border-border text-center"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  Contacter un expert
                </Link>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-400 dark:border-border">
                <span className="flex-1">Écrivez votre message...</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section aria-label="Statistiques de performance" className="relative -mt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-0 overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:border-border dark:bg-card sm:grid-cols-2 lg:grid-cols-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-300">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
              <div key={stat.label} className="flex items-center gap-4 border-b border-gray-100 px-6 py-6 transition-all duration-300 hover:bg-blue-50/60 dark:border-border dark:hover:bg-blue-950/20 sm:odd:border-r lg:border-b-0 lg:border-r last:border-r-0">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-foreground">{stat.value}</p>
                  <p className="text-sm font-semibold text-[#0F172A] dark:text-foreground">{stat.label}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">{stat.description}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white dark:bg-card scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-3">Des <span className="text-blue-600">solutions</span> adaptées à vos besoins</h2>
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
                  className="bg-gray-50 dark:bg-muted/30 rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-100 dark:border-border group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-foreground mb-2">{service.title}</h3>
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">Vous ne savez pas quel service choisir ?</h3>
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
      <section className="py-20 bg-gray-50 dark:bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-3">Pourquoi choisir Tema Concept ?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, index) => {
              const Icon = adv.icon;
              return (
                <div key={index} className="bg-white dark:bg-card rounded-xl p-6 border border-gray-100 dark:border-border shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-foreground mb-2">{adv.title}</h3>
                  <p className="text-gray-500 text-sm">{adv.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="comment-ca-marche" className="py-20 bg-white dark:bg-card scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-3">Comment ça marche ?</h2>
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
                  <h3 className="font-semibold text-gray-900 dark:text-foreground mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#demander-devis"
                onClick={handleDevisScroll}
                aria-label="Commencer une demande de devis"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                to="/chatbot"
                aria-label="Voir une démonstration de l'assistant IA"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-card text-blue-600 rounded-xl font-medium border border-blue-100 dark:border-border hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              >
                <PlayCircle className="w-5 h-5" />
                Voir une démonstration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demander un devis */}
      <section id="demander-devis" className="py-20 bg-gray-50 dark:bg-muted/30 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-3">Vous avez un projet digital ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Décrivez votre besoin et recevez une estimation personnalisée de la part de l'équipe Tema Concept.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border p-8">
              <form onSubmit={handleDevisSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Nom complet</label>
                    <input type="text" name="fullName" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Email</label>
                    <input type="email" name="email" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="votre@email.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Téléphone</label>
                    <input type="tel" name="phone" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="+212 6XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Entreprise</label>
                    <input type="text" name="entreprise" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Nom de votre entreprise" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Type de service</label>
                    <select
                      ref={serviceSelectRef}
                      name="projectType"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-card"
                    >
                      <option value="">Choisir...</option>
                      {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Budget estimé</label>
                    <select name="budget" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-card">
                      <option value="">Choisir...</option>
                      {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Délai souhaité</label>
                    <select name="delai" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-card">
                      <option value="">Choisir...</option>
                      {delais.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Description du projet</label>
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
                  <p className="text-sm text-gray-700 dark:text-muted-foreground">
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

              <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5 shadow-sm">
                <h4 className="font-semibold text-gray-900 dark:text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Suivi de demande
                </h4>
                <div className="space-y-3">
                  {["Nouvelle", "En cours", "Devis envoyé", "Clôturée"].map((status, i) => (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${i === 0 ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-muted text-gray-400"}`}>
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
      <section id="contact" className="py-20 bg-white dark:bg-card scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-3">Contactez-nous</h2>
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
                    <p className="font-medium text-gray-900 dark:text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-muted/30 rounded-2xl p-8 border border-gray-100 dark:border-border">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Nom complet</label>
                  <input type="text" name="fullName" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Email</label>
                  <input type="email" name="email" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1.5">Message</label>
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
              <div className="mb-4">
                <TemaLogo variant="footer" theme="dark" />
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
