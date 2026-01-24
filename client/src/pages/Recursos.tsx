import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  BookOpen,
  Video,
  FileSpreadsheet,
  Presentation,
  Search,
  Filter,
  Star,
  Eye,
} from "lucide-react";
import { useState } from "react";

interface Resource {
  id: number;
  title: string;
  description: string;
  type: "template" | "guide" | "video" | "spreadsheet" | "presentation" | "ebook";
  category: string;
  downloads: number;
  rating: number;
  isPremium: boolean;
}

const resources: Resource[] = [
  {
    id: 1,
    title: "Template de Cálculo SROI",
    description: "Planilha completa para calcular o Retorno Social sobre Investimento",
    type: "spreadsheet",
    category: "Metodologia",
    downloads: 2456,
    rating: 4.8,
    isPremium: false,
  },
  {
    id: 2,
    title: "Guia Completo de Impacto Social",
    description: "Manual de 50 páginas sobre mensuração de impacto",
    type: "guide",
    category: "Metodologia",
    downloads: 1823,
    rating: 4.9,
    isPremium: false,
  },
  {
    id: 3,
    title: "Apresentação Executiva IMPACT7",
    description: "Slides prontos para apresentar o método para stakeholders",
    type: "presentation",
    category: "Comunicação",
    downloads: 987,
    rating: 4.7,
    isPremium: true,
  },
  {
    id: 4,
    title: "E-book: Tokens de Impacto",
    description: "Guia sobre tokenização e gamificação de impacto social",
    type: "ebook",
    category: "Inovação",
    downloads: 654,
    rating: 4.6,
    isPremium: true,
  },
  {
    id: 5,
    title: "Vídeo: Introdução ao SROI",
    description: "Curso em vídeo de 2 horas sobre cálculo de SROI",
    type: "video",
    category: "Metodologia",
    downloads: 1234,
    rating: 4.9,
    isPremium: false,
  },
  {
    id: 6,
    title: "Template de Relatório de Impacto",
    description: "Modelo editável para relatórios de impacto social",
    type: "template",
    category: "Relatórios",
    downloads: 1567,
    rating: 4.8,
    isPremium: false,
  },
  {
    id: 7,
    title: "Checklist de Coleta de Dados",
    description: "Lista de verificação para garantir qualidade dos dados",
    type: "template",
    category: "Dados",
    downloads: 876,
    rating: 4.5,
    isPremium: false,
  },
  {
    id: 8,
    title: "Planilha de Indicadores ODS",
    description: "Mapeamento de indicadores para os 17 ODS",
    type: "spreadsheet",
    category: "ODS",
    downloads: 1098,
    rating: 4.7,
    isPremium: true,
  },
];

const categories = Array.from(new Set(resources.map((r) => r.category)));

const getTypeIcon = (type: string) => {
  switch (type) {
    case "template":
      return <FileText className="h-6 w-6" />;
    case "guide":
      return <BookOpen className="h-6 w-6" />;
    case "video":
      return <Video className="h-6 w-6" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-6 w-6" />;
    case "presentation":
      return <Presentation className="h-6 w-6" />;
    case "ebook":
      return <BookOpen className="h-6 w-6" />;
    default:
      return <FileText className="h-6 w-6" />;
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case "template":
      return "Template";
    case "guide":
      return "Guia";
    case "video":
      return "Vídeo";
    case "spreadsheet":
      return "Planilha";
    case "presentation":
      return "Apresentação";
    case "ebook":
      return "E-book";
    default:
      return type;
  }
};

export default function Recursos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
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
            Templates, guias, planilhas e vídeos para potencializar seu trabalho
            com impacto social
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
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Button>
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
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <p className="text-muted-foreground">
              {filteredResources.length} recursos encontrados
            </p>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-muted">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.isPremium && (
                        <Badge className="bg-yellow-500">Premium</Badge>
                      )}
                      <Badge variant="outline">{getTypeName(resource.type)}</Badge>
                    </div>
                  </div>
                  <CardTitle className="mt-4">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Download className="h-4 w-4" />
                          {resource.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          {resource.rating}
                        </span>
                      </div>
                      <Badge variant="secondary">{resource.category}</Badge>
                    </div>
                    <Button
                      className="w-full"
                      variant={resource.isPremium ? "outline" : "default"}
                    >
                      {resource.isPremium ? (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Baixar Grátis
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-4xl">
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-yellow-500">Premium</Badge>
                  <h2 className="text-2xl font-bold mb-4">
                    Acesso Completo à Biblioteca
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Desbloqueie todos os recursos premium, incluindo templates
                    avançados, cursos em vídeo e suporte prioritário.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Acesso a todos os recursos
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Atualizações mensais
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Suporte prioritário
                    </li>
                  </ul>
                  <Button>Assinar Premium</Button>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">R$ 49</p>
                  <p className="text-muted-foreground">/mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Request Resource */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Não Encontrou o que Precisa?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Solicite um novo recurso e nossa equipe irá criar para você
          </p>
          <Button size="lg" variant="secondary">
            Solicitar Recurso
          </Button>
        </div>
      </section>
    </div>
  );
}
