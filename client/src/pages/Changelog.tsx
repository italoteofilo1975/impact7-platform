import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Bug,
  Wrench,
  Zap,
  Shield,
  Database,
  Layout,
  Bell,
} from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: "major" | "minor" | "patch";
  changes: {
    type: "feature" | "fix" | "improvement" | "security";
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "2.5.0",
    date: "15 Jan 2026",
    title: "Sistema de Pagamentos e Assinaturas",
    type: "major",
    changes: [
      { type: "feature", description: "Integração completa com Stripe para pagamentos" },
      { type: "feature", description: "Página de preços com planos Free, Pro e Enterprise" },
      { type: "feature", description: "Portal do cliente para gerenciar assinatura" },
      { type: "feature", description: "Histórico de pagamentos e faturas" },
      { type: "improvement", description: "Checkout otimizado com trial de 14 dias" },
    ],
  },
  {
    version: "2.4.0",
    date: "14 Jan 2026",
    title: "Sistema de Referências e Afiliados",
    type: "major",
    changes: [
      { type: "feature", description: "Programa de indicações com código único" },
      { type: "feature", description: "Dashboard de referências com estatísticas" },
      { type: "feature", description: "Recompensas em tokens de impacto" },
      { type: "improvement", description: "Compartilhamento social integrado" },
    ],
  },
  {
    version: "2.3.0",
    date: "13 Jan 2026",
    title: "Dashboard de Métricas de Negócio",
    type: "major",
    changes: [
      { type: "feature", description: "Métricas de MRR, ARR e Churn Rate" },
      { type: "feature", description: "Unit Economics (LTV, CAC, LTV:CAC)" },
      { type: "feature", description: "Funil de conversão visual" },
      { type: "feature", description: "Exportação de relatórios em PDF" },
    ],
  },
  {
    version: "2.2.0",
    date: "12 Jan 2026",
    title: "Sistema de Suporte e Tickets",
    type: "major",
    changes: [
      { type: "feature", description: "Sistema de tickets com prioridades" },
      { type: "feature", description: "FAQ expandido com busca" },
      { type: "feature", description: "Chat de suporte integrado" },
      { type: "improvement", description: "Respostas automáticas por categoria" },
    ],
  },
  {
    version: "2.1.0",
    date: "11 Jan 2026",
    title: "Sistema de Auditoria e Compliance",
    type: "minor",
    changes: [
      { type: "feature", description: "Log de auditoria para ações administrativas" },
      { type: "feature", description: "Rastreamento de alterações de configurações" },
      { type: "security", description: "Registro de exportações de dados" },
      { type: "improvement", description: "Filtros avançados no log de auditoria" },
    ],
  },
  {
    version: "2.0.0",
    date: "10 Jan 2026",
    title: "Notificações em Tempo Real",
    type: "major",
    changes: [
      { type: "feature", description: "Sistema SSE para notificações em tempo real" },
      { type: "feature", description: "Push notifications no navegador" },
      { type: "feature", description: "Central de notificações com filtros" },
      { type: "feature", description: "Preferências de notificação por tipo" },
      { type: "improvement", description: "Toast visual para alertas instantâneos" },
    ],
  },
  {
    version: "1.5.0",
    date: "08 Jan 2026",
    title: "Tokens de Impacto",
    type: "major",
    changes: [
      { type: "feature", description: "Sistema de tokens de impacto social" },
      { type: "feature", description: "Dashboard de tokens para usuários" },
      { type: "feature", description: "Histórico de transações" },
      { type: "feature", description: "Ranking de impacto" },
    ],
  },
  {
    version: "1.4.0",
    date: "06 Jan 2026",
    title: "Certificados Digitais",
    type: "minor",
    changes: [
      { type: "feature", description: "Geração de certificados de impacto" },
      { type: "feature", description: "Verificação por QR Code" },
      { type: "feature", description: "Compartilhamento em redes sociais" },
      { type: "security", description: "Assinatura digital dos certificados" },
    ],
  },
  {
    version: "1.3.0",
    date: "04 Jan 2026",
    title: "Calculadora de Impacto Avançada",
    type: "minor",
    changes: [
      { type: "feature", description: "7 dimensões de impacto social" },
      { type: "feature", description: "Cálculo de SROI automatizado" },
      { type: "feature", description: "Comparação com benchmarks do setor" },
      { type: "improvement", description: "Visualização gráfica dos resultados" },
    ],
  },
  {
    version: "1.0.0",
    date: "01 Jan 2026",
    title: "Lançamento Inicial",
    type: "major",
    changes: [
      { type: "feature", description: "Plataforma IMPACT7 lançada" },
      { type: "feature", description: "Sistema de autenticação" },
      { type: "feature", description: "Dashboard do usuário" },
      { type: "feature", description: "Submissão de cases de impacto" },
    ],
  },
];

const getChangeIcon = (type: string) => {
  switch (type) {
    case "feature":
      return <Sparkles className="h-4 w-4 text-green-500" />;
    case "fix":
      return <Bug className="h-4 w-4 text-red-500" />;
    case "improvement":
      return <Wrench className="h-4 w-4 text-blue-500" />;
    case "security":
      return <Shield className="h-4 w-4 text-purple-500" />;
    default:
      return <Zap className="h-4 w-4 text-yellow-500" />;
  }
};

const getVersionBadge = (type: string) => {
  switch (type) {
    case "major":
      return <Badge className="bg-green-500">Major</Badge>;
    case "minor":
      return <Badge className="bg-blue-500">Minor</Badge>;
    case "patch":
      return <Badge variant="secondary">Patch</Badge>;
    default:
      return <Badge variant="outline">Update</Badge>;
  }
};

export default function Changelog() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Changelog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Histórico de Atualizações
          </h1>
          <p className="text-xl text-muted-foreground">
            Acompanhe todas as novidades, melhorias e correções da plataforma IMPACT7
          </p>
        </div>
      </section>

      {/* Changelog List */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-8">
              {changelog.map((entry, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block" />

                  <Card className="md:ml-16">
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-3">
                        <CardTitle className="text-xl">v{entry.version}</CardTitle>
                        {getVersionBadge(entry.type)}
                        <span className="text-sm text-muted-foreground">
                          {entry.date}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-muted-foreground">
                        {entry.title}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {entry.changes.map((change, changeIndex) => (
                          <li
                            key={changeIndex}
                            className="flex items-start gap-3"
                          >
                            {getChangeIcon(change.type)}
                            <span className="text-sm">{change.description}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container max-w-4xl text-center">
          <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            Fique por Dentro das Novidades
          </h2>
          <p className="text-muted-foreground mb-6">
            Receba notificações sobre novas funcionalidades e atualizações importantes
          </p>
          <Badge variant="outline" className="text-sm">
            Notificações ativadas automaticamente para usuários logados
          </Badge>
        </div>
      </section>
    </div>
  );
}
