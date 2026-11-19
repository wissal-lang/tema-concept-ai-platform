import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, User, Phone, Building2, ArrowRight } from "lucide-react";
import { registerClient } from "@/services/api";
import TemaLogo from "../components/TemaLogo";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    setLoading(true);
    try {
      await registerClient({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle className="text-white hover:text-white hover:bg-white/10" />
      </div>
      <div className="max-w-md w-full py-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-4">
            <TemaLogo variant="login" theme="dark" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-blue-100">Rejoignez l'espace client Tema Concept</p>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border/50">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nom complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={updateField("name")}
                  required
                  className={inputClass}
                  placeholder="Votre nom complet"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Adresse email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  required
                  className={inputClass}
                  placeholder="vous@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Téléphone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={updateField("phone")}
                    className={inputClass}
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Entreprise</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={form.company}
                    onChange={updateField("company")}
                    className={inputClass}
                    placeholder="Votre entreprise"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={updateField("password")}
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="Au moins 6 caractères"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                  required
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Création..." : "Créer mon compte"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-blue-100 hover:text-white transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
