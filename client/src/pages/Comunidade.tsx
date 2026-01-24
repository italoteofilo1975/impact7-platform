import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageCircle,
  Award,
  TrendingUp,
  Heart,
  Globe,
  Linkedin,
  ExternalLink,
  Star,
  Trophy,
} from "lucide-react";

const communityStats = [
  { label: "Membros Ativos", value: "5.000+", icon: Users },
  { label: "Projetos Compartilhados", value: "1.200+", icon: TrendingUp },
  { label: "Discussões", value: "8.500+", icon: MessageCircle },
  { label: "Países", value: "25+", icon: Globe },
];

const topContributors = [
  { name: "Maria Silva", role: "Consultora de Impacto", contributions: 156, badges: 12 },
  { name: "João Santos", role: "Analista de Dados", contributions: 134, badges: 10 },
  { name: "Ana Costa", role: "Gestora de Projetos", contributions: 98, badges: 8 },
  { name: "Pedro Lima", role: "Especialista ESG", contributions: 87, badges: 7 },
  { name: "Carla Oliveira", role: "Fundadora ONG", contributions: 76, badges: 6 },
];

const featuredDiscussions = [
  {
    title: "Como calcular SROI para projetos de educação?",
    author: "Maria Silva",
    replies: 45,
    views: 1234,
    tags: ["SROI", "Educação", "Metodologia"],
  },
  {
    title: "Melhores práticas para coleta de dados de impacto",
    author: "João Santos",
    replies: 32,
    views: 987,
    tags: ["Dados", "Coleta", "Best Practices"],
  },
  {
    title: "Tokenização de impacto: experiências reais",
    author: "Pedro Lima",
    replies: 28,
    views: 856,
    tags: ["Tokens", "Blockchain", "Cases"],
  },
];

const communityBenefits = [
  {
    icon: MessageCircle,
    title: "Fórum de Discussões",
    description: "Troque experiências e tire dúvidas com outros profissionais",
  },
  {
    icon: Award,
    title: "Certificações",
    description: "Ganhe badges e certificados por suas contribuições",
  },
  {
    icon: Users,
    title: "Networking",
    description: "Conecte-se com especialistas de todo o Brasil",
  },
  {
    icon: Star,
    title: "Conteúdo Exclusivo",
    description: "Acesso a webinars, templates e recursos premium",
  },
];

export default function Comunidade() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>
          <Badge className="mb-4">Comunidade</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Junte-se à Maior Comunidade de Impacto Social
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Conecte-se com milhares de profissionais, compartilhe conhecimento e
            amplifique seu impacto
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg">
              <Users className="mr-2 h-4 w-4" />
              Entrar na Comunidade
            </Button>
            <Button variant="outline" size="lg">
              <Linkedin className="mr-2 h-4 w-4" />
              Grupo LinkedIn
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {communityStats.map((stat, index) => (
              <div key={index}>
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por Que Participar?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityBenefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Discussions */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Discussões em Destaque</h2>
            <Button variant="outline">
              Ver Todas
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {featuredDiscussions.map((discussion, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                        {discussion.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Por {discussion.author}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {discussion.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{discussion.replies} respostas</p>
                      <p>{discussion.views} visualizações</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Top Contribuidores</h2>
            <Button variant="outline">
              Ver Ranking Completo
              <Trophy className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topContributors.map((contributor, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">
                          {contributor.name.charAt(0)}
                        </span>
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{contributor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {contributor.role}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          {contributor.contributions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          {contributor.badges}
                        </span>
                      </div>
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
            Pronto para Fazer Parte?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Junte-se a milhares de profissionais comprometidos com o impacto
            social. É gratuito!
          </p>
          <Button size="lg" variant="secondary">
            <Users className="mr-2 h-4 w-4" />
            Criar Conta Gratuita
          </Button>
        </div>
      </section>
    </div>
  );
}
