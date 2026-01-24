/**
 * AdminRoute - Componente de proteção de rotas administrativas
 * SET7.04 - Segurança, Governança e Confiança
 * 
 * Redireciona usuários não-admin para a página inicial
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver logado
  if (!user) {
    // Salvar URL de destino para redirecionar após login
    const currentPath = window.location.pathname + window.location.search;
    return <Redirect to={`/login?redirect=${encodeURIComponent(currentPath)}`} />;
  }

  // Redirecionar para home se não for admin
  if (user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}

export default AdminRoute;
