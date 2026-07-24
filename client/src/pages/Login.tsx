import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  // Obter redirect URL e motivo do redirecionamento dos query params
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");
    setRedirectUrl(redirect);

    const reason = urlParams.get("reason");
    if (reason === "session_expired") {
      setSessionExpired(true);
      toast.error("Sua sessão expirou, faça login novamente.");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Bem-vindo, ${data.user.name || "usuário"}! 👋`, {
          description: "Login realizado com sucesso.",
        });

        if (redirectUrl) {
          setLocation(redirectUrl);
        } else if (data.user.role === "admin") {
          setLocation("/admin");
        } else {
          setLocation("/profile");
        }
      } else {
        setError(data.error || "Credenciais inválidas");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header com link de volta */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao site
          </a>
        </Link>
        <Link href="/register">
          <a className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors">
            Criar conta →
          </a>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 shadow-lg shadow-orange-500/30">
              <span className="text-white font-bold text-2xl">7</span>
            </div>
            <h1 className="text-3xl font-bold text-white">IMPACT7</h1>
            <p className="text-white/50 text-sm mt-1">Método SET7 V3.0 — Inovação Social Exponencial</p>
          </div>

          {/* Card de login */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Entrar na plataforma</h2>

            {sessionExpired && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 mb-4">
                <p className="text-sm text-amber-400">
                  Sua sessão expirou, faça login novamente.
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-white/70">
                    Senha
                  </label>
                  <Link href="/forgot-password">
                    <a className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      Esqueci minha senha
                    </a>
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Autenticando...
                  </span>
                ) : "Entrar"}
              </button>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
            </div>

            {/* Link para registro */}
            <p className="text-center text-sm text-white/40 mt-6">
              Não tem uma conta?{" "}
              <Link href="/register">
                <a className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Criar conta gratuita
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
