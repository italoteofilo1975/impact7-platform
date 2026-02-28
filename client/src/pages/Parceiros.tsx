import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Globe,
  Award,
  ArrowRight,
  CheckCircle,
  Quote,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

interface Partner {
  id: number;
  name: string;
  category?: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  displayOrder?: number;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
}

export default function Parceiros() {
  // Fetch partners from database
  const { data: partnersRaw, isLoading: loadingPartners } = trpc.socialProof.getPartners.useQuery();
  const partners: Partner[] = (partnersRaw as Partner[] | undefined) ?? [];

  // Fetch featured testimonials from database
  const { data: testimonialsRaw, isLoading: loadingTestimonials } = trpc.socialProof.getTestimonials.useQuery({ featured: true, limit: 3 });
  const testimonials: Testimonial[] = (testimonialsRaw as Testimonial[] | undefined) ?? [];

  // Calculate stats from real data
  const stats = useMemo(() => {
    const categories = new Set(partners.map((p: Partner) => p.category).filter(Boolean));
    return [
      { icon: Building2, value: `${partners.length}+`, label: "Parceiros Ativos" },
      { icon: Globe, value: `${categories.size}+`, label: "Setores" },
      { icon: Users, value: "50K+", label: "Beneficiários Indiretos" },
      { icon: Award, value: "100%", label: "Satisfação" },
    ];
  }, [partners]);

  const benefits = [
    "Acesso prioritário a novas funcionalidades",
    "Suporte técnico dedicado",
    "Co-criação de metodologias",
    "Visibilidade em nossa rede",
    "Participação em eventos exclusivos",
    "Certificação de parceiro IMPACT7",
  ];

  if (loadingPartners) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando parceiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              Ecossistema de Impacto
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Nossos <span className="text-primary">Parceiros</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Juntos, estamos construindo um ecossistema de organizações
              comprometidas com a mensuração e maximização do impacto social.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Organizações que confiam no IMPACT7
          </h2>

          {partners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Em breve, apresentaremos nossos parceiros estratégicos.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner: Partner) => (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                        {partner.logoUrl ? (
                          <img 
                            src={partner.logoUrl} 
                            alt={partner.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{partner.name}</h3>
                          {partner.website && (
                            <a 
                              href={partner.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {partner.category && (
                          <Badge variant="secondary" className="mt-1">
                            {partner.category}
                          </Badge>
                        )}
                        {partner.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {partner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              O que dizem nossos parceiros
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial: Testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="pt-6">
                    <Quote className="h-8 w-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground mb-4 line-clamp-4">
                      "{testimonial.content}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                      <p className="text-sm text-primary">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Programa de Parceria
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Benefícios de ser um parceiro IMPACT7
              </h2>
              <p className="text-muted-foreground mb-8">
                Nosso programa de parceria oferece vantagens exclusivas para
                organizações comprometidas com a mensuração de impacto social.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Torne-se um parceiro
                </h3>
                <p className="mb-6 opacity-90">
                  Junte-se ao ecossistema de organizações que estão
                  transformando a forma como medimos e maximizamos o impacto
                  social.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <a href="/contato">
                    Fale Conosco <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para fazer parte do ecossistema?
            </h2>
            <p className="text-muted-foreground mb-8">
              Entre em contato para saber mais sobre nosso programa de parceria
              e como podemos colaborar.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild>
                <a href="/contato">Solicitar Parceria</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/sobre">Conhecer o IMPACT7</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
