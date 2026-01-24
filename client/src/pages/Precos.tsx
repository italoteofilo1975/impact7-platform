import { Link } from "wouter";
import { Check, ArrowRight, Zap, Building2, Rocket, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Free",
    description: "Para começar a medir impacto",
    price: "0",
    period: "para sempre",
    icon: Zap,
    features: [
      "1 projeto ativo",
      "Calculadora SROI básica",
      "Até 100 beneficiários",
      "Relatórios básicos",
      "Suporte por email",
    ],
    notIncluded: [
      "Certificação digital",
      "Tokens de impacto",
      "Assistente Jarvis",
      "API de integração",
    ],
    cta: "Começar Grátis",
    href: "/cadastro",
    popular: false,
  },
  {
    name: "Pro",
    description: "Para organizações em crescimento",
    price: "199",
    period: "por mês",
    icon: Building2,
    features: [
      "10 projetos ativos",
      "Calculadora SROI completa",
      "Beneficiários ilimitados",
      "Certificação digital",
      "Tokens de impacto",
      "Assistente Jarvis",
      "Relatórios avançados",
      "Exportação PDF/CSV",
      "Suporte prioritário",
    ],
    notIncluded: [
      "White-label",
      "API de integração",
      "Suporte dedicado",
    ],
    cta: "Assinar Pro",
    href: "/checkout/pro",
    planId: "pro" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para grandes organizações",
    price: "999",
    period: "por mês",
    icon: Rocket,
    features: [
      "Projetos ilimitados",
      "Tudo do plano Pro",
      "White-label completo",
      "API de integração",
      "SSO/SAML",
      "Suporte dedicado 24/7",
      "Onboarding personalizado",
      "SLA garantido",
      "Relatórios customizados",
    ],
    notIncluded: [],
    cta: "Falar com Vendas",
    href: "/contato?plano=enterprise",
    planId: "enterprise" as const,
    popular: false,
  },
];

const faqs = [
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente e o valor é calculado proporcionalmente.",
  },
  {
    question: "Existe período de teste?",
    answer: "O plano Free é gratuito para sempre. Para os planos pagos, oferecemos garantia de 30 dias - se não estiver satisfeito, devolvemos seu dinheiro.",
  },
  {
    question: "Como funciona a certificação digital?",
    answer: "Após completar a metodologia IMPACT7, você recebe um certificado digital verificável com QR Code. O certificado pode ser compartilhado e validado por qualquer pessoa.",
  },
  {
    question: "O que são Tokens de Impacto?",
    answer: "Tokens de Impacto são reconhecimentos digitais que você acumula ao gerar impacto social mensurável. Eles podem ser usados para desbloquear recursos e reconhecimento na plataforma.",
  },
  {
    question: "Preciso de cartão de crédito para o plano Free?",
    answer: "Não! O plano Free não requer cartão de crédito. Você só precisa criar uma conta para começar a usar.",
  },
  {
    question: "Oferecem desconto para ONGs?",
    answer: "Sim! Organizações sem fins lucrativos têm 50% de desconto em todos os planos pagos. Entre em contato para solicitar.",
  },
];

export default function Precos() {
  const { user, isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.info('Redirecionando para o checkout...');
      window.open(data.checkoutUrl, '_blank');
      setLoadingPlan(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar checkout');
      setLoadingPlan(null);
    },
  });
  
  const handleSubscribe = (planId: 'pro' | 'enterprise') => {
    if (!isAuthenticated) {
      toast.info('Faça login para assinar');
      window.location.href = getLoginUrl();
      return;
    }
    
    if (planId === 'enterprise') {
      // Enterprise goes to contact form
      window.location.href = '/contato?plano=enterprise';
      return;
    }
    
    setLoadingPlan(planId);
    createCheckout.mutate({ planId, billingPeriod: 'monthly' });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container text-center">
          <Badge variant="secondary" className="mb-4">Planos e Preços</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Escolha o plano ideal para sua organização
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e escale conforme seu impacto cresce. Todos os planos incluem acesso à metodologia IMPACT7.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                      <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">R$ {plan.price}</span>
                    <span className="text-muted-foreground ml-2">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                        <span className="w-5 h-5 shrink-0 mt-0.5 text-center">—</span>
                        <span className="text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.name === 'Free' ? (
                    <Link href={plan.href} className="w-full">
                      <Button 
                        className="w-full" 
                        variant="outline"
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => plan.planId && handleSubscribe(plan.planId)}
                      disabled={loadingPlan === plan.planId}
                    >
                      {loadingPlan === plan.planId ? (
                        <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Processando...</>
                      ) : (
                        <>{plan.cta}<ArrowRight className="ml-2 w-4 h-4" /></>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Precisa de uma solução personalizada?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Para grandes organizações, governos e fundações, oferecemos soluções customizadas com integração completa, treinamento e suporte dedicado.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Implementação assistida
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Integração com sistemas existentes
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Treinamento para equipe
                    </li>
                  </ul>
                </div>
                <div>
                  <Link href="/contato?plano=enterprise">
                    <Button size="lg" className="whitespace-nowrap">
                      Agendar Demonstração
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar seu impacto social?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 500 organizações que já estão usando o Método IMPACT7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button size="lg" variant="secondary">
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contato">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10">
                Falar com Especialista
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
