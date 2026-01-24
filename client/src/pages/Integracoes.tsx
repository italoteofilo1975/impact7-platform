import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plug,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Code,
  Zap,
  Database,
  BarChart,
  FileText,
  Users,
  CreditCard,
  Mail,
  MessageSquare,
  Calendar,
  Cloud,
} from "lucide-react";

interface Integration {
  name: string;
  description: string;
  category: string;
  status: "available" | "coming-soon" | "beta";
  icon: React.ReactNode;
  features: string[];
}

const integrations: Integration[] = [
  {
    name: "Stripe",
    description: "Processamento de pagamentos e assinaturas",
    category: "Pagamentos",
    status: "available",
    icon: <CreditCard className="h-8 w-8" />,
    features: ["Checkout", "Assinaturas", "Faturas", "Portal do Cliente"],
  },
  {
    name: "Salesforce",
    description: "CRM e gestão de relacionamento com clientes",
    category: "CRM",
    status: "coming-soon",
    icon: <Users className="h-8 w-8" />,
    features: ["Sincronização de Leads", "Oportunidades", "Relatórios"],
  },
  {
    name: "HubSpot",
    description: "Marketing automation e CRM",
    category: "Marketing",
    status: "coming-soon",
    icon: <Mail className="h-8 w-8" />,
    features: ["Email Marketing", "Landing Pages", "Analytics"],
  },
  {
    name: "Google Analytics",
    description: "Análise de tráfego e comportamento",
    category: "Analytics",
    status: "available",
    icon: <BarChart className="h-8 w-8" />,
    features: ["Eventos", "Conversões", "Funil", "Relatórios"],
  },
  {
    name: "Slack",
    description: "Notificações e alertas em tempo real",
    category: "Comunicação",
    status: "available",
    icon: <MessageSquare className="h-8 w-8" />,
    features: ["Alertas", "Relatórios Diários", "Comandos Slash"],
  },
  {
    name: "Microsoft Teams",
    description: "Integração com ambiente Microsoft",
    category: "Comunicação",
    status: "coming-soon",
    icon: <Users className="h-8 w-8" />,
    features: ["Notificações", "Bots", "Tabs"],
  },
  {
    name: "Zapier",
    description: "Conecte com +5000 aplicativos",
    category: "Automação",
    status: "available",
    icon: <Zap className="h-8 w-8" />,
    features: ["Triggers", "Actions", "Multi-step Zaps"],
  },
  {
    name: "Make (Integromat)",
    description: "Automações visuais avançadas",
    category: "Automação",
    status: "beta",
    icon: <Cloud className="h-8 w-8" />,
    features: ["Cenários", "Webhooks", "Filtros"],
  },
  {
    name: "Power BI",
    description: "Business intelligence e dashboards",
    category: "Analytics",
    status: "coming-soon",
    icon: <BarChart className="h-8 w-8" />,
    features: ["Datasets", "Dashboards", "Relatórios"],
  },
  {
    name: "Google Sheets",
    description: "Exportação e sincronização de dados",
    category: "Produtividade",
    status: "available",
    icon: <FileText className="h-8 w-8" />,
    features: ["Exportação", "Importação", "Sync Automático"],
  },
  {
    name: "SAP",
    description: "Integração com ERP SAP",
    category: "ERP",
    status: "coming-soon",
    icon: <Database className="h-8 w-8" />,
    features: ["Módulos FI/CO", "MM", "SD"],
  },
  {
    name: "TOTVS",
    description: "Integração com sistemas TOTVS",
    category: "ERP",
    status: "coming-soon",
    icon: <Database className="h-8 w-8" />,
    features: ["Protheus", "RM", "Datasul"],
  },
];

const categories = Array.from(new Set(integrations.map((i) => i.category)));

const getStatusBadge = (status: string) => {
  switch (status) {
    case "available":
      return <Badge className="bg-green-500">Disponível</Badge>;
    case "beta":
      return <Badge className="bg-blue-500">Beta</Badge>;
    case "coming-soon":
      return <Badge variant="secondary">Em Breve</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

export default function Integracoes() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Plug className="h-12 w-12 text-primary" />
            </div>
          </div>
          <Badge className="mb-4">Integrações</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Conecte o IMPACT7 às Suas Ferramentas
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Integrações nativas com as principais plataformas do mercado para
            automatizar seu fluxo de trabalho
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button>
              <Code className="mr-2 h-4 w-4" />
              Ver Documentação da API
            </Button>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Solicitar Integração
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">
                {integrations.filter((i) => i.status === "available").length}
              </p>
              <p className="text-muted-foreground">Disponíveis</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">
                {integrations.filter((i) => i.status === "beta").length}
              </p>
              <p className="text-muted-foreground">Em Beta</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-muted-foreground">
                {integrations.filter((i) => i.status === "coming-soon").length}
              </p>
              <p className="text-muted-foreground">Em Breve</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5000+</p>
              <p className="text-muted-foreground">Via Zapier</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations by Category */}
      <section className="py-16 px-4">
        <div className="container">
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations
                  .filter((i) => i.category === category)
                  .map((integration, index) => (
                    <Card
                      key={index}
                      className={`hover:shadow-md transition-shadow ${
                        integration.status === "coming-soon"
                          ? "opacity-70"
                          : ""
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-muted">
                            {integration.icon}
                          </div>
                          {getStatusBadge(integration.status)}
                        </div>
                        <CardTitle className="mt-4">{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-4">
                          {integration.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant={
                            integration.status === "available"
                              ? "default"
                              : "outline"
                          }
                          className="w-full"
                          disabled={integration.status === "coming-soon"}
                        >
                          {integration.status === "available"
                            ? "Configurar"
                            : integration.status === "beta"
                            ? "Testar Beta"
                            : "Notificar-me"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* API Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4">API REST</Badge>
              <h2 className="text-3xl font-bold mb-4">
                Construa Sua Própria Integração
              </h2>
              <p className="text-muted-foreground mb-6">
                Nossa API REST completa permite que você integre o IMPACT7 com
                qualquer sistema. Documentação detalhada, SDKs e suporte técnico
                disponíveis.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Autenticação OAuth 2.0
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Rate limiting generoso
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Webhooks para eventos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  SDKs para Python, Node.js, PHP
                </li>
              </ul>
              <Button>
                <Code className="mr-2 h-4 w-4" />
                Acessar Documentação
              </Button>
            </div>
            <div className="bg-card rounded-lg p-6 border">
              <pre className="text-sm overflow-x-auto">
                <code className="text-muted-foreground">
{`// Exemplo de uso da API
const impact7 = require('impact7-sdk');

const client = new impact7.Client({
  apiKey: 'sua_api_key'
});

// Calcular impacto
const result = await client.calculate({
  investment: 100000,
  sector: 'education',
  beneficiaries: 500
});

console.log(result.sroi); // 4.2`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Não Encontrou a Integração que Precisa?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Entre em contato conosco para solicitar uma nova integração ou
            discutir uma solução personalizada para sua empresa.
          </p>
          <Button size="lg" variant="secondary">
            Solicitar Integração
          </Button>
        </div>
      </section>
    </div>
  );
}
