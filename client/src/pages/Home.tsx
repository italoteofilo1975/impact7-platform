import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight, Download, Calculator, Users, TrendingUp, Brain, Cpu, BarChart3, Target, Zap, Shield, Star, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { SocialProofSection } from "@/components/SocialProof";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <>
      <SEO
        title={t("home.seo.title", "Inovação Social Exponencial")}
        description={t("home.seo.description", "Transforme seu impacto social com ciência cognitiva, modelagem matemática e engenharia de software.")}
        keywords="impacto social, SROI, retorno social, inovação social, mensuração de impacto, ODS, ESG, investimento social"
        url="https://impact7.com.br"
      />
      <HomeContent />
    </>
  );
}

function HomeContent() {
  const { t } = useTranslation();
  
  const modules = [
    { number: 1, title: t("home.modules.module1", "Diagnóstico"), description: t("home.modules.desc1", "Análise profunda do contexto e identificação de oportunidades") },
    { number: 2, title: t("home.modules.module2", "Estratégia"), description: t("home.modules.desc2", "Definição de objetivos e métricas de impacto") },
    { number: 3, title: t("home.modules.module3", "Design"), description: t("home.modules.desc3", "Modelagem de intervenções baseadas em evidências") },
    { number: 4, title: t("home.modules.module4", "Implementação"), description: t("home.modules.desc4", "Execução com metodologia ágil e adaptativa") },
    { number: 5, title: t("home.modules.module5", "Monitoramento"), description: t("home.modules.desc5", "Coleta e análise de dados de impacto") },
    { number: 6, title: t("home.modules.module6", "Avaliação"), description: t("home.modules.desc6", "Ajustes contínuos baseados em resultados") },
    { number: 7, title: t("home.modules.module7", "Escala"), description: t("home.modules.desc7", "Replicação e ampliação do impacto") },
  ];

  // Fetch testimonials from database
  const { data: testimonials = [], isLoading: loadingTestimonials } = trpc.socialProof.getTestimonials.useQuery({
    featured: true,
    limit: 3,
  });

  // Stats are now fetched via SocialProofSection component

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Links */}
      <a href="#main-content" className="skip-link">{t("accessibility.skipToContent", "Pular para o conteúdo principal")}</a>
      <a href="#navigation" className="skip-link">{t("accessibility.skipToNav", "Pular para a navegação")}</a>
      
      <MainNavbar />
      
      <main id="main-content" className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center gradient-hero text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm">{t("home.hero.badge", "Inovação Social Exponencial")}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                {t("home.hero.title", "Transforme seu")}{" "}
                <span className="gradient-text">{t("home.hero.titleHighlight", "Impacto Social")}</span>{" "}
                {t("home.hero.titleEnd", "com Ciência")}
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                {t("home.hero.subtitle", "O Método IMPACT7 combina Ciência Cognitiva, Modelagem Matemática e Engenharia de Software para maximizar o retorno sobre investimento social.")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/calculadora">
                  <Button size="lg" className="gradient-orange text-white border-0 text-lg px-8">
                    <Calculator className="w-5 h-5 mr-2" />
                    {t("home.hero.cta1", "Calcular Impacto")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/whitepaper">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8">
                    <Download className="w-5 h-5 mr-2" />
                    {t("home.hero.cta2", "Baixar Whitepaper")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Stats Section - Now handled by SocialProofSection */}

        {/* Equation Section */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.equation.title", "A Equação do Impacto")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("home.equation.subtitle", "Uma fórmula matemática que quantifica o potencial de transformação social")}
              </p>
            </div>
            
            <div className="equation-card max-w-3xl mx-auto text-center">
              <div className="equation mb-8">
                <span className="text-primary">I</span> = (<span className="text-primary">E</span> × <span className="text-primary">C</span><sup>7</sup>) / <span className="text-primary">R</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">I</div>
                  <div className="text-sm text-muted-foreground">{t("home.equation.impact", "Impacto")}</div>
                  <div className="text-xs text-muted-foreground/70">{t("home.equation.impactDesc", "Resultado mensurável")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">E</div>
                  <div className="text-sm text-muted-foreground">{t("home.equation.energy", "Energia")}</div>
                  <div className="text-xs text-muted-foreground/70">{t("home.equation.energyDesc", "Investimento total")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">C<sup>7</sup></div>
                  <div className="text-sm text-muted-foreground">{t("home.equation.context", "Contexto")}</div>
                  <div className="text-xs text-muted-foreground/70">{t("home.equation.contextDesc", "7 dimensões de alinhamento")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">R</div>
                  <div className="text-sm text-muted-foreground">{t("home.equation.resistance", "Resistência")}</div>
                  <div className="text-xs text-muted-foreground/70">{t("home.equation.resistanceDesc", "Barreiras e fricções")}</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link href="/matematica">
                <Button variant="outline">
                  {t("home.equation.cta", "Entender a Matemática")}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Framework Section */}
        <section className="section-padding bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.framework.title", "Framework Tecnológico")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("home.framework.subtitle", "Uma arquitetura completa para maximizar o impacto social")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-hover">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg gradient-orange flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">7R</h3>
                  <p className="text-sm text-muted-foreground">{t("home.framework.7r", "7 Recursos Estratégicos")}</p>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg gradient-orange flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">7V</h3>
                  <p className="text-sm text-muted-foreground">{t("home.framework.7v", "7 Vetores de Valor")}</p>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg gradient-orange flex items-center justify-center mx-auto mb-4">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">77T</h3>
                  <p className="text-sm text-muted-foreground">{t("home.framework.77t", "77 Técnicas Aplicadas")}</p>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg gradient-orange flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Context Lake</h3>
                  <p className="text-sm text-muted-foreground">{t("home.framework.contextLake", "Base de Conhecimento IA")}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-8">
              <Link href="/tecnologia">
                <Button variant="outline">
                  {t("home.framework.cta", "Explorar Tecnologia")}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 7 Modules Section */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.modules.title", "Os 7 Módulos")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("home.modules.subtitle", "Um framework estruturado para maximizar o impacto social")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.slice(0, 4).map((module) => (
                <Card key={module.number} className="card-hover">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center mb-4">
                      <span className="text-white font-bold">{module.number}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {modules.slice(4).map((module) => (
                <Card key={module.number} className="card-hover">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center mb-4">
                      <span className="text-white font-bold">{module.number}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding gradient-hero text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.cta.title", "Pronto para Maximizar seu Impacto?")}</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {t("home.cta.subtitle", "Comece agora a calcular o potencial de transformação do seu projeto social")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculadora">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8">
                  <Calculator className="w-5 h-5 mr-2" />
                  {t("home.cta.button1", "Calcular Impacto Agora")}
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8">
                  {t("home.cta.button2", "Falar com Especialista")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section-padding bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.testimonials.title", "Depoimentos")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("home.testimonials.subtitle", "O que nossos parceiros dizem")}
              </p>
            </div>
            
            {loadingTestimonials ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-24 mb-4" />
                      <Skeleton className="h-20 w-full mb-4" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : testimonials.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial: any, index: number) => (
                  <Card key={index} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Em breve, depoimentos de nossos parceiros.</p>
            )}
          </div>
        </section>

        {/* Social Proof Section */}
        <SocialProofSection />
      </main>
      
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
