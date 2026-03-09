import { useState } from "react";
import { Link } from "wouter";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Calculator,
  FileText,
  Award,
  Bot,
  Users,
  BarChart3,
  Settings,
  Play,
  BookOpen,
  Lightbulb,
  Target,
  Rocket,
  ChevronRight,
  Video,
  Download,
  ExternalLink,
} from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
  completed?: boolean;
}

const onboardingSteps: Step[] = [
  {
    id: "profile",
    title: "Complete seu Perfil",
    description: "Adicione informações sobre você e sua organização para personalizar sua experiência.",
    icon: <Users className="h-6 w-6" />,
    link: "/profile",
    linkText: "Editar Perfil",
  },
  {
    id: "calculator",
    title: "Faça seu Primeiro Cálculo",
    description: "Use a calculadora de impacto para calcular o S-ROI do seu projeto social.",
    icon: <Calculator className="h-6 w-6" />,
    link: "/calculadora",
    linkText: "Abrir Calculadora",
  },
  {
    id: "case",
    title: "Submeta um Case",
    description: "Registre seu primeiro case de impacto para começar a construir seu portfólio.",
    icon: <FileText className="h-6 w-6" />,
    link: "/cases/submit",
    linkText: "Submeter Case",
  },
  {
    id: "jarvis",
    title: "Conheça o Jarvis",
    description: "Converse com nosso assistente de IA para tirar dúvidas sobre o método IMPACT7.",
    icon: <Bot className="h-6 w-6" />,
    link: "/jarvis",
    linkText: "Falar com Jarvis",
  },
  {
    id: "certificate",
    title: "Obtenha sua Certificação",
    description: "Após aprovação do case, receba seu certificado digital de impacto.",
    icon: <Award className="h-6 w-6" />,
    link: "/certificacoes",
    linkText: "Ver Certificações",
  },
];

const quickLinks = [
  {
    title: "Calculadora de Impacto",
    description: "Calcule o S-ROI dos seus projetos",
    icon: <Calculator className="h-5 w-5" />,
    link: "/calculadora",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Submeter Case",
    description: "Registre um novo case de impacto",
    icon: <FileText className="h-5 w-5" />,
    link: "/cases/submit",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Assistente Jarvis",
    description: "Tire dúvidas com IA",
    icon: <Bot className="h-5 w-5" />,
    link: "/jarvis",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Meus Tokens",
    description: "Veja seus tokens de impacto",
    icon: <Award className="h-5 w-5" />,
    link: "/tokens",
    color: "bg-orange-500/10 text-orange-500",
  },
];

const tutorials = [
  {
    title: "Como calcular o S-ROI",
    description: "Aprenda a usar a equação I = (E × C⁷) / R para mensurar impacto social.",
    duration: "5 min",
    type: "article",
    link: "/metodologia",
  },
  {
    title: "Submetendo seu primeiro case",
    description: "Guia passo a passo para registrar um case de impacto na plataforma.",
    duration: "8 min",
    type: "article",
    link: "/cases/submit",
  },
  {
    title: "Entendendo os 7 Coeficientes",
    description: "Conheça cada um dos coeficientes que compõem o Fator de Contexto.",
    duration: "10 min",
    type: "article",
    link: "/ciencia",
  },
  {
    title: "Obtendo sua certificação",
    description: "Saiba como obter e usar seu certificado digital de impacto.",
    duration: "4 min",
    type: "article",
    link: "/certificacoes",
  },
];

const faqs = [
  {
    question: "O que é o S-ROI?",
    answer: "S-ROI (Social Return on Investment) é uma métrica que quantifica o retorno social sobre o investimento. No Método IMPACT7, calculamos usando a equação I = (E × C⁷) / R, onde E é o efeito, C⁷ é o fator de contexto e R é a resistência.",
  },
  {
    question: "Como funciona a certificação?",
    answer: "Após submeter um case de impacto, nossa equipe analisa e valida as informações. Cases aprovados recebem um certificado digital com QR Code verificável, que pode ser compartilhado com stakeholders.",
  },
  {
    question: "O que são tokens de impacto?",
    answer: "Tokens de impacto são reconhecimentos digitais que você ganha ao usar a plataforma. Eles representam suas contribuições para o ecossistema de impacto social e podem ser exibidos no seu perfil.",
  },
  {
    question: "Posso usar a plataforma gratuitamente?",
    answer: "Sim! O plano Free permite usar a calculadora, submeter cases e acessar o assistente Jarvis. Planos pagos oferecem recursos adicionais como relatórios avançados e certificações ilimitadas.",
  },
];

