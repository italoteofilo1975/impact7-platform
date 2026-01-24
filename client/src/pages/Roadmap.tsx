import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  Rocket,
  Target,
  Lightbulb,
  Vote,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "planned" | "considering";
  quarter: string;
  votes: number;
  comments: number;
  category: string;
}

const roadmapItems: RoadmapItem[] = [
  // Completed
  {
    id: 1,
    title: "Sistema de Notificações em Tempo Real",
    description: "Notificações push e SSE para alertas instantâneos",
    status: "completed",
    quarter: "Q1 2026",
    votes: 156,
    comments: 23,
    category: "Plataforma",
  },
  {
    id: 2,
    title: "Integração Stripe para Pagamentos",
    description: "Checkout, assinaturas e portal do cliente",
    status: "completed",
    quarter: "Q1 2026",
    votes: 203,
    comments: 45,
    category: "Monetização",
  },
  {
    id: 3,
    title: "Sistema de Tokens de Impacto",
    description: "Gamificação com tokens para engajamento",
    status: "completed",
    quarter: "Q1 2026",
    votes: 189,
    comments: 34,
    category: "Gamificação",
  },
  // In Progress
  {
    id: 4,
    title: "App Mobile Nativo",
    description: "Aplicativo iOS e Android com todas as funcionalidades",
    status: "in-progress",
    quarter: "Q2 2026",
    votes: 312,
    comments: 67,
    category: "Mobile",
  },
  {
    id: 5,
    title: "Integração com ERPs",
    description: "Conectores para SAP, Oracle, Totvs e outros",
    status: "in-progress",
    quarter: "Q2 2026",
    votes: 145,
    comments: 28,
    category: "Integrações",
  },
  {
    id: 6,
    title: "API Pública v2",
    description: "Nova versão da API com GraphQL e webhooks",
    status: "in-progress",
    quarter: "Q2 2026",
    votes: 178,
    comments: 41,
    category: "API",
  },
  // Planned
  {
    id: 7,
    title: "Marketplace de Projetos",
    description: "Plataforma para conectar investidores e projetos sociais",
    status: "planned",
    quarter: "Q3 2026",
    votes: 267,
    comments: 52,
    category: "Marketplace",
  },
  {
    id: 8,
    title: "IA para Análise de Impacto",
    description: "Machine learning para previsão e otimização de impacto",
    status: "planned",
    quarter: "Q3 2026",
    votes: 234,
    comments: 38,
    category: "IA",
  },
  {
    id: 9,
    title: "Certificação ISO de Impacto",
    description: "Processo de certificação alinhado com padrões internacionais",
    status: "planned",
    quarter: "Q4 2026",
    votes: 156,
    comments: 19,
    category: "Compliance",
  },
  // Considering
  {
    id: 10,
    title: "Blockchain para Rastreabilidade",
    description: "Registro imutável de impacto em blockchain",
    status: "considering",
    quarter: "2027",
    votes: 189,
    comments: 45,
    category: "Blockchain",
  },
  {
    id: 11,
    title: "White Label para Corporações",
    description: "Versão customizável para grandes empresas",
    status: "considering",
    quarter: "2027",
    votes: 134,
    comments: 22,
    category: "Enterprise",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "in-progress":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "planned":
      return <Target className="h-5 w-5 text-yellow-500" />;
    case "considering":
      return <Lightbulb className="h-5 w-5 text-purple-500" />;
    default:
      return <Rocket className="h-5 w-5" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-500">Concluído</Badge>;
    case "in-progress":
      return <Badge className="bg-blue-500">Em Progresso</Badge>;
    case "planned":
      return <Badge className="bg-yellow-500 text-black">Planejado</Badge>;
    case "considering":
      return <Badge variant="secondary">Em Análise</Badge>;
    default:
      return <Badge variant="outline">Futuro</Badge>;
  }
};

const getStatusProgress = (status: string) => {
  switch (status) {
    case "completed":
      return 100;
    case "in-progress":
      return 60;
    case "planned":
      return 20;
    case "considering":
      return 5;
    default:
      return 0;
  }
};

export default function Roadmap() {
  const completed = roadmapItems.filter((i) => i.status === "completed");
  const inProgress = roadmapItems.filter((i) => i.status === "in-progress");
  const planned = roadmapItems.filter((i) => i.status === "planned");
  const considering = roadmapItems.filter((i) => i.status === "considering");

  const renderItems = (items: RoadmapItem[]) => (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(item.status)}
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {item.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="text-muted-foreground">{item.quarter}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    {item.votes}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {item.comments}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                {getStatusBadge(item.status)}
              </div>
            </div>
            <Progress
              value={getStatusProgress(item.status)}
              className="mt-4 h-1"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Roadmap</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            O Futuro do IMPACT7
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Acompanhe o que estamos construindo e vote nas funcionalidades que
            você mais deseja
          </p>
          <Button>
            <Vote className="mr-2 h-4 w-4" />
            Sugerir Funcionalidade
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-green-500">{completed.length}</p>
              <p className="text-muted-foreground">Concluídos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">{inProgress.length}</p>
              <p className="text-muted-foreground">Em Progresso</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-500">{planned.length}</p>
              <p className="text-muted-foreground">Planejados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-500">{considering.length}</p>
              <p className="text-muted-foreground">Em Análise</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Sections */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl space-y-12">
          {/* In Progress */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold">Em Progresso</h2>
            </div>
            {renderItems(inProgress)}
          </div>

          {/* Planned */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Planejado</h2>
            </div>
            {renderItems(planned)}
          </div>

          {/* Considering */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold">Em Análise</h2>
            </div>
            {renderItems(considering)}
          </div>

          {/* Completed */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold">Concluído</h2>
            </div>
            {renderItems(completed)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sua Opinião Importa
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Vote nas funcionalidades que você mais deseja ou sugira novas ideias.
            Construímos o IMPACT7 junto com nossa comunidade.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary">
              <Vote className="mr-2 h-4 w-4" />
              Votar em Funcionalidades
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Sugerir Ideia
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
