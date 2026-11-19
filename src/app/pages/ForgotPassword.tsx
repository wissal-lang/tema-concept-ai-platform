import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowRight } from "lucide-react";
import { requestPasswordReset } from "@/services/api";
import TemaLogo from "../components/TemaLogo";
import ThemeToggle from "../components/ThemeToggle";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [debugResetUrl, setDebugResetUrl] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setDebugResetUrl("");
    setLoading(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.message || "Si un compte existe, un email vient d'être envoyé.");
      if (response.data?.debugResetUrl) {
        setDebugResetUrl(response.data.debugResetUrl);
      }
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
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
          <h1 className="text-3xl font-bold text-white mb-2">Mot de passe oublié</h1>
          <p className="text-blue-100">Recevez un lien pour réinitialiser votre mot de passe</p>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                {message}
              </div>
            )}
            {debugResetUrl && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
                Email non envoyé (mode dev). Utilisez ce lien :
                <a
                  href={debugResetUrl}
                  className="mt-1 block break-all font-medium text-blue-700 underline dark:text-blue-300"
                >
                  {debugResetUrl}
                </a>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Adresse email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
