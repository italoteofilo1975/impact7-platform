import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  CreditCard, 
  Receipt, 
  Calendar, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  Crown,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";

export default function Payments() {
  const { user, isAuthenticated, loading } = useAuth();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const { data: subscription, isLoading: isLoadingSubscription } = trpc.billing.getSubscription.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createPortal = trpc.billing.createPortal.useMutation({
    onSuccess: (data) => {
      window.open(data.portalUrl, '_blank');
      setIsLoadingPortal(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao abrir portal');
      setIsLoadingPortal(false);
    },
  });

  const handleOpenPortal = () => {
    setIsLoadingPortal(true);
    createPortal.mutate();
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Ativa</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" /> Em Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Pagamento Pendente</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Sem assinatura</Badge>;
    }
  };

  const getPlanIcon = (plan: string | null | undefined) => {
    switch (plan) {
      case 'enterprise':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'professional':
        return <Zap className="w-6 h-6 text-primary" />;
      default:
        return <CreditCard className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getPlanName = (plan: string | null | undefined) => {
    switch (plan) {
      case 'enterprise':
        return 'Enterprise';
      case 'professional':
        return 'Pro';
      default:
        return 'Free';
    }
  };

  if (loading || isLoadingSubscription) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">Faça login para ver seus pagamentos.</p>
          <Link href="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />

      <section className="py-12">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Pagamentos e Assinatura</h1>
              <p className="text-muted-foreground">Gerencie sua assinatura e histórico de pagamentos</p>
            </div>
          </div>

          {/* Current Plan */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getPlanIcon(subscription?.planType)}
                Plano Atual
              </CardTitle>
              <CardDescription>Detalhes da sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold">{getPlanName(subscription?.planType)}</span>
                    {getStatusBadge(subscription?.subscriptionStatus)}
                  </div>
                  
                  {subscription?.planType === 'free' ? (
                    <p className="text-muted-foreground mb-4">
                      Você está no plano gratuito. Faça upgrade para desbloquear mais recursos.
                    </p>
                  ) : (
                    <p className="text-muted-foreground mb-4">
                      Sua assinatura está {subscription?.subscriptionStatus === 'active' ? 'ativa' : 'em processamento'}.
                    </p>
                  )}

                  <div className="flex gap-3">
                    {subscription?.stripeCustomerId && (
                      <Button 
                        onClick={handleOpenPortal}
                        disabled={isLoadingPortal}
                      >
                        {isLoadingPortal ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Abrindo...</>
                        ) : (
                          <><ExternalLink className="w-4 h-4 mr-2" /> Gerenciar Assinatura</>
                        )}
                      </Button>
                    )}
                    {(!subscription?.planType || subscription?.planType === 'free') && (
                      <Link href="/precos">
                        <Button>
                          <Zap className="w-4 h-4 mr-2" /> Fazer Upgrade
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Recursos do seu plano</h4>
                  <ul className="space-y-2 text-sm">
                    {subscription?.planType === 'enterprise' ? (
                      <>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Projetos ilimitados</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> API completa</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Suporte dedicado</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> White-label</li>
                      </>
                    ) : subscription?.planType === 'professional' ? (
                      <>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 10 projetos ativos</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Calculadora SROI completa</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Certificação digital</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Tokens de impacto</li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 1 projeto ativo</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Calculadora básica</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Acesso à comunidade</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Receipt className="w-5 h-5" />
                Histórico de Pagamentos
              </CardTitle>
              <CardDescription>Visualize e baixe suas faturas</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.stripeCustomerId ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Acesse o portal do Stripe para ver seu histórico completo de pagamentos, 
                    baixar faturas e atualizar método de pagamento.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={handleOpenPortal}
                    disabled={isLoadingPortal}
                  >
                    {isLoadingPortal ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Abrindo...</>
                    ) : (
                      <><ExternalLink className="w-4 h-4 mr-2" /> Ver Histórico no Stripe</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não possui pagamentos registrados.
                  </p>
                  <Link href="/precos">
                    <Button variant="outline">
                      Ver Planos Disponíveis
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* FAQ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Perguntas Frequentes</h3>
            
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer font-medium">Como cancelo minha assinatura?</summary>
                <p className="mt-2 text-sm text-muted-foreground pl-4">
                  Clique em "Gerenciar Assinatura" para acessar o portal do Stripe, onde você pode cancelar a qualquer momento.
                </p>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer font-medium">Posso mudar de plano?</summary>
                <p className="mt-2 text-sm text-muted-foreground pl-4">
                  Sim! No portal do Stripe você pode fazer upgrade ou downgrade. O valor é calculado proporcionalmente.
                </p>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer font-medium">Como atualizo meu cartão?</summary>
                <p className="mt-2 text-sm text-muted-foreground pl-4">
                  Acesse o portal do Stripe clicando em "Gerenciar Assinatura" e atualize seu método de pagamento.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
