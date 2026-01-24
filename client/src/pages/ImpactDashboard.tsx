import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, TrendingUp, Users, DollarSign, Globe, 
  Target, Award, BarChart3, PieChart, MapPin,
  Calendar, Leaf, Building2, Heart, GraduationCap,
  Droplets, Zap, TreePine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dados agregados dos cases (simulados com base nos cases existentes)
const IMPACT_DATA = {
  totalProjects: 6,
  totalInvestment: 47500000, // R$ 47.5M
  totalBeneficiaries: 1875000,
  totalJobs: 12500,
  avgSROI: 4.83,
  totalSDGs: 12,
  regions: {
    "Sudeste": { projects: 2, investment: 15000000, beneficiaries: 650000 },
    "Nordeste": { projects: 2, investment: 12500000, beneficiaries: 825000 },
    "Sul": { projects: 1, investment: 10000000, beneficiaries: 250000 },
    "Centro-Oeste": { projects: 1, investment: 10000000, beneficiaries: 150000 },
  },
  sectors: {
    "Educação": { projects: 2, investment: 17500000, beneficiaries: 850000, icon: GraduationCap, color: "#3b82f6" },
    "Saúde": { projects: 1, investment: 8000000, beneficiaries: 500000, icon: Heart, color: "#ef4444" },
    "Meio Ambiente": { projects: 1, investment: 10000000, beneficiaries: 250000, icon: Leaf, color: "#22c55e" },
    "Infraestrutura": { projects: 1, investment: 7000000, beneficiaries: 150000, icon: Building2, color: "#f59e0b" },
    "Água e Saneamento": { projects: 1, investment: 5000000, beneficiaries: 125000, icon: Droplets, color: "#06b6d4" },
  },
  timeline: [
    { year: 2020, projects: 1, investment: 5000000, beneficiaries: 125000 },
    { year: 2021, projects: 2, investment: 12000000, beneficiaries: 350000 },
    { year: 2022, projects: 3, investment: 20000000, beneficiaries: 700000 },
    { year: 2023, projects: 4, investment: 32000000, beneficiaries: 1200000 },
    { year: 2024, projects: 6, investment: 47500000, beneficiaries: 1875000 },
  ],
  sdgs: [
    { number: 1, name: "Erradicação da Pobreza", count: 3 },
    { number: 3, name: "Saúde e Bem-Estar", count: 4 },
    { number: 4, name: "Educação de Qualidade", count: 5 },
    { number: 6, name: "Água Potável e Saneamento", count: 2 },
    { number: 7, name: "Energia Limpa e Acessível", count: 2 },
    { number: 8, name: "Trabalho Decente", count: 4 },
    { number: 10, name: "Redução das Desigualdades", count: 5 },
    { number: 11, name: "Cidades Sustentáveis", count: 3 },
    { number: 12, name: "Consumo Responsável", count: 2 },
    { number: 13, name: "Ação Contra Mudança Climática", count: 3 },
    { number: 15, name: "Vida Terrestre", count: 2 },
    { number: 17, name: "Parcerias e Meios de Implementação", count: 6 },
  ],
};

// Componente de contador animado
function AnimatedCounter({ 
  end, 
  duration = 2000, 
  prefix = "", 
  suffix = "",
  decimals = 0 
}: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  const formatted = decimals > 0 
    ? count.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : count.toLocaleString("pt-BR");
  
  return <span>{prefix}{formatted}{suffix}</span>;
}

