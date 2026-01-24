import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  CheckCircle,
  Shield,
  Star,
  ArrowRight,
  FileCheck,
  Users,
  TrendingUp,
  Globe,
} from "lucide-react";
import { Link } from "wouter";

const certifications = [
  {
    icon: Award,
    title: "Certificado de Impacto IMPACT7",
    level: "Básico",
    description:
      "Atesta que a organização utilizou a metodologia IMPACT7 para mensurar o impacto de pelo menos um projeto",
    requirements: [
      "Cadastro completo na plataforma",
      "Submissão de pelo menos 1 case de impacto",
      "Aprovação pela equipe de revisão",
    ],
    benefits: [
      "Selo digital para uso em materiais",
      "Listagem no diretório de organizações",
      "Acesso a recursos exclusivos",
    ],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "Certificado de Impacto Verificado",
    level: "Intermediário",
    description:
      "Confirma que os dados de impacto foram verificados e validados por auditores independentes",
    requirements: [
      "Certificado Básico ativo",
      "Mínimo de 3 cases aprovados",
      "Auditoria de dados por terceiros",
      "Documentação completa de metodologia",
    ],
    benefits: [
      "Selo de verificação premium",
      "Relatório de auditoria oficial",
      "Destaque em buscas e rankings",
      "Suporte prioritário",
    ],
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Star,
    title: "Certificado de Excelência em Impacto",
    level: "Avançado",
    description:
      "Reconhece organizações que demonstram práticas exemplares de mensuração e gestão de impacto",
    requirements: [
      "Certificado Verificado ativo",
      "SROI médio acima de 3:1",
      "Mínimo de 10 cases publicados",
      "Contribuição para a comunidade",
      "Histórico de 2+ anos na plataforma",
    ],
    benefits: [
      "Selo de excelência exclusivo",
      "Convites para eventos VIP",
      "Mentoria com especialistas",
      "Case study publicado",
      "Desconto em planos Enterprise",
    ],
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const stats = [
  { value: "500+", label: "Organizações Certificadas" },
  { value: "2.000+", label: "Cases Verificados" },
  { value: "R$50M+", label: "Impacto Documentado" },
  { value: "15", label: "Países Representados" },
];

const process = [
  {
    step: 1,
    title: "Cadastre-se",
    description: "Crie sua conta e complete o perfil da organização",
  },
  {
    step: 2,
    title: "Submeta Cases",
    description: "Documente seus projetos usando nossa metodologia",
  },
  {
    step: 3,
    title: "Revisão",
    description: "Nossa equipe analisa e valida as informações",
  },
  {
    step: 4,
    title: "Certificação",
    description: "Receba seu certificado e selo digital",
  },
];

export default function Certificacoes() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Certificações</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Certificações de Impacto
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprove e comunique o impacto da sua organização com credibilidade
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Começar Certificação
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/casos-sucesso">Ver Organizações Certificadas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Levels */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Níveis de Certificação</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Três níveis progressivos que reconhecem diferentes estágios de
              maturidade em mensuração de impacto
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${cert.bgColor.replace("/10", "")}`}
                />
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div
                      className={`w-12 h-12 rounded-full ${cert.bgColor} flex items-center justify-center`}
                    >
                      <cert.icon className={`h-6 w-6 ${cert.color}`} />
                    </div>
                    <Badge variant="secondary">{cert.level}</Badge>
                  </div>
                  <CardTitle>{cert.title}</CardTitle>
                  <CardDescription>{cert.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        Requisitos
                      </h4>
                      <ul className="space-y-1">
                        {cert.requirements.map((req, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Benefícios
                      </h4>
                      <ul className="space-y-1">
                        {cert.benefits.map((benefit, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Processo simples e transparente para obter sua certificação
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Certify */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Por Que Certificar Seu Impacto?
              </h2>
              <p className="text-muted-foreground mb-6">
                A certificação IMPACT7 oferece credibilidade e visibilidade para
                sua organização, além de facilitar a captação de recursos e
                parcerias estratégicas.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Credibilidade com Stakeholders</h3>
                    <p className="text-sm text-muted-foreground">
                      Demonstre para financiadores, parceiros e beneficiários que
                      seu impacto é real e mensurável
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Captação de Recursos</h3>
                    <p className="text-sm text-muted-foreground">
                      Organizações certificadas têm 3x mais chances de captar
                      recursos de fundações e investidores de impacto
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Visibilidade Global</h3>
                    <p className="text-sm text-muted-foreground">
                      Faça parte de uma rede internacional de organizações
                      comprometidas com mensuração de impacto
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-8">
                <Award className="h-16 w-16 mb-6 opacity-90" />
                <h3 className="text-2xl font-bold mb-4">
                  Pronto para Certificar?
                </h3>
                <p className="opacity-90 mb-6">
                  Comece hoje mesmo a documentar o impacto da sua organização e
                  obtenha reconhecimento oficial.
                </p>
                <Button variant="secondary" size="lg" className="w-full" asChild>
                  <Link href="/dashboard">Iniciar Processo</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
