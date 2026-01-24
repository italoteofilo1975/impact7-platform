import { Link } from "wouter";
import { Heart, ArrowLeft, Building, MapPin, Calendar, Download, Trash2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// Cases data (same as in Cases.tsx - in production would come from API)
const casesData: Record<number, {
  id: number;
  title: string;
  organization: string;
  location: string;
  sector: string;
  investment: string;
  beneficiaries: string;
  duration: string;
  sRoi: string;
  description: string;
}> = {
  1: {
    id: 1,
    title: "Programa de Capacitação Digital",
    organization: "Instituto Futuro Digital",
    location: "São Paulo, SP",
    sector: "Educação",
    investment: "R$ 2.5M",
    beneficiaries: "15.000",
    duration: "24 meses",
    sRoi: "12.4x",
    description: "Programa de formação em tecnologia para jovens de comunidades vulneráveis.",
  },
  2: {
    id: 2,
    title: "Rede de Microcrédito Solidário",
    organization: "Cooperativa Esperança",
    location: "Recife, PE",
    sector: "Microfinanças",
    investment: "R$ 5M",
    beneficiaries: "8.500",
    duration: "36 meses",
    sRoi: "9.7x",
    description: "Programa de microcrédito com acompanhamento técnico para empreendedores.",
  },
  3: {
    id: 3,
    title: "Saúde Preventiva Comunitária",
    organization: "Fundação Vida Saudável",
    location: "Belo Horizonte, MG",
    sector: "Saúde",
    investment: "R$ 3.8M",
    beneficiaries: "45.000",
    duration: "18 meses",
    sRoi: "15.2x",
    description: "Programa de prevenção de doenças crônicas através de agentes comunitários.",
  },
  4: {
    id: 4,
    title: "Agricultura Familiar Sustentável",
    organization: "Associação Terra Viva",
    location: "Chapecó, SC",
    sector: "Agricultura",
    investment: "R$ 1.8M",
    beneficiaries: "1.200",
    duration: "30 meses",
    sRoi: "8.3x",
    description: "Programa de transição para agricultura orgânica com assistência técnica.",
  },
  5: {
    id: 5,
    title: "Moradia Social Integrada",
    organization: "Habitat Brasil",
    location: "Salvador, BA",
    sector: "Habitação",
    investment: "R$ 8.5M",
    beneficiaries: "2.800",
    duration: "48 meses",
    sRoi: "11.6x",
    description: "Programa de urbanização de favelas com construção de moradias.",
  },
  6: {
    id: 6,
    title: "Inclusão Digital para Idosos",
    organization: "Instituto Longevidade",
    location: "Porto Alegre, RS",
    sector: "Educação",
    investment: "R$ 800K",
    beneficiaries: "5.200",
    duration: "12 meses",
    sRoi: "7.8x",
    description: "Programa de alfabetização digital para idosos com foco em autonomia.",
  },
};

export default function Favorites() {
  const { user, loading, isAuthenticated } = useAuth();
  
  const { data: favorites, isLoading, refetch } = trpc.cases.getFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeFavoriteMutation = trpc.cases.removeFavorite.useMutation({
    onSuccess: () => {
      toast.success('Case removido dos favoritos');
      refetch();
    },
    onError: () => {
      toast.error('Erro ao remover favorito');
    },
  });

  const handleRemoveFavorite = (caseId: number) => {
    removeFavoriteMutation.mutate({ caseId });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <div className="pt-32 container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Faça login para ver seus favoritos</h2>
              <p className="text-muted-foreground mb-6">
                Salve cases de interesse para consultar depois.
              </p>
              <a href={getLoginUrl()}>
                <Button className="w-full">Fazer Login</Button>
              </a>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const favoriteCases = favorites?.map(f => casesData[f.caseId]).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/cases">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Meus Favoritos
              </h1>
              <p className="text-muted-foreground">
                {favoriteCases.length} {favoriteCases.length === 1 ? 'case salvo' : 'cases salvos'}
              </p>
            </div>
          </div>

          {favoriteCases.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Nenhum favorito ainda</h2>
                <p className="text-muted-foreground mb-6">
                  Explore os cases e salve os que mais interessam você.
                </p>
                <Link href="/cases">
                  <Button>Ver Cases</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteCases.map((caseStudy) => (
                <Card key={caseStudy.id} className="card-hover overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">{caseStudy.sector}</Badge>
                      <Badge className="bg-primary/10 text-primary border-0">
                        S-ROI: {caseStudy.sRoi}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2">{caseStudy.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {caseStudy.description}
                    </p>
                    
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {caseStudy.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {caseStudy.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {caseStudy.duration}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">Investimento</div>
                        <div className="font-semibold text-sm">{caseStudy.investment}</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">Beneficiários</div>
                        <div className="font-semibold text-sm">{caseStudy.beneficiaries}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t">
                      <Link href="/cases" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Ver Detalhes
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFavorite(caseStudy.id)}
                        disabled={removeFavoriteMutation.isPending}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
