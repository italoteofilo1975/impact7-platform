import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Feature {
  name: string;
  tooltip?: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const features: Feature[] = [
  // Calculadora
  { name: "Calculadora de SROI", free: true, pro: true, enterprise: true },
  { name: "Cálculos ilimitados", free: false, pro: true, enterprise: true },
  { name: "Modelos customizados", free: false, pro: true, enterprise: true },
  { name: "Análise de sensibilidade", free: false, pro: true, enterprise: true },
  // Projetos
  { name: "Projetos ativos", free: "3", pro: "Ilimitados", enterprise: "Ilimitados" },
  { name: "Membros por projeto", free: "2", pro: "10", enterprise: "Ilimitados" },
  { name: "Armazenamento", free: "1 GB", pro: "50 GB", enterprise: "Ilimitado" },
  // Relatórios
  { name: "Relatórios básicos", free: true, pro: true, enterprise: true },
  { name: "Relatórios avançados", free: false, pro: true, enterprise: true },
  { name: "Exportação PDF/Excel", free: false, pro: true, enterprise: true },
  { name: "White-label", tooltip: "Relatórios com sua marca", free: false, pro: false, enterprise: true },
  // Tokens
  { name: "Tokens de Impacto", free: true, pro: true, enterprise: true },
  { name: "Gamificação avançada", free: false, pro: true, enterprise: true },
  { name: "Marketplace de tokens", free: false, pro: false, enterprise: true },
  // Integrações
  { name: "API REST", free: false, pro: true, enterprise: true },
  { name: "Webhooks", free: false, pro: true, enterprise: true },
  { name: "Integrações nativas", free: "3", pro: "10+", enterprise: "Todas" },
  { name: "SSO/SAML", tooltip: "Single Sign-On", free: false, pro: false, enterprise: true },
  // Suporte
  { name: "Suporte por email", free: true, pro: true, enterprise: true },
  { name: "Suporte prioritário", free: false, pro: true, enterprise: true },
  { name: "Gerente de conta", free: false, pro: false, enterprise: true },
  { name: "SLA garantido", tooltip: "99.9% uptime", free: false, pro: false, enterprise: true },
  { name: "Onboarding dedicado", free: false, pro: false, enterprise: true },
  // Segurança
  { name: "Criptografia SSL", free: true, pro: true, enterprise: true },
  { name: "2FA", tooltip: "Autenticação em dois fatores", free: true, pro: true, enterprise: true },
  { name: "Auditoria de acessos", free: false, pro: true, enterprise: true },
  { name: "Compliance LGPD", free: true, pro: true, enterprise: true },
  { name: "Ambiente dedicado", free: false, pro: false, enterprise: true },
];

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "para sempre",
    description: "Para começar a medir impacto",
    cta: "Começar Grátis",
    ctaVariant: "outline" as const,
    href: "/cadastro",
  },
  {
    name: "Pro",
    price: "R$ 197",
    period: "/mês",
    description: "Para organizações em crescimento",
    cta: "Assinar Pro",
    ctaVariant: "default" as const,
    href: "/precos",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para grandes organizações",
    cta: "Falar com Vendas",
    ctaVariant: "outline" as const,
    href: "/demo",
  },
];

const renderValue = (value: boolean | string) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
};

export default function Comparacao() {
  return (
    <TooltipProvider>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
          <div className="container max-w-4xl text-center">
            <Badge className="mb-4">Comparação</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Compare Nossos Planos
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Encontre o plano ideal para sua organização
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4">
          <div className="container">
            {/* Plan Headers */}
            <div className="grid grid-cols-4 gap-4 mb-8 sticky top-0 bg-background z-10 py-4">
              <div className="hidden md:block" />
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`text-center ${
                    plan.popular ? "border-primary shadow-lg" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    {plan.popular && (
                      <Badge className="mx-auto mb-2">Mais Popular</Badge>
                    )}
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={plan.ctaVariant}
                      className="w-full"
                      asChild
                    >
                      <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={index}
                      className={`border-b last:border-b-0 ${
                        index % 2 === 0 ? "bg-muted/30" : ""
                      }`}
                    >
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          {feature.name}
                          {feature.tooltip && (
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {feature.tooltip}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {renderValue(feature.free)}
                      </td>
                      <td className="p-4 text-center bg-primary/5">
                        {renderValue(feature.pro)}
                      </td>
                      <td className="p-4 text-center">
                        {renderValue(feature.enterprise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              Perguntas Frequentes
            </h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">
                    Posso mudar de plano depois?
                  </h3>
                  <p className="text-muted-foreground">
                    Sim! Você pode fazer upgrade ou downgrade a qualquer momento.
                    O valor será calculado proporcionalmente.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">
                    Existe período de teste?
                  </h3>
                  <p className="text-muted-foreground">
                    Sim, oferecemos 14 dias de teste gratuito do plano Pro para
                    todas as novas contas.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">
                    Como funciona o plano Enterprise?
                  </h3>
                  <p className="text-muted-foreground">
                    O plano Enterprise é personalizado para grandes organizações.
                    Entre em contato para uma proposta sob medida.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">
                    Quais formas de pagamento são aceitas?
                  </h3>
                  <p className="text-muted-foreground">
                    Aceitamos cartão de crédito, boleto bancário e PIX. Para
                    Enterprise, também oferecemos faturamento.
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
              Ainda Tem Dúvidas?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">Agendar Demonstração</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contato">Falar com Vendas</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
