import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { loginUser } from "@/services/api";
import TemaLogo from "../components/TemaLogo";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(email, password);
      const role = response.data?.role;

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "client") {
        navigate("/dashboard");
      } else {
        throw new Error("Connexion impossible.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle className="text-white hover:text-white hover:bg-white/10" />
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-4">
            <TemaLogo variant="login" theme="dark" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
          <p className="text-blue-100">Accédez à votre espace Tema Concept</p>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                  placeholder="vous@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-border text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-muted-foreground">Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Nouveau ?{" "}
              <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm text-blue-100 hover:text-white transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
