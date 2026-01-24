import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const benefits = [
  {
    icon: Video,
    title: "Demonstração Personalizada",
    description: "30 minutos focados nas suas necessidades específicas",
  },
  {
    icon: Users,
    title: "Especialista Dedicado",
    description: "Atendimento com consultor especializado em impacto social",
  },
  {
    icon: TrendingUp,
    title: "Análise de Caso",
    description: "Simulação com dados do seu projeto ou organização",
  },
  {
    icon: Award,
    title: "Acesso Trial",
    description: "14 dias de teste gratuito após a demonstração",
  },
];

const features = [
  "Calculadora de SROI em tempo real",
  "Dashboard de métricas de impacto",
  "Sistema de tokens de engajamento",
  "Relatórios automatizados",
  "Integração com ferramentas existentes",
  "API para desenvolvedores",
];

const sectors = [
  "ONG / Terceiro Setor",
  "Fundação / Instituto",
  "Governo / Setor Público",
  "Empresa / ESG Corporativo",
  "Investidor de Impacto",
  "Consultoria",
  "Academia / Pesquisa",
  "Outro",
];

const teamSizes = [
  "1-5 pessoas",
  "6-20 pessoas",
  "21-50 pessoas",
  "51-200 pessoas",
  "200+ pessoas",
];

export default function Demo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Solicitação enviada! Entraremos em contato em breve.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Solicitação Recebida!</h2>
            <p className="text-muted-foreground mb-6">
              Nossa equipe entrará em contato em até 24 horas úteis para agendar
              sua demonstração personalizada.
            </p>
            <div className="space-y-4">
              <Button className="w-full" onClick={() => setSubmitted(false)}>
                Fazer Nova Solicitação
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/">Voltar para Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Demonstração</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Agende Sua Demonstração Gratuita
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Veja como o IMPACT7 pode transformar a mensuração de impacto da sua
            organização em apenas 30 minutos
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 px-4 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Demonstração</CardTitle>
                  <CardDescription>
                    Preencha o formulário e nossa equipe entrará em contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome *</Label>
                        <Input
                          id="firstName"
                          placeholder="Seu nome"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Sobrenome *</Label>
                        <Input
                          id="lastName"
                          placeholder="Seu sobrenome"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Corporativo *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Organização *</Label>
                      <Input
                        id="company"
                        placeholder="Nome da sua organização"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sector">Setor *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {sectors.map((sector) => (
                              <SelectItem key={sector} value={sector}>
                                {sector}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teamSize">Tamanho da Equipe</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Conte-nos sobre seu projeto
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Descreva brevemente suas necessidades de mensuração de impacto..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Enviando..."
                      ) : (
                        <>
                          Solicitar Demonstração
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Ao enviar, você concorda com nossa{" "}
                      <a href="/privacidade" className="underline">
                        Política de Privacidade
                      </a>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  O Que Você Verá na Demo
                </h2>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Horários Disponíveis</h3>
                      <p className="text-sm text-muted-foreground">
                        Segunda a Sexta, 9h às 18h (Horário de Brasília)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Duração</h3>
                      <p className="text-sm text-muted-foreground">
                        30 minutos de demonstração + 15 minutos para perguntas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <blockquote className="italic text-muted-foreground mb-4">
                    "A demonstração foi fundamental para entendermos como o
                    IMPACT7 poderia se encaixar em nossos processos. Em 30
                    minutos, já tínhamos clareza do potencial da ferramenta."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">M</span>
                    </div>
                    <div>
                      <p className="font-semibold">Maria Costa</p>
                      <p className="text-sm text-muted-foreground">
                        Diretora de Impacto - Instituto XYZ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
