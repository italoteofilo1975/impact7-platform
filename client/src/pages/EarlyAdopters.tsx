import { Link } from "wouter";
import { 
  Rocket, 
  Gift, 
  Users, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const benefits = [
  {
    icon: Gift,
    title: "50% de Desconto Vitalício",
    description: "Garanta metade do preço em qualquer plano para sempre",
  },
  {
    icon: Star,
    title: "Acesso Antecipado",
    description: "Seja o primeiro a testar novas funcionalidades",
  },
  {
    icon: Users,
    title: "Comunidade Exclusiva",
    description: "Acesso ao grupo VIP de inovadores sociais",
  },
  {
    icon: Shield,
    title: "Suporte Prioritário",
    description: "Atendimento direto com a equipe fundadora",
  },
  {
    icon: Zap,
    title: "Influência no Produto",
    description: "Suas sugestões moldam o futuro da plataforma",
  },
  {
    icon: Sparkles,
    title: "Badge de Fundador",
    description: "Reconhecimento permanente como early adopter",
  },
];

const timeline = [
  {
    phase: "Fase 1",
    title: "Primeiros 100",
    spots: 100,
    discount: "50%",
    status: "active",
    remaining: 73,
  },
  {
    phase: "Fase 2",
    title: "Próximos 500",
    spots: 500,
    discount: "30%",
    status: "upcoming",
    remaining: 500,
  },
  {
    phase: "Fase 3",
    title: "Lançamento Público",
    spots: "Ilimitado",
    discount: "0%",
    status: "upcoming",
    remaining: null,
  },
];

const testimonials = [
  {
    name: "Carlos Mendes",
    role: "Diretor de Impacto",
    org: "Instituto Renovar",
    text: "Entrar como early adopter foi a melhor decisão. O desconto vitalício já se pagou várias vezes.",
    badge: "Early Adopter #12",
  },
  {
    name: "Fernanda Lima",
    role: "Coordenadora",
    org: "ONG Esperança",
    text: "A comunidade de early adopters é incrível. Aprendo muito com outros inovadores sociais.",
    badge: "Early Adopter #45",
  },
];

export default function EarlyAdopters() {
  return (
    <>
      <SEO
        title="Programa Early Adopters | IMPACT7"
        description="Seja um dos primeiros a transformar o impacto social com o Método IMPACT7. Garanta 50% de desconto vitalício e benefícios exclusivos."
        keywords="early adopter, desconto, inovação social, programa fundadores"
      />
      <div className="min-h-screen bg-background">
        <MainNavbar />
        
        <main className="pt-16">
          {/* Hero Section */}
          <section className="relative py-20 gradient-hero text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  <Rocket className="w-3 h-3 mr-1" />
                  Vagas Limitadas
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Programa{" "}
                  <span className="gradient-text">Early Adopters</span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 mb-8">
                  Seja um dos primeiros 100 inovadores sociais a adotar o Método IMPACT7 
                  e garanta benefícios exclusivos para sempre.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/precos">
                    <Button size="lg" className="gradient-orange text-white border-0">
                      Garantir Minha Vaga
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-white/60">
                  <Clock className="w-4 h-4" />
                  <span>Apenas 73 vagas restantes na Fase 1</span>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Benefícios Exclusivos
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Como early adopter, você terá acesso a vantagens que nunca mais serão oferecidas
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="card-hover">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg gradient-orange flex items-center justify-center mb-4">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Fases do Programa
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Quanto mais cedo você entrar, maior o desconto
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6">
                  {timeline.map((phase, index) => (
                    <Card 
                      key={index} 
                      className={`relative overflow-hidden ${
                        phase.status === "active" ? "border-primary" : ""
                      }`}
                    >
                      {phase.status === "active" && (
                        <div className="absolute top-0 left-0 right-0 h-1 gradient-orange" />
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant={phase.status === "active" ? "default" : "secondary"}>
                            {phase.phase}
                          </Badge>
                          {phase.status === "active" && (
                            <Badge variant="outline" className="text-green-500 border-green-500">
                              Ativo
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{phase.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="text-3xl font-bold text-primary">
                              {phase.discount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              de desconto vitalício
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{phase.spots}</span> vagas
                            {phase.remaining !== null && (
                              <span className="text-muted-foreground">
                                {" "}• {phase.remaining} restantes
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  O Que Dizem Nossos Early Adopters
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="card-hover">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-4 text-primary border-primary">
                        {testimonial.badge}
                      </Badge>
                      <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.role}, {testimonial.org}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 gradient-hero text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Não Perca Esta Oportunidade
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                As vagas da Fase 1 estão acabando. Garanta seu desconto de 50% vitalício agora.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/precos">
                  <Button size="lg" className="gradient-orange text-white border-0">
                    <Rocket className="w-5 h-5 mr-2" />
                    Quero Ser Early Adopter
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Desconto vitalício
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Cancele quando quiser
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Suporte prioritário
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
