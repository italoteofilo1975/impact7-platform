import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Heart,
  Zap,
  Globe,
  ArrowRight,
  Search,
  Building2,
  GraduationCap,
  Coffee,
  Laptop,
} from "lucide-react";

const openPositions = [
  {
    id: 1,
    title: "Desenvolvedor Full Stack Senior",
    department: "Engenharia",
    location: "Remoto",
    type: "Tempo Integral",
    salary: "R$15.000 - R$22.000",
    description: "Buscamos um desenvolvedor experiente para liderar projetos de impacto social.",
    requirements: ["5+ anos de experiência", "React, Node.js, TypeScript", "Experiência com APIs REST"],
    isNew: true,
  },
  {
    id: 2,
    title: "Product Designer",
    department: "Design",
    location: "São Paulo ou Remoto",
    type: "Tempo Integral",
    salary: "R$10.000 - R$15.000",
    description: "Procuramos um designer apaixonado por criar experiências que transformam vidas.",
    requirements: ["3+ anos de experiência", "Figma, Design Systems", "UX Research"],
    isNew: true,
  },
  {
    id: 3,
    title: "Analista de Impacto Social",
    department: "Impacto",
    location: "São Paulo",
    type: "Tempo Integral",
    salary: "R$8.000 - R$12.000",
    description: "Analise e mensure o impacto de projetos sociais usando nossa metodologia.",
    requirements: ["Formação em Ciências Sociais ou áreas afins", "Conhecimento em métricas de impacto", "Excel avançado"],
    isNew: false,
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Sucesso do Cliente",
    location: "Remoto",
    type: "Tempo Integral",
    salary: "R$7.000 - R$10.000",
    description: "Garanta o sucesso dos nossos clientes na jornada de mensuração de impacto.",
    requirements: ["2+ anos em CS ou áreas relacionadas", "Excelente comunicação", "Orientação a resultados"],
    isNew: false,
  },
  {
    id: 5,
    title: "Estagiário de Marketing",
    department: "Marketing",
    location: "São Paulo",
    type: "Estágio",
    salary: "R$2.000 - R$2.500",
    description: "Apoie a equipe de marketing na criação de conteúdo e campanhas.",
    requirements: ["Cursando Marketing, Comunicação ou áreas afins", "Conhecimento em redes sociais", "Criatividade"],
    isNew: false,
  },
];

const benefits = [
  {
    icon: Laptop,
    title: "Trabalho Remoto",
    description: "Flexibilidade para trabalhar de onde quiser",
  },
  {
    icon: Heart,
    title: "Plano de Saúde",
    description: "Cobertura completa para você e dependentes",
  },
  {
    icon: GraduationCap,
    title: "Educação",
    description: "Auxílio para cursos, certificações e eventos",
  },
  {
    icon: Coffee,
    title: "Vale Refeição",
    description: "Cartão flexível para alimentação",
  },
  {
    icon: Users,
    title: "Cultura Colaborativa",
    description: "Ambiente diverso e inclusivo",
  },
  {
    icon: Zap,
    title: "Impacto Real",
    description: "Trabalhe em projetos que transformam vidas",
  },
];

const values = [
  {
    icon: Heart,
    title: "Propósito",
    description: "Acreditamos que negócios podem ser força para o bem",
  },
  {
    icon: Users,
    title: "Colaboração",
    description: "Juntos somos mais fortes e vamos mais longe",
  },
  {
    icon: Zap,
    title: "Inovação",
    description: "Buscamos constantemente novas formas de criar impacto",
  },
  {
    icon: Globe,
    title: "Diversidade",
    description: "Valorizamos diferentes perspectivas e experiências",
  },
];

export default function Carreiras() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const departments = Array.from(new Set(openPositions.map((p) => p.department)));

  const filteredPositions = openPositions.filter((position) => {
    const matchesSearch =
      position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !selectedDepartment || position.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Carreiras</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Construa sua Carreira com Propósito
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a uma equipe apaixonada por transformar o mundo através da
            mensuração de impacto social
          </p>
          <Button size="lg">
            Ver Vagas Abertas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-muted-foreground">Colaboradores</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">15</p>
              <p className="text-muted-foreground">Países</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">4.8</p>
              <p className="text-muted-foreground">Glassdoor</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">92%</p>
              <p className="text-muted-foreground">Satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Nossos Valores</Badge>
            <h2 className="text-3xl font-bold">O Que Nos Move</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4">Benefícios</Badge>
            <h2 className="text-3xl font-bold">Por Que Trabalhar Conosco</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4">Vagas Abertas</Badge>
            <h2 className="text-3xl font-bold mb-4">
              Encontre sua Próxima Oportunidade
            </h2>
            <p className="text-muted-foreground">
              {openPositions.length} vagas disponíveis
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vagas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedDepartment === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDepartment(null)}
              >
                Todas
              </Button>
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                >
                  {dept}
                </Button>
              ))}
            </div>
          </div>

          {/* Positions List */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredPositions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{position.title}</h3>
                        {position.isNew && (
                          <Badge variant="secondary" className="text-xs">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {position.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {position.salary}
                        </span>
                      </div>
                    </div>
                    <Button>
                      Candidatar-se
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPositions.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma vaga encontrada com os filtros selecionados
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Não Encontrou a Vaga Ideal?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Envie seu currículo para nosso banco de talentos. Entraremos em
            contato quando surgir uma oportunidade compatível.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary">
              Enviar Currículo
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              <Link href="/contato">Falar com RH</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
