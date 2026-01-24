import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Coins, 
  Award, 
  TrendingUp, 
  Shield, 
  Gift,
  ArrowRightLeft,
  Loader2,
  Sparkles,
  Trophy,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';

const tokenTypeConfig = {
  impact_credit: {
    icon: Coins,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Crédito de Impacto',
  },
  verification_badge: {
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Badge de Verificação',
  },
  achievement: {
    icon: Trophy,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Conquista',
  },
  contribution: {
    icon: Gift,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Contribuição',
  },
};

export default function ImpactTokens() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  const { data: tokens, isLoading } = trpc.tokens.getUserTokens.useQuery({});
  const { data: certificates } = trpc.certificates.getUserCertificates.useQuery({});

  // Calculate stats
  const totalTokens = tokens?.length || 0;
  const totalValue = tokens?.reduce((sum, t) => sum + (t.value || 0), 0) || 0;
  const tokensByType = tokens?.reduce((acc, t) => {
    acc[t.tokenType] = (acc[t.tokenType] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Faça login para acessar seus tokens de impacto.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Coins className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t('certificates.tokens')}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tokens de Impacto Social (SIT) representam seu compromisso com a transformação social.
              Cada token é verificável e rastreável através de nossa tecnologia blockchain.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalTokens}</p>
                    <p className="text-sm text-muted-foreground">Total de Tokens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">R$ {(totalValue / 100).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{certificates?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Certificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{tokensByType.achievement || 0}</p>
                    <p className="text-sm text-muted-foreground">Conquistas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Token Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Distribuição de Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(tokenTypeConfig).map(([type, config]) => {
                  const count = tokensByType[type] || 0;
                  const percentage = totalTokens > 0 ? (count / totalTokens) * 100 : 0;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                          <span className="text-sm">{config.label}</span>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Tokens List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Meus Tokens
                  </CardTitle>
                  <CardDescription>
                    Tokens de impacto social que você conquistou
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : tokens?.length === 0 ? (
                    <div className="text-center py-8">
                      <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="font-medium mb-2">Nenhum token ainda</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete projetos de impacto para ganhar tokens SIT.
                      </p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {tokens?.map((token) => {
                        const config = tokenTypeConfig[token.tokenType as keyof typeof tokenTypeConfig];
                        
                        return (
                          <div 
                            key={token.id}
                            className={`p-4 rounded-lg border ${config.bgColor} border-transparent`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                                <config.icon className={`w-5 h-5 ${config.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{token.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {token.description || config.label}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    x{token.amount}
                                  </Badge>
                                  {token.value > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      R$ {(token.value / 100).toFixed(2)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">Como Funciona</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Complete Projetos</h3>
                  <p className="text-sm text-muted-foreground">
                    Execute projetos de impacto social e documente seus resultados na plataforma.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Receba Certificados</h3>
                  <p className="text-sm text-muted-foreground">
                    Certificados de impacto são emitidos com verificação blockchain.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Ganhe Tokens SIT</h3>
                  <p className="text-sm text-muted-foreground">
                    Tokens de Impacto Social são creditados automaticamente em sua conta.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
