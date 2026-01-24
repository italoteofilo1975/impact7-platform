import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavigationButtons from "@/components/NavigationButtons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  
  // Obter redirect URL dos query params
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    setRedirectUrl(redirect);
    console.log('[Login] Component mounted, redirect:', redirect);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Login] handleLogin START');
    console.log('[Login] Email:', email);
    console.log('[Login] Password length:', password.length);
    console.log('[Login] Redirect URL:', redirectUrl);
    
    setError("");
    setLoading(true);

    try {
      console.log('[Login] Sending fetch request...');
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log('[Login] Response received, status:', response.status);
      const data = await response.json();
      console.log('[Login] Response data:', data);

      if (response.ok && data.success) {
        console.log('[Login] Login successful!');
        // Login bem-sucedido, redirecionar
        if (redirectUrl) {
          console.log('[Login] Redirecting to:', redirectUrl);
          setLocation(redirectUrl);
        } else if (data.user.role === "admin") {
          console.log('[Login] Redirecting admin to /admin');
          setLocation("/admin");
        } else {
          console.log('[Login] Redirecting user to /dashboard');
          setLocation("/dashboard");
        }
      } else {
        console.log('[Login] Login failed:', data.error);
        setError(data.error || "Credenciais inválidas");
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      setError("Erro ao conectar com o servidor: " + String(err));
    } finally {
      setLoading(false);
      console.log('[Login] handleLogin END');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-4">
        <NavigationButtons showBack={false} />
      </div>
      <div className="flex-1 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        <div>
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
            IMPACT7
          </h1>
          <p className="text-center text-gray-600">
            Método SET7 V3.0 - Inovação Social Exponencial
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
                <span className="text-sm font-medium text-blue-800">Autenticando...</span>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => console.log('[Login] Button clicked')}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>

        </form>
      </div>
      </div>
    </div>
  );
}
