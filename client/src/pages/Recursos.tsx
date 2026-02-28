import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  BookOpen,
  Search,
  Filter,
  Star,
  Eye,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";

// Normalize a whitepaper/ebook from DB to UI format
function normalizeResource(item: any, type: "whitepaper" | "ebook") {
  return {
    id: item.id as number,
    title: item.title as string,
    description: item.description as string,
    type,
    category: (item.category as string) || "Geral",
    downloads: (item.downloadCount as number) || 0,
    tags: Array.isArray(item.tags) ? item.tags : [],
    fileUrl: item.fileUrl as string,
  };
}

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    metodologia: "Metodologia",
    investimento: "Investimento",
    ciencia: "Ciência",
    guia: "Guia",
    tutorial: "Tutorial",
    templates: "Templates",
    inovacao: "Inovação",
    dados: "Dados",
  };
  return map[category.toLowerCase()] || category;
};

export default function Recursos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "whitepaper" | "ebook">("all");

  // Fetch real data from database
  const { data: whitepapers, isLoading: wpLoading } = trpc.downloads.getWhitepapers.useQuery();
  const { data: ebooks, isLoading: ebLoading } = trpc.downloads.getEbooks.useQuery();

  const isLoading = wpLoading || ebLoading;

  // Combine and normalize all resources
  const allResources = useMemo(() => {
    const wp = (whitepapers || []).map(w => normalizeResource(w, "whitepaper"));
    const eb = (ebooks || []).map(e => normalizeResource(e, "ebook"));
    return [...wp, ...eb].sort((a, b) => b.downloads - a.downloads);
  }, [whitepapers, ebooks]);

  // Filter resources
  const filteredResources = useMemo(() => {
    return allResources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || resource.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [allResources, searchTerm, selectedType]);

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
          <div className="container max-w-4xl text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Download className="h-12 w-12 text-primary" />
              </div>
            </div>
            <Badge className="mb-4">Recursos</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Biblioteca de Recursos
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Whitepapers e e-books para potencializar seu trabalho com impacto social
            </p>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 px-4 border-b">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar recursos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={selectedType === "whitepaper" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("whitepaper")}
                >
                  Whitepapers
                </Button>
                <Button
                  variant={selectedType === "ebook" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("ebook")}
                >
                  E-books
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-16 px-4">
          <div className="container">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Carregando recursos...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <p className="text-muted-foreground">
                    {filteredResources.length} {filteredResources.length === 1 ? "recurso encontrado" : "recursos encontrados"}
                  </p>
                </div>
                {filteredResources.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum recurso encontrado</h3>
                    <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                      <Card key={`${resource.type}-${resource.id}`} className="hover:shadow-lg transition-shadow flex flex-col">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="p-2 rounded-lg bg-muted">
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {resource.type === "whitepaper" ? "Whitepaper" : "E-book"}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="mt-4 text-base leading-snug">{resource.title}</CardTitle>
                          <CardDescription className="line-clamp-3">{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Download className="h-4 w-4" />
                                {resource.downloads.toLocaleString('pt-BR')} downloads
                              </span>
                              <Badge variant="secondary">{getCategoryLabel(resource.category)}</Badge>
                            </div>
                            {resource.type === "whitepaper" ? (
                              <Link href="/whitepaper">
                                <Button className="w-full">
                                  <Download className="mr-2 h-4 w-4" />
                                  Baixar Whitepaper
                                </Button>
                              </Link>
                            ) : (
                              <Link href="/ebook">
                                <Button className="w-full">
                                  <Download className="mr-2 h-4 w-4" />
                                  Baixar E-book
                                </Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Quer Receber Novos Recursos?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Inscreva-se na nossa newsletter e receba whitepapers e e-books exclusivos
            </p>
            <Link href="/whitepaper">
              <Button size="lg" variant="secondary">
                <Download className="mr-2 h-5 w-5" />
                Acessar Biblioteca Completa
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
