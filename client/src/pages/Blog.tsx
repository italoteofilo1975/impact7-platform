import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Tag,
} from "lucide-react";

const articles = [
  {
    id: 1,
    slug: "como-medir-impacto-social",
    title: "Como Medir o Impacto Social: Um Guia Completo",
    excerpt:
      "Aprenda os fundamentos da mensuração de impacto social e como aplicar métricas eficazes em seus projetos.",
    category: "Metodologia",
    author: "Dr. João Silva",
    date: "2025-01-10",
    readTime: "8 min",
    featured: true,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
  },
  {
    id: 2,
    slug: "7-capitais-impacto",
    title: "Os 7 Capitais do Impacto: Entendendo o C⁷",
    excerpt:
      "Descubra como os 7 capitais (Humano, Social, Intelectual, Financeiro, Manufaturado, Natural e Cultural) compõem o impacto holístico.",
    category: "Ciência",
    author: "Dra. Maria Santos",
    date: "2025-01-08",
    readTime: "12 min",
    featured: true,
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
  },
  {
    id: 3,
    slug: "sroi-retorno-social",
    title: "S-ROI: Calculando o Retorno Social sobre Investimento",
    excerpt:
      "Entenda como calcular e interpretar o S-ROI para demonstrar o valor real do seu projeto de impacto.",
    category: "Finanças",
    author: "Carlos Mendes",
    date: "2025-01-05",
    readTime: "10 min",
    featured: false,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
  },
  {
    id: 4,
    slug: "ods-alinhamento-projetos",
    title: "Alinhando Projetos aos ODS da ONU",
    excerpt:
      "Como conectar suas iniciativas aos 17 Objetivos de Desenvolvimento Sustentável e maximizar seu impacto global.",
    category: "Sustentabilidade",
    author: "Ana Costa",
    date: "2025-01-03",
    readTime: "7 min",
    featured: false,
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800",
  },
  {
    id: 5,
    slug: "ia-impacto-social",
    title: "Inteligência Artificial no Setor de Impacto Social",
    excerpt:
      "Como a IA está revolucionando a forma como medimos, analisamos e maximizamos o impacto social.",
    category: "Tecnologia",
    author: "Pedro Lima",
    date: "2024-12-28",
    readTime: "9 min",
    featured: false,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
  },
  {
    id: 6,
    slug: "cases-sucesso-brasil",
    title: "Cases de Sucesso: Impacto Social no Brasil",
    excerpt:
      "Conheça projetos brasileiros que estão transformando comunidades e gerando resultados mensuráveis.",
    category: "Cases",
    author: "Fernanda Oliveira",
    date: "2024-12-20",
    readTime: "15 min",
    featured: false,
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800",
  },
];

const categories = ["Todos", "Metodologia", "Ciência", "Finanças", "Sustentabilidade", "Tecnologia", "Cases"];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = articles.filter((a) => a.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Blog IMPACT7</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Insights sobre Impacto Social
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Artigos, guias e análises sobre mensuração de impacto, sustentabilidade
            e inovação social
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4 px-4 border-y bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {selectedCategory === "Todos" && searchTerm === "" && (
        <section className="py-12 px-4">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Artigos em Destaque</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden group">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{article.category}</Badge>
                      <Badge variant="outline">Destaque</Badge>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{article.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readTime}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ler mais
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-12 px-4">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">
            {selectedCategory === "Todos" ? "Todos os Artigos" : selectedCategory}
            <span className="text-muted-foreground font-normal ml-2">
              ({filteredArticles.length})
            </span>
          </h2>

          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente buscar com outros termos ou selecione outra categoria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="group">
                  <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">
            Receba Novos Artigos por Email
          </h2>
          <p className="opacity-90 mb-6">
            Inscreva-se na nossa newsletter e receba conteúdo exclusivo sobre
            impacto social diretamente no seu email
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="seu@email.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button variant="secondary">Inscrever</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
