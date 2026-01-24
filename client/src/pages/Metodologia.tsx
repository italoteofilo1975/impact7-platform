import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Calculator,
  Code,
  Target,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Layers,
} from "lucide-react";
import { Link } from "wouter";

const pillars = [
  {
    icon: Brain,
    title: "Ciência Cognitiva",
    description:
      "Modelos baseados em neurociência e psicologia comportamental para entender como mudanças sociais acontecem",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Calculator,
    title: "Modelagem Matemática",
    description:
      "Algoritmos proprietários de SROI que capturam valor social, ambiental e econômico com precisão científica",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Code,
    title: "Engenharia de Software",
    description:
      "Plataforma escalável com IA para automação de coleta, análise e visualização de dados de impacto",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

const steps = [
  {
    number: "01",
    title: "Mapeamento de Teoria de Mudança",
    description:
      "Definimos os inputs, atividades, outputs, outcomes e impactos do seu projeto usando frameworks validados",
  },
  {
    number: "02",
    title: "Coleta de Dados Estruturada",
    description:
      "Implementamos instrumentos de coleta automatizados com validação em tempo real e integração com sistemas existentes",
  },
  {
    number: "03",
    title: "Análise e Modelagem",
    description:
      "Aplicamos modelos matemáticos para calcular SROI, atribuição de impacto e análise de sensibilidade",
  },
  {
    number: "04",
    title: "Visualização e Relatórios",
    description:
      "Geramos dashboards interativos e relatórios automatizados para diferentes stakeholders",
  },
  {
    number: "05",
    title: "Melhoria Contínua",
    description:
      "Ciclos de feedback para otimização constante de programas baseada em evidências",
  },
];

const differentials = [
  {
    icon: Target,
    title: "Precisão Científica",
    description: "Metodologia validada por pesquisadores e praticantes do terceiro setor",
  },
  {
    icon: TrendingUp,
    title: "Escalabilidade",
    description: "De projetos locais a programas nacionais com a mesma consistência",
  },
  {
    icon: Users,
    title: "Engajamento",
    description: "Sistema de tokens que incentiva participação e coleta de dados",
  },
  {
    icon: Award,
    title: "Credibilidade",
    description: "Relatórios aceitos por fundações, investidores e órgãos públicos",
  },
  {
    icon: Lightbulb,
    title: "Insights Acionáveis",
    description: "Não apenas métricas, mas recomendações práticas de melhoria",
  },
  {
    icon: BarChart3,
    title: "Benchmarking",
    description: "Compare seu impacto com organizações similares do setor",
  },
];

const frameworks = [
  "SROI (Social Return on Investment)",
  "Teoria de Mudança",
  "Logic Model",
  "IRIS+ Metrics",
  "SDG Impact Standards",
  "IMP (Impact Management Project)",
  "GIIN IRIS Catalog",
  "B Impact Assessment",
];

export default function Metodologia() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Metodologia</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            O Método IMPACT7
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Uma abordagem científica e sistemática para mensurar, comunicar e
            maximizar o impacto social
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/demo">
                Ver em Ação
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/whitepaper">Baixar Whitepaper</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Os Três Pilares</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O Método IMPACT7 integra três disciplinas complementares para criar
              uma abordagem única de mensuração de impacto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div
                    className={`mx-auto w-16 h-16 rounded-full ${pillar.bgColor} flex items-center justify-center mb-4`}
                  >
                    <pillar.icon className={`h-8 w-8 ${pillar.color}`} />
                  </div>
                  <CardTitle>{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O Processo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cinco etapas estruturadas para transformar dados em insights de
              impacto
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-16 bg-border mx-auto mt-2" />
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por Que IMPACT7?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Diferenciais que fazem do nosso método a escolha de organizações
              líderes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentials.map((diff, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <diff.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{diff.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {diff.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Compatível com Frameworks Globais
              </h2>
              <p className="text-muted-foreground mb-6">
                Nossa metodologia é compatível e complementar aos principais
                frameworks de mensuração de impacto reconhecidos
                internacionalmente
              </p>
              <div className="grid grid-cols-2 gap-3">
                {frameworks.map((framework, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{framework}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card>
              <CardContent className="pt-6">
                <Layers className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Integração Flexível
                </h3>
                <p className="text-muted-foreground mb-4">
                  O IMPACT7 não substitui seus processos existentes - ele os
                  potencializa. Nossa plataforma se integra com ferramentas que
                  você já usa e exporta dados nos formatos exigidos por
                  financiadores.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/integracoes">Ver Integrações</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Aplicar o Método IMPACT7?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Agende uma demonstração e veja como nossa metodologia pode
            transformar a mensuração de impacto da sua organização
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/demo">Agendar Demonstração</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/casos-sucesso">Ver Casos de Sucesso</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