// Formatar valor monetário
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`;
  }
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

export default function ImpactDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <Badge variant="outline" className="mb-2">Dashboard Público</Badge>
              <h1 className="text-4xl font-bold">Impacto em Números</h1>
              <p className="text-muted-foreground mt-2">
                Métricas agregadas de todos os projetos IMPACT7
              </p>
            </div>
          </div>
          
          {/* Main Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Projetos</p>
                    <p className="text-3xl font-bold">
                      <AnimatedCounter end={IMPACT_DATA.totalProjects} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Investimento Total</p>
                    <p className="text-3xl font-bold">
                      <AnimatedCounter end={47.5} prefix="R$ " suffix="M" decimals={1} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Beneficiários</p>
                    <p className="text-3xl font-bold">
                      <AnimatedCounter end={1.87} suffix="M" decimals={2} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">S-ROI Médio</p>
                    <p className="text-3xl font-bold">
                      <AnimatedCounter end={4.83} suffix="x" decimals={2} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Content Tabs */}
      <section className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sectors">Por Setor</TabsTrigger>
            <TabsTrigger value="regions">Por Região</TabsTrigger>
            <TabsTrigger value="sdgs">ODS</TabsTrigger>
            <TabsTrigger value="timeline">Evolução</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Impact Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Resumo do Impacto
                  </CardTitle>
                  <CardDescription>
                    Indicadores-chave de desempenho social
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Empregos Gerados</span>
                        <span className="text-sm text-muted-foreground">
                          {IMPACT_DATA.totalJobs.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">ODS Impactados</span>
                        <span className="text-sm text-muted-foreground">
                          {IMPACT_DATA.totalSDGs} de 17
                        </span>
                      </div>
                      <Progress value={(IMPACT_DATA.totalSDGs / 17) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Regiões Alcançadas</span>
                        <span className="text-sm text-muted-foreground">
                          {Object.keys(IMPACT_DATA.regions).length} de 5
                        </span>
                      </div>
                      <Progress value={(Object.keys(IMPACT_DATA.regions).length / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Setores Atendidos</span>
                        <span className="text-sm text-muted-foreground">
                          {Object.keys(IMPACT_DATA.sectors).length}
                        </span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Métricas de Eficiência
                  </CardTitle>
                  <CardDescription>
                    Indicadores de eficiência do investimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        R$ {Math.round(IMPACT_DATA.totalInvestment / IMPACT_DATA.totalBeneficiaries).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-sm text-muted-foreground">Custo por Beneficiário</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        R$ {Math.round(IMPACT_DATA.totalInvestment / IMPACT_DATA.totalJobs).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-sm text-muted-foreground">Custo por Emprego</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        {Math.round(IMPACT_DATA.totalBeneficiaries / IMPACT_DATA.totalProjects).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-sm text-muted-foreground">Beneficiários/Projeto</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(IMPACT_DATA.totalInvestment / IMPACT_DATA.totalProjects)}
                      </p>
                      <p className="text-sm text-muted-foreground">Investimento Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Sectors Tab */}
          <TabsContent value="sectors">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(IMPACT_DATA.sectors).map(([sector, data]) => {
                const Icon = data.icon;
                return (
                  <Card key={sector} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div 
                          className="p-3 rounded-full"
                          style={{ backgroundColor: data.color + "20" }}
                        >
                          <Icon className="w-6 h-6" style={{ color: data.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{sector}</h3>
                          <p className="text-sm text-muted-foreground">
                            {data.projects} projeto{data.projects > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Investimento</span>
                          <span className="font-medium">{formatCurrency(data.investment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Beneficiários</span>
                          <span className="font-medium">{data.beneficiaries.toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">% do Total</span>
                          <span className="font-medium">
                            {Math.round((data.investment / IMPACT_DATA.totalInvestment) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          {/* Regions Tab */}
          <TabsContent value="regions">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Distribuição Regional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(IMPACT_DATA.regions).map(([region, data]) => (
                      <div key={region} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{region}</span>
                          <span className="text-sm text-muted-foreground">
                            {data.projects} projeto{data.projects > 1 ? "s" : ""}
                          </span>
                        </div>
                        <Progress 
                          value={(data.investment / IMPACT_DATA.totalInvestment) * 100} 
                          className="h-3"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatCurrency(data.investment)}</span>
                          <span>{data.beneficiaries.toLocaleString("pt-BR")} beneficiários</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Alcance Geográfico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(IMPACT_DATA.regions).map(([region, data]) => (
                      <div key={region} className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">{region}</h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Projetos:</span>
                            <span>{data.projects}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Investimento:</span>
                            <span>{formatCurrency(data.investment)}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Beneficiários:</span>
                            <span>{(data.beneficiaries / 1000).toFixed(0)}K</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* SDGs Tab */}
          <TabsContent value="sdgs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Objetivos de Desenvolvimento Sustentável
                </CardTitle>
                <CardDescription>
                  ODS da ONU impactados pelos projetos IMPACT7
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {IMPACT_DATA.sdgs.map((sdg) => (
                    <div 
                      key={sdg.number}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {sdg.number}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sdg.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sdg.count} projeto{sdg.count > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Evolução ao Longo do Tempo
                </CardTitle>
                <CardDescription>
                  Crescimento acumulado dos projetos IMPACT7
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {IMPACT_DATA.timeline.map((year, index) => (
                    <div key={year.year} className="relative">
                      {index < IMPACT_DATA.timeline.length - 1 && (
                        <div className="absolute left-5 top-12 w-0.5 h-full bg-muted" />
                      )}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                          {year.year.toString().slice(-2)}
                        </div>
                        <div className="flex-1 pb-8">
                          <h4 className="font-semibold text-lg">{year.year}</h4>
                          <div className="grid sm:grid-cols-3 gap-4 mt-3">
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">Projetos</p>
                              <p className="text-xl font-bold">{year.projects}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">Investimento</p>
                              <p className="text-xl font-bold">{formatCurrency(year.investment)}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">Beneficiários</p>
                              <p className="text-xl font-bold">{(year.beneficiaries / 1000).toFixed(0)}K</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">Quer fazer parte dessa transformação?</h3>
              <p className="text-muted-foreground mb-6">
                Conheça o Método IMPACT7 e calcule o impacto do seu projeto social.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/calculadora">
                  <Button size="lg">
                    <Zap className="w-4 h-4 mr-2" />
                    Calcular Impacto
                  </Button>
                </Link>
                <Link href="/cases">
                  <Button variant="outline" size="lg">
                    <TreePine className="w-4 h-4 mr-2" />
                    Ver Cases
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
