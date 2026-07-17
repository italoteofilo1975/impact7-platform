import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  RefreshCw, 
  AlertTriangle,
  Bug,
  Search,
  Calendar,
  Tag,
  Bell,
  ExternalLink
} from "lucide-react";

// Tipos
interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description?: string;
  changes: Change[];
  breaking?: boolean;
}

interface Change {
  type: "added" | "changed" | "deprecated" | "removed" | "fixed" | "security";
  description: string;
  endpoint?: string;
  migration?: string;
}

// Dados do changelog
const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "2026-01-13",
    title: "Webhooks e OAuth2",
    description: "Adicionamos suporte completo a webhooks para notificações em tempo real e autenticação OAuth2 para integrações mais seguras.",
    changes: [
      { type: "added", description: "Sistema de webhooks com 7 eventos suportados", endpoint: "/api/v1/webhooks" },
      { type: "added", description: "Autenticação OAuth2 com fluxo Authorization Code + PKCE", endpoint: "/oauth/authorize" },
      { type: "added", description: "Rate limiting configurável por OAuth client" },
      { type: "added", description: "Documentação OpenAPI 3.0 interativa", endpoint: "/api/docs" },
      { type: "changed", description: "Headers de rate limit agora incluem X-RateLimit-Reset" },
      { type: "fixed", description: "Correção de timeout em requisições de cálculo S-ROI" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-01-10",
    title: "API Pública e Gamificação",
    description: "Lançamento da API pública para integrações externas e sistema de gamificação para engajamento de usuários.",
    changes: [
      { type: "added", description: "API pública REST com autenticação por API key", endpoint: "/api/v1/*" },
      { type: "added", description: "Sistema de gamificação com pontos e badges" },
      { type: "added", description: "Dashboard público de impacto", endpoint: "/impacto" },
      { type: "added", description: "Leaderboard de usuários mais ativos" },
      { type: "changed", description: "Limite de requisições aumentado para 1000/hora" },
      { type: "deprecated", description: "Endpoint /api/cases será substituído por /api/v1/cases na v2.0", endpoint: "/api/cases" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-01-05",
    title: "Cases Avançados",
    description: "Novos recursos para gerenciamento de cases incluindo comparador, tags e exportação em PDF.",
    changes: [
      { type: "added", description: "Comparador de cases lado a lado", endpoint: "/cases/compare" },
      { type: "added", description: "Sistema de tags personalizadas para cases" },
      { type: "added", description: "Exportação de cases em PDF" },
      { type: "added", description: "Relatório consolidado com múltiplos cases" },
      { type: "added", description: "Formulário de submissão de cases", endpoint: "/cases/submit" },
      { type: "changed", description: "Filtros de cases agora incluem ODS e faixa de investimento" },
      { type: "fixed", description: "Correção de paginação em listas grandes" },
    ],
  },
  {
    version: "1.0.0",
    date: "2025-12-20",
    title: "Lançamento Inicial",
    description: "Versão inicial da plataforma IMPACT7 com calculadora S-ROI, Jarvis IA e sistema de cases.",
    breaking: true,
    changes: [
      { type: "added", description: "Calculadora de S-ROI (Social Return on Investment)" },
      { type: "added", description: "Jarvis - Assistente IA com RAG sobre Método IMPACT7" },
      { type: "added", description: "Sistema de cases de impacto social" },
      { type: "added", description: "Dashboard de analytics" },
      { type: "added", description: "Autenticação por e-mail e senha" },
      { type: "added", description: "PWA com suporte offline" },
    ],
  },
  {
    version: "0.9.0",
    date: "2025-12-01",
    title: "Beta Fechado",
    description: "Versão beta para testes internos e parceiros selecionados.",
    changes: [
      { type: "added", description: "Versão inicial da calculadora" },
      { type: "added", description: "Protótipo do Jarvis" },
      { type: "security", description: "Implementação de rate limiting básico" },
    ],
  },
];

// Componente de ícone por tipo de mudança
function ChangeIcon({ type }: { type: Change["type"] }) {
  switch (type) {
    case "added":
      return <Plus className="h-4 w-4 text-green-500" />;
    case "changed":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    case "deprecated":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "removed":
      return <Minus className="h-4 w-4 text-red-500" />;
    case "fixed":
      return <Bug className="h-4 w-4 text-purple-500" />;
    case "security":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default:
      return null;
  }
}

// Badge de tipo de mudança
function ChangeBadge({ type }: { type: Change["type"] }) {
  const variants: Record<Change["type"], { label: string; className: string }> = {
    added: { label: "Adicionado", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    changed: { label: "Alterado", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    deprecated: { label: "Deprecado", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    removed: { label: "Removido", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    fixed: { label: "Corrigido", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    security: { label: "Segurança", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  };
  
  const { label, className } = variants[type];
  
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export default function ApiChangelog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<Change["type"] | "all">("all");
  
  // Filtrar changelog
  const filteredChangelog = CHANGELOG.map(entry => ({
    ...entry,
    changes: entry.changes.filter(change => {
      const matchesSearch = searchQuery === "" || 
        change.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (change.endpoint && change.endpoint.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === "all" || change.type === filterType;
      return matchesSearch && matchesType;
    }),
  })).filter(entry => entry.changes.length > 0 || searchQuery === "");
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/api/docs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Docs
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                API Changelog
              </h1>
              <p className="text-sm text-muted-foreground">
                Histórico de versões e mudanças da API
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Filtros */}
          <div className="lg:col-span-1 space-y-6">
            {/* Busca */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Buscar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar mudanças..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Filtro por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Filtrar por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={filterType === "all" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType("all")}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Todos
                </Button>
                <Button
                  variant={filterType === "added" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType("added")}
                >
                  <Plus className="h-4 w-4 mr-2 text-green-500" />
                  Adicionados
                </Button>
                <Button
                  variant={filterType === "changed" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType("changed")}
                >
                  <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                  Alterados
                </Button>
                <Button
                  variant={filterType === "deprecated" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType("deprecated")}
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                  Deprecados
                </Button>
                <Button
                  variant={filterType === "fixed" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType("fixed")}
                >
                  <Bug className="h-4 w-4 mr-2 text-purple-500" />
                  Corrigidos
                </Button>
                <Button
                  variant={filterType === "security" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType("security")}
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Segurança
                </Button>
              </CardContent>
            </Card>
            
            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Receba atualizações sobre novas versões da API
                </p>
                <Link href="/webhooks">
                  <Button variant="outline" size="sm" className="w-full">
                    Configurar Webhooks
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Links Rápidos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Links Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/api/docs">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Documentação
                  </Button>
                </Link>
                <Link href="/api/playground">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Playground
                  </Button>
                </Link>
                <Link href="/api-keys">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    API Keys
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Lista de Versões */}
          <div className="lg:col-span-3 space-y-6">
            {filteredChangelog.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Nenhuma mudança encontrada para os filtros selecionados
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredChangelog.map((entry, index) => (
                <Card key={entry.version} className={entry.breaking ? "border-destructive" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          <Badge variant="default" className="text-lg px-3 py-1">
                            v{entry.version}
                          </Badge>
                          {entry.breaking && (
                            <Badge variant="destructive">Breaking Changes</Badge>
                          )}
                          {index === 0 && (
                            <Badge variant="secondary">Mais Recente</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(entry.date).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mt-2">{entry.title}</h3>
                    {entry.description && (
                      <p className="text-muted-foreground">{entry.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entry.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <ChangeIcon type={change.type} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <ChangeBadge type={change.type} />
                              {change.endpoint && (
                                <code className="text-xs bg-background px-2 py-0.5 rounded">
                                  {change.endpoint}
                                </code>
                              )}
                            </div>
                            <p className="mt-1 text-sm">{change.description}</p>
                            {change.migration && (
                              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
                                <strong>Migração:</strong> {change.migration}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
