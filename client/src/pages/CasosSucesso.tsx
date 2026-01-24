import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  DollarSign,
  Award,
  ArrowRight,
  Quote,
  Building2,
  Target,
  BarChart3,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface CaseStudy {
  id: string;
  title: string;
  organization: string;
  sector: string;
  logo?: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    improvement: string;
  }[];
  quote: string;
  author: string;
  role: string;
  featured: boolean;
}

const caseStudies: CaseStudy[] = [
  {
    id: "instituto-esperanca",
    title: "Transformação Digital na Mensuração de Impacto",
    organization: "Instituto Esperança",
    sector: "Educação",
    challenge:
      "Dificuldade em mensurar o impacto real dos programas educacionais em comunidades de baixa renda, com processos manuais e dados fragmentados.",
    solution:
      "Implementação do IMPACT7 para centralizar dados, automatizar cálculos de SROI e gerar relatórios para stakeholders.",
    results: [
      { metric: "SROI", value: "4.2:1", improvement: "+180%" },
      { metric: "Tempo de relatório", value: "2 dias", improvement: "-85%" },
      { metric: "Engajamento", value: "92%", improvement: "+45%" },
    ],
    quote:
      "O IMPACT7 revolucionou nossa forma de demonstrar impacto. Agora conseguimos mostrar aos doadores exatamente o retorno de cada real investido.",
    author: "Maria Santos",
    role: "Diretora Executiva",
    featured: true,
  },
  {
    id: "fundacao-verde",
    title: "Escalando Projetos Ambientais com Dados",
    organization: "Fundação Verde Vida",
    sector: "Meio Ambiente",
    challenge:
      "Necessidade de comprovar impacto ambiental para captar recursos de fundos internacionais com critérios rigorosos.",
    solution:
      "Uso da calculadora de SROI ambiental e sistema de tokens para engajar voluntários e comunidades locais.",
    results: [
      { metric: "Captação", value: "R$ 2.5M", improvement: "+320%" },
      { metric: "Voluntários", value: "1.200", improvement: "+200%" },
      { metric: "Áreas restauradas", value: "500 ha", improvement: "+150%" },
    ],
    quote:
      "Com os relatórios do IMPACT7, conseguimos aprovar projetos em fundos que antes eram inacessíveis para nós.",
    author: "Carlos Oliveira",
    role: "Coordenador de Projetos",
    featured: true,
  },
  {
    id: "ong-saude",
    title: "Otimizando Programas de Saúde Comunitária",
    organization: "ONG Saúde para Todos",
    sector: "Saúde",
    challenge:
      "Dificuldade em demonstrar o custo-benefício de programas preventivos de saúde para financiadores governamentais.",
    solution:
      "Implementação de métricas de impacto em saúde com cálculo de economia para o sistema público.",
    results: [
      { metric: "Economia SUS", value: "R$ 8.7M", improvement: "Anual" },
      { metric: "Atendimentos", value: "45.000", improvement: "+60%" },
      { metric: "Satisfação", value: "98%", improvement: "+25%" },
    ],
    quote:
      "Finalmente conseguimos provar que cada real investido em prevenção economiza 7 reais em tratamento.",
    author: "Dra. Ana Lima",
    role: "Diretora Médica",
    featured: false,
  },
  {
    id: "empresa-esg",
    title: "ESG Corporativo com Métricas Reais",
    organization: "TechCorp Brasil",
    sector: "Corporativo",
    challenge:
      "Necessidade de reportar impacto social dos investimentos ESG com credibilidade para investidores e stakeholders.",
    solution:
      "Dashboard integrado de métricas ESG com certificação de impacto e relatórios automatizados.",
    results: [
      { metric: "Rating ESG", value: "A+", improvement: "De B para A+" },
      { metric: "Investimento ESG", value: "R$ 15M", improvement: "+400%" },
      { metric: "Projetos", value: "32", improvement: "+180%" },
    ],
    quote:
      "O IMPACT7 nos deu a credibilidade que precisávamos para atrair investidores focados em impacto.",
    author: "Roberto Mendes",
    role: "VP de Sustentabilidade",
    featured: false,
  },
  {
    id: "governo-municipal",
    title: "Políticas Públicas Baseadas em Evidências",
    organization: "Prefeitura de Inovação",
    sector: "Governo",
    challenge:
      "Falta de dados confiáveis para justificar investimentos em programas sociais e prestação de contas à população.",
    solution:
      "Sistema de monitoramento de impacto para todos os programas sociais municipais com transparência pública.",
    results: [
      { metric: "Programas monitorados", value: "47", improvement: "100%" },
      { metric: "Economia", value: "R$ 12M", improvement: "Anual" },
      { metric: "Aprovação popular", value: "78%", improvement: "+35%" },
    ],
    quote:
      "Agora tomamos decisões baseadas em dados reais de impacto, não em achismos políticos.",
    author: "Secretário João Silva",
    role: "Secretaria de Desenvolvimento Social",
    featured: true,
  },
];

const sectors = ["Todos", "Educação", "Meio Ambiente", "Saúde", "Corporativo", "Governo"];

const stats = [
  { icon: Building2, value: "150+", label: "Organizações" },
  { icon: Target, value: "R$ 2.1B", label: "Impacto Mensurado" },
  { icon: BarChart3, value: "4.5:1", label: "SROI Médio" },
  { icon: Users, value: "500K+", label: "Beneficiários" },
];

export default function CasosSucesso() {
  const [selectedSector, setSelectedSector] = useState("Todos");

  const filteredCases =
    selectedSector === "Todos"
      ? caseStudies
      : caseStudies.filter((c) => c.sector === selectedSector);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Casos de Sucesso</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Histórias de Impacto Real
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Veja como organizações estão transformando a mensuração de impacto
            com o IMPACT7
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 px-4">
        <div className="container">
          <div className="flex flex-wrap gap-2 justify-center">
            {sectors.map((sector) => (
              <Button
                key={sector}
                variant={selectedSector === sector ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSector(sector)}
              >
                {sector}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="py-8 px-4">
        <div className="container">
          <div className="space-y-8">
            {filteredCases.map((caseStudy) => (
              <Card
                key={caseStudy.id}
                className={caseStudy.featured ? "border-primary" : ""}
              >
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">{caseStudy.sector}</Badge>
                    {caseStudy.featured && <Badge>Destaque</Badge>}
                  </div>
                  <CardTitle className="text-2xl">{caseStudy.title}</CardTitle>
                  <p className="text-lg text-primary font-semibold">
                    {caseStudy.organization}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-red-500" />
                          Desafio
                        </h4>
                        <p className="text-muted-foreground">
                          {caseStudy.challenge}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-green-500" />
                          Solução
                        </h4>
                        <p className="text-muted-foreground">
                          {caseStudy.solution}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Resultados
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          {caseStudy.results.map((result, index) => (
                            <div
                              key={index}
                              className="text-center p-3 bg-muted/50 rounded-lg"
                            >
                              <p className="text-2xl font-bold text-primary">
                                {result.value}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {result.metric}
                              </p>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {result.improvement}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                          <Quote className="h-6 w-6 text-primary/50 mb-2" />
                          <p className="italic text-muted-foreground mb-3">
                            "{caseStudy.quote}"
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold">
                                {caseStudy.author[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold">{caseStudy.author}</p>
                              <p className="text-sm text-muted-foreground">
                                {caseStudy.role}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sua Organização Pode Ser o Próximo Caso de Sucesso
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Comece a mensurar seu impacto hoje e transforme seus resultados
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/demo">
                Agendar Demonstração
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/precos">Ver Planos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
