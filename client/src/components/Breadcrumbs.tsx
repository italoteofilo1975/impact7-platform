/**
 * Componente de Breadcrumbs
 * Navegacao hierarquica para paginas internas da plataforma IMPACT7
 */

import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

// Mapeamento de rotas para nomes amigaveis
const ROUTE_NAMES: Record<string, string> = {
  '': 'Home',
  'sobre': 'Sobre',
  'ciencia': 'Ciencia',
  'matematica': 'Matematica',
  'tecnologia': 'Tecnologia',
  'calculadora': 'Calculadora S-ROI',
  'cases': 'Cases de Sucesso',
  'casos-sucesso': 'Casos de Sucesso',
  'impacto': 'Impacto',
  'whitepaper': 'Whitepaper',
  'ebook': 'E-book',
  'blog': 'Blog',
  'recursos': 'Recursos',
  'webinars': 'Webinars',
  'metodologia': 'Metodologia',
  'glossario': 'Glossario',
  'certificacoes': 'Certificacoes',
  'precos': 'Precos',
  'comparacao': 'Comparacao',
  'demo': 'Demo',
  'comunidade': 'Comunidade',
  'depoimentos': 'Depoimentos',
  'faq': 'FAQ',
  'suporte': 'Suporte',
  'contato': 'Contato',
  'parceiros': 'Parceiros',
  'carreiras': 'Carreiras',
  'integracoes': 'Integracoes',
  'roadmap': 'Roadmap',
  'changelog': 'Changelog',
  'status': 'Status',
  'seguranca': 'Seguranca',
  'termos': 'Termos de Uso',
  'privacidade': 'Privacidade',
  'newsletter': 'Newsletter',
  'dashboard': 'Dashboard',
  'configuracoes': 'Configuracoes',
  'perfil': 'Perfil',
  'notificacoes': 'Notificacoes',
  'api-docs': 'Documentacao API',
  'api-keys': 'Chaves de API',
  'webhooks': 'Webhooks',
  'conformidade': 'Conformidade SET7',
  'referrals': 'Indicacoes',
  'onboarding': 'Onboarding',
  'payments': 'Pagamentos',
  'admin': 'Administracao',
  'jarvis': 'Jarvis AI',
};

// Rotas que nao devem mostrar breadcrumbs
const HIDDEN_ROUTES = ['/', '/login', '/register', '/404'];

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
  customItems?: { label: string; path: string }[];
}

export function Breadcrumbs({ 
  className = '', 
  showHome = true,
  customItems 
}: BreadcrumbsProps) {
  const [location] = useLocation();

  // Nao mostrar em rotas especificas
  if (HIDDEN_ROUTES.includes(location)) {
    return null;
  }

  // Gerar itens do breadcrumb a partir da URL
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return customItems.map((item, index) => ({
        ...item,
        isLast: index === customItems.length - 1,
      }));
    }

    const segments = location.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    if (showHome) {
      items.push({
        label: 'Home',
        path: '/',
        isLast: segments.length === 0,
      });
    }

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = ROUTE_NAMES[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      items.push({
        label,
        path: currentPath,
        isLast: index === segments.length - 1,
      });
    });

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Nao mostrar se so tem Home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center text-sm text-muted-foreground ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {breadcrumbs.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            )}
            
            {item.isLast ? (
              <span 
                className="font-medium text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {index === 0 && showHome ? (
                  <span className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </span>
                ) : (
                  item.label
                )}
              </span>
            ) : (
              <Link 
                href={item.path}
                className="hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {index === 0 && showHome ? (
                  <span className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Hook para usar breadcrumbs customizados
export function useBreadcrumbs() {
  const [location] = useLocation();

  const getBreadcrumbsForRoute = (route: string): BreadcrumbItem[] => {
    const segments = route.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: 'Home', path: '/', isLast: segments.length === 0 }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = ROUTE_NAMES[segment] || segment;
      items.push({
        label,
        path: currentPath,
        isLast: index === segments.length - 1,
      });
    });

    return items;
  };

  return {
    currentPath: location,
    breadcrumbs: getBreadcrumbsForRoute(location),
    getRouteLabel: (segment: string) => ROUTE_NAMES[segment] || segment,
  };
}

// Componente de breadcrumb estruturado para SEO (schema.org)
export function BreadcrumbsStructuredData() {
  const [location] = useLocation();
  const segments = location.split('/').filter(Boolean);
  
  if (segments.length === 0) return null;

  const items = [
    { name: 'Home', url: 'https://impact7.com.br/' }
  ];

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const name = ROUTE_NAMES[segment] || segment;
    items.push({
      name,
      url: `https://impact7.com.br${currentPath}`,
    });
  });

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default Breadcrumbs;
