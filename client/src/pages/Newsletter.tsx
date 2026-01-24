import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  CheckCircle,
  BookOpen,
  TrendingUp,
  Users,
  Gift,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const benefits = [
  {
    icon: BookOpen,
    title: "Conteúdo Exclusivo",
    description: "Artigos, guias e estudos de caso sobre mensuração de impacto",
  },
  {
    icon: TrendingUp,
    title: "Tendências do Setor",
    description: "Análises sobre ESG, investimento de impacto e terceiro setor",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Convites para eventos, webinars e networking exclusivo",
  },
  {
    icon: Gift,
    title: "Ofertas Especiais",
    description: "Descontos e acesso antecipado a novas funcionalidades",
  },
];

const previousEditions = [
  {
    title: "O Futuro do SROI: Tendências para 2026",
    date: "Janeiro 2026",
    reads: "2.4K",
  },
  {
    title: "Como Grandes Fundações Mensuram Impacto",
    date: "Dezembro 2025",
    reads: "3.1K",
  },
  {
    title: "ESG Corporativo: Métricas que Importam",
    date: "Novembro 2025",
    reads: "2.8K",
  },
  {
    title: "Tokens de Impacto: Gamificação no Terceiro Setor",
    date: "Outubro 2025",
    reads: "1.9K",
  },
];

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error("Por favor, aceite os termos para continuar");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Inscrição realizada com sucesso!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Bem-vindo à Newsletter!</h2>
            <p className="text-muted-foreground mb-6">
              Você receberá nosso próximo conteúdo em breve. Enquanto isso,
              confira nossos artigos mais recentes.
            </p>
            <div className="space-y-4">
              <Button className="w-full" asChild>
                <a href="/blog">Ver Blog</a>
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
          <Badge className="mb-4">Newsletter</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Impacto na Sua Caixa de Entrada
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Receba insights semanais sobre mensuração de impacto, ESG e inovação
            social
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Semanal
            </span>
            <span>•</span>
            <span>+5.000 assinantes</span>
            <span>•</span>
            <span>Cancele quando quiser</span>
          </div>
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
                  <CardTitle>Inscreva-se Gratuitamente</CardTitle>
                  <CardDescription>
                    Junte-se a mais de 5.000 profissionais do terceiro setor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) =>
                          setAcceptedTerms(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground leading-tight"
                      >
                        Concordo em receber emails do IMPACT7 e aceito a{" "}
                        <a href="/privacidade" className="underline">
                          Política de Privacidade
                        </a>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Inscrevendo..."
                      ) : (
                        <>
                          Inscrever-se
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Você pode cancelar sua inscrição a qualquer momento
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Previous Editions */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Edições Anteriores</h2>
              <div className="space-y-4">
                {previousEditions.map((edition, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold mb-1">{edition.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {edition.date}
                          </p>
                        </div>
                        <Badge variant="secondary">{edition.reads} leituras</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6 bg-muted/50">
                <CardContent className="pt-6">
                  <blockquote className="italic text-muted-foreground mb-4">
                    "A newsletter do IMPACT7 é leitura obrigatória para quem
                    trabalha com impacto social. Conteúdo prático e relevante
                    toda semana."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">P</span>
                    </div>
                    <div>
                      <p className="font-semibold">Paulo Ribeiro</p>
                      <p className="text-sm text-muted-foreground">
                        Consultor de ESG
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