export default function GuiaInicio() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  const progress = (completedSteps.length / onboardingSteps.length) * 100;
  
  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  return (
    <>
      <SEO
        title="Guia de Início"
        description="Aprenda a usar a Plataforma IMPACT7 e comece a mensurar o impacto social dos seus projetos."
        keywords="guia início, tutorial, onboarding, como usar, IMPACT7"
        url="https://impact7.com.br/guia-inicio"
      />
      <div className="min-h-screen bg-background">
        <MainNavbar />
        
        <main className="pt-20 pb-16">
          {/* Hero */}
          <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <Badge className="mb-4 bg-primary/10 text-primary">
                  <Rocket className="h-3 w-3 mr-1" />
                  Bem-vindo à Plataforma
                </Badge>
                <h1 className="text-4xl font-bold mb-4">
                  Guia de Início Rápido
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Siga os passos abaixo para começar a usar a Plataforma IMPACT7 
                  e transformar a forma como você mensura impacto social.
                </p>
                
                {/* Progress */}
                <div className="bg-card rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Seu progresso</span>
                    <span className="text-sm text-muted-foreground">
                      {completedSteps.length} de {onboardingSteps.length} passos
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="py-8 border-b">
            <div className="container">
              <div className="grid md:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                  <Link key={link.link} href={link.link}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${link.color}`}>
                            {link.icon}
                          </div>
                          <div>
                            <p className="font-medium">{link.title}</p>
                            <p className="text-sm text-muted-foreground">{link.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-12">
            <div className="container">
              <Tabs defaultValue="steps" className="space-y-8">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                  <TabsTrigger value="steps">Primeiros Passos</TabsTrigger>
                  <TabsTrigger value="tutorials">Tutoriais</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                {/* Steps Tab */}
                <TabsContent value="steps">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {onboardingSteps.map((step, index) => {
                      const isCompleted = completedSteps.includes(step.id);
                      
                      return (
                        <Card 
                          key={step.id}
                          className={`transition-all ${isCompleted ? "bg-primary/5 border-primary/20" : ""}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <button
                                onClick={() => toggleStep(step.id)}
                                className={`mt-1 flex-shrink-0 rounded-full p-1 transition-colors ${
                                  isCompleted 
                                    ? "bg-primary text-primary-foreground" 
                                    : "border-2 border-muted-foreground/30 hover:border-primary"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  <Circle className="h-5 w-5 text-transparent" />
                                )}
                              </button>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className={`p-2 rounded-lg ${isCompleted ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                                    {step.icon}
                                  </div>
                                  <div>
                                    <h3 className={`font-semibold ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                      Passo {index + 1}: {step.title}
                                    </h3>
                                  </div>
                                </div>
                                <p className="text-muted-foreground mb-4 ml-12">
                                  {step.description}
                                </p>
                                <div className="ml-12">
                                  <Link href={step.link}>
                                    <Button variant={isCompleted ? "outline" : "default"} size="sm">
                                      {step.linkText}
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Tutorials Tab */}
                <TabsContent value="tutorials">
                  <div className="max-w-3xl mx-auto">
                    <div className="grid gap-4">
                      {tutorials.map((tutorial) => (
                        <Link key={tutorial.title} href={tutorial.link}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                  <BookOpen className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{tutorial.title}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {tutorial.duration}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground">
                                    {tutorial.description}
                                  </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        Precisa de mais ajuda? Fale com nosso assistente de IA.
                      </p>
                      <Link href="/jarvis">
                        <Button>
                          <Bot className="h-4 w-4 mr-2" />
                          Conversar com Jarvis
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TabsContent>

                {/* FAQ Tab */}
                <TabsContent value="faq">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            {faq.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground ml-8">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="mt-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        Não encontrou o que procurava?
                      </p>
                      <div className="flex justify-center gap-4">
                        <Link href="/faq">
                          <Button variant="outline">
                            Ver todas as perguntas
                          </Button>
                        </Link>
                        <Link href="/suporte">
                          <Button>
                            Falar com Suporte
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* Resources */}
          <section className="py-12 bg-muted/30">
            <div className="container">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Recursos Adicionais</h2>
                <p className="text-muted-foreground">
                  Materiais para aprofundar seu conhecimento sobre impacto social
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-2">
                      <Download className="h-6 w-6 text-blue-500" />
                    </div>
                    <CardTitle>Whitepaper</CardTitle>
                    <CardDescription>
                      Documento técnico completo sobre o Método IMPACT7
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/whitepaper">
                      <Button variant="outline" className="w-full">
                        Baixar PDF
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="p-3 bg-green-500/10 rounded-lg w-fit mb-2">
                      <BookOpen className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle>Glossário</CardTitle>
                    <CardDescription>
                      Definições dos termos usados na plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/glossario">
                      <Button variant="outline" className="w-full">
                        Consultar
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-2">
                      <Target className="h-6 w-6 text-purple-500" />
                    </div>
                    <CardTitle>Metodologia</CardTitle>
                    <CardDescription>
                      Entenda a ciência por trás do IMPACT7
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/metodologia">
                      <Button variant="outline" className="w-full">
                        Explorar
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16">
            <div className="container">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Pronto para começar?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Faça seu primeiro cálculo de impacto e veja como é fácil 
                  mensurar o retorno social dos seus projetos.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/calculadora">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500">
                      <Calculator className="h-5 w-5 mr-2" />
                      Calcular Impacto
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline">
                      <Play className="h-5 w-5 mr-2" />
                      Ver Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
        <WhatsAppWidget />
      </div>
    </>
  );
}
