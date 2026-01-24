import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Quote,
  Star,
  Building2,
  Users,
  TrendingUp,
  Play,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  sector: string;
  content: string;
  rating: number;
  imageUrl?: string;
  videoUrl?: string;
  metrics?: string | { label: string; value: string }[];
  isFeatured?: boolean;
}

export default function Depoimentos() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Fetch testimonials from database
  const { data: testimonials = [], isLoading: loadingTestimonials } = trpc.socialProof.getTestimonials.useQuery({
    limit: 50,
  });

  // Fetch sectors from database
  const { data: sectors = [], isLoading: loadingSectors } = trpc.socialProof.getTestimonialSectors.useQuery();

  // Parse metrics if they're stored as JSON string
  const parseMetrics = (metrics: string | { label: string; value: string }[] | undefined): { label: string; value: string }[] => {
    if (!metrics) return [];
    if (typeof metrics === 'string') {
      try {
        return JSON.parse(metrics);
      } catch {
        return [];
      }
    }
    return metrics;
  };

  // Calculate stats from real data
  const stats = useMemo(() => {
    const uniqueCompanies = new Set(testimonials.map((t: Testimonial) => t.company)).size;
    const avgRating = testimonials.length > 0 
      ? (testimonials.reduce((acc: number, t: Testimonial) => acc + (t.rating || 5), 0) / testimonials.length).toFixed(1)
      : "5.0";
    
    return [
      { label: "Organizações Satisfeitas", value: `${uniqueCompanies}+`, icon: Building2 },
      { label: "Depoimentos Coletados", value: `${testimonials.length}+`, icon: Users },
      { label: "Avaliação Média", value: `${avgRating}/5`, icon: TrendingUp },
    ];
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    return selectedSector
      ? testimonials.filter((t: Testimonial) => t.sector === selectedSector)
      : testimonials;
  }, [testimonials, selectedSector]);

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
  const paginatedTestimonials = filteredTestimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loadingTestimonials) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando depoimentos...</p>
        </div>
      </div>
    );
  }

  // Fallback message if no testimonials
  if (testimonials.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4">Depoimentos</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                O que nossos <span className="text-primary">clientes</span> dizem
              </h1>
              <p className="text-xl text-muted-foreground">
                Em breve, compartilharemos histórias de sucesso de organizações que transformaram seu impacto social com o IMPACT7.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">Depoimentos</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              O que nossos <span className="text-primary">clientes</span> dizem
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Histórias reais de organizações que transformaram seu impacto social
              com o IMPACT7
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index}>
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      {sectors.length > 0 && (
        <section className="py-8 border-b">
          <div className="container">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedSector === null ? "default" : "outline"}
                onClick={() => {
                  setSelectedSector(null);
                  setCurrentPage(0);
                }}
              >
                Todos
              </Button>
              {sectors.map((sector: string) => (
                <Button
                  key={sector}
                  variant={selectedSector === sector ? "default" : "outline"}
                  onClick={() => {
                    setSelectedSector(sector);
                    setCurrentPage(0);
                  }}
                >
                  {sector}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTestimonials.map((testimonial: Testimonial) => {
              const metrics = parseMetrics(testimonial.metrics);
              return (
                <Card key={testimonial.id} className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {testimonial.imageUrl ? (
                          <img 
                            src={testimonial.imageUrl} 
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          testimonial.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                        <p className="text-sm text-primary">{testimonial.company}</p>
                      </div>
                      {testimonial.videoUrl && (
                        <Button size="icon" variant="outline" className="shrink-0">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    <Quote className="h-8 w-8 text-primary/20 mb-2" />
                    <p className="text-muted-foreground mb-4 line-clamp-4">
                      {testimonial.content}
                    </p>

                    {metrics.length > 0 && (
                      <div className="flex gap-4 pt-4 border-t">
                        {metrics.map((metric, i) => (
                          <div key={i}>
                            <p className="text-lg font-bold text-primary">
                              {metric.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {metric.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <Badge variant="secondary" className="mt-4">
                      {testimonial.sector}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-4">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para transformar seu impacto?
            </h2>
            <p className="text-muted-foreground mb-8">
              Junte-se às organizações que já estão mensurando e maximizando seu
              impacto social com o IMPACT7.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/calculadora">Calcular Impacto</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/contato">Falar com Especialista</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
