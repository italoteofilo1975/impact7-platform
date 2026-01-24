/**
 * Componente de Breadcrumb
 * Melhora a navegação e orientação do usuário
 */

import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  "": "Início",
  "sobre": "Sobre",
  "metodo": "Método IMPACT7",
  "calculadora": "Calculadora S-ROI",
  "cases": "Cases de Sucesso",
  "whitepaper": "Whitepaper",
  "contato": "Contato",
  "jarvis": "Jarvis IA",
  "impacto": "Dashboard de Impacto",
  "profile": "Meu Perfil",
  "favorites": "Favoritos",
  "admin": "Administração",
  "api-keys": "API Keys",
  "webhooks": "Webhooks",
  "oauth-clients": "OAuth Clients",
  "api": "API",
  "docs": "Documentação",
  "playground": "Playground",
  "changelog": "Changelog",
  "status": "Status",
  "monitoring": "Monitoramento",
  "notifications": "Notificações",
  "tags": "Tags",
  "api-metrics": "Métricas da API",
  "compare": "Comparar",
  "submit": "Submeter",
  "oauth": "OAuth",
  "authorize": "Autorização",
};

export function Breadcrumb() {
  const [location] = useLocation();
  
  if (location === "/") return null;
  
  const segments = location.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [
    { label: "Início", href: "/" },
  ];
  
  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    items.push({
      label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
    });
  }
  
  // Último item não tem link
  if (items.length > 1) {
    items[items.length - 1].href = undefined;
  }
  
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-muted/30 border-b">
      <ol className="container flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {item.href ? (
              <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                {index === 0 && <Home className="h-4 w-4" />}
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function useBreadcrumb() {
  const [location] = useLocation();
  
  const segments = location.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];
  
  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    items.push({
      label: routeLabels[segment] || segment,
      href: currentPath,
    });
  }
  
  return items;
}
