import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Globe,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Impacto Mensurável",
    description:
      "Acreditamos que o que pode ser medido pode ser melhorado. Nossa metodologia transforma impacto social em métricas acionáveis.",
  },
  {
    icon: Lightbulb,
    title: "Inovação Científica",
    description:
      "Combinamos rigor acadêmico com tecnologia de ponta para criar soluções que realmente funcionam.",
  },
  {
    icon: Heart,
    title: "Propósito Social",
    description:
      "Nosso trabalho é guiado pelo compromisso de criar um mundo mais justo e sustentável para todos.",
  },
  {
    icon: Users,
    title: "Colaboração",
    description:
      "Trabalhamos em parceria com organizações de todos os setores para amplificar o impacto coletivo.",
  },
];

const milestones = [
  { year: "2020", event: "Fundação do IMPACT7 e início das pesquisas" },
  { year: "2021", event: "Formalização da fórmula honesta do S-ROI e do Funil IMPACTA" },
  { year: "2022", event: "Lançamento da primeira versão da plataforma" },
  { year: "2023", event: "Parceria com 50+ organizações de impacto" },
  { year: "2024", event: "Expansão internacional e lançamento do Jarvis IA" },
  { year: "2025", event: "Certificação blockchain e tokens de impacto" },
];

const stats = [
  { value: "500+", label: "Projetos Avaliados" },
  { value: "R$2.5B", label: "Impacto Mensurado" },
  { value: "1M+", label: "Beneficiários" },
  { value: "15", label: "Países" },
];

export default function Sobre() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Nossa História</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Transformando o Mundo Através do Impacto Mensurável
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            O IMPACT7 nasceu da convicção de que o impacto social pode e deve ser
            quantificado com o mesmo rigor que aplicamos aos resultados financeiros.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Nossa Missão</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Democratizar a mensuração de impacto social, fornecendo ferramentas
                  científicas e acessíveis para que qualquer organização possa
                  quantificar, comunicar e maximizar seu impacto positivo no mundo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Nossa Visão</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Ser a referência global em metodologia de mensuração de impacto
                  social, contribuindo para um ecossistema onde decisões de
                  investimento social são baseadas em evidências e resultados
                  mensuráveis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Nossos Valores</Badge>
            <h2 className="text-3xl font-bold">O Que Nos Move</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Nossa Jornada</Badge>
            <h2 className="text-3xl font-bold">Marcos Importantes</h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? "text-right" : "text-left"
                    }`}
                  >
                    <Card>
                      <CardContent className="py-4">
                        <p className="font-bold text-primary">{milestone.year}</p>
                        <p className="text-muted-foreground">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="relative z-10 w-4 h-4 bg-primary rounded-full border-4 border-background" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Metodologia</Badge>
            <h2 className="text-3xl font-bold mb-4">O Método por Trás do IMPACT7</h2>
            <p className="text-muted-foreground">
              A fórmula honesta do S-ROI: sem expoente fictício, com três descontos auditáveis
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-8">
                <p className="text-2xl md:text-3xl font-mono font-bold text-primary mb-2">
                  S-ROI = Valor Social × Descontos / Custo
                </p>
                <p className="text-muted-foreground">A Fórmula Honesta do S-ROI</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 mb-2">VS</p>
                  <p className="font-medium">Valor Social</p>
                  <p className="text-sm text-muted-foreground">
                    Gatilhos × valor do gatilho, mais transformações × valor da transformação
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 mb-2">D</p>
                  <p className="font-medium">Três Descontos</p>
                  <p className="text-sm text-muted-foreground">
                    Atribuição × (1-deadweight) × (1-dropOff), compostos multiplicativamente
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 mb-2">C</p>
                  <p className="font-medium">Custo</p>
                  <p className="text-sm text-muted-foreground">
                    Custo fixo do investimento social, denominador do S-ROI
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button asChild>
                  <Link href="/ciencia">
                    Conhecer a Ciência Completa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recognition */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Reconhecimento</Badge>
            <h2 className="text-3xl font-bold">Prêmios e Certificações</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="font-semibold mb-2">Prêmio Inovação Social</h3>
                <p className="text-sm text-muted-foreground">
                  Reconhecimento por metodologia inovadora em 2023
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Globe className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="font-semibold mb-2">Parceiro ONU</h3>
                <p className="text-sm text-muted-foreground">
                  Alinhamento com os Objetivos de Desenvolvimento Sustentável
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="font-semibold mb-2">ISO 27001</h3>
                <p className="text-sm text-muted-foreground">
                  Certificação em segurança da informação
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Mensurar seu Impacto?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Junte-se a centenas de organizações que já estão transformando o mundo
            com decisões baseadas em dados
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/calculadora">Experimentar Calculadora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              <Link href="/contato">Falar com Especialista</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
