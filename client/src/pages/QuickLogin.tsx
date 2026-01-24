import { useState } from 'react';
import { useLocation } from 'wouter';

export default function QuickLogin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      // Fazer login direto via fetch
      const response = await fetch('/api/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        // Aguardar um pouco para a sessão ser estabelecida
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirecionar para dashboard SET7
        window.location.href = '/admin/set7';
      } else {
        const error = await response.text();
        console.error('Login failed:', error);
        alert('Erro ao fazer login: ' + error);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            IMPACT7 Platform
          </h1>
          <p className="text-gray-600">Acesso Rápido ao Dashboard SET7</p>
        </div>

        <button
          onClick={handleQuickLogin}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Entrando...' : '🚀 Entrar como Admin'}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Acesso direto ao Dashboard SET7</p>
          <p className="mt-2">Sem necessidade de senha</p>
        </div>
      </div>
    </div>
  );
}
