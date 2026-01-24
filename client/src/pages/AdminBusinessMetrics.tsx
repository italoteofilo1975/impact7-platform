import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getLoginUrl } from "../const";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Percent,
  Activity,
} from "lucide-react";

export default function AdminBusinessMetrics() {
  const { user, isAuthenticated } = useAuth();

  // Queries
  const { data: leadStats } = trpc.leads.list.useQuery(undefined, { enabled: isAuthenticated });
  // Case stats would come from a dedicated endpoint
  const { data: tokenStats } = trpc.tokens.getStats.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Acesso restrito a administradores</p>
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simulated metrics (in production, these would come from real data)
  const metrics = {
    mrr: 12500,
    mrrGrowth: 15.3,
    arr: 150000,
    churnRate: 2.1,
    ltv: 4500,
    cac: 450,
    ltvCacRatio: 10,
    conversionRate: 4.2,
    trialConversion: 32.5,
    activeUsers: 1250,
    newUsersThisMonth: 145,
    nps: 72,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container py-8">
        <AdminBreadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Métricas de Negócio" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Métricas de Negócio</h1>
          <p className="text-muted-foreground">
            Acompanhe os principais indicadores de performance do negócio
          </p>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUpRight className="h-3 w-3" />
                    +{metrics.mrrGrowth}%
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ARR</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.arr)}</p>
                  <p className="text-xs text-muted-foreground">Receita anual recorrente</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <p className="text-2xl font-bold">{metrics.churnRate}%</p>
                  <p className="text-xs text-muted-foreground">Meta: &lt;3%</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <RefreshCw className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">NPS</p>
                  <p className="text-2xl font-bold">{metrics.nps}</p>
                  <Badge variant={metrics.nps >= 70 ? "default" : "secondary"}>
                    {metrics.nps >= 70 ? "Excelente" : metrics.nps >= 50 ? "Bom" : "Regular"}
                  </Badge>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unit Economics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Unit Economics</CardTitle>
            <CardDescription>Métricas de economia unitária</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">LTV</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(metrics.ltv)}</p>
                <p className="text-xs text-muted-foreground">Lifetime Value</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">CAC</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(metrics.cac)}</p>
                <p className="text-xs text-muted-foreground">Custo de Aquisição</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">LTV:CAC</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.ltvCacRatio}:1</p>
                <p className="text-xs text-muted-foreground">Meta: &gt;3:1</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Payback</p>
                <p className="text-3xl font-bold text-purple-600">4.3</p>
                <p className="text-xs text-muted-foreground">meses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Funil de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Visitantes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "100%" }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">10,000</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Leads</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "42%" }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{leadStats?.length || 420}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trials</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: "18%" }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">180</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Clientes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: "6%" }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">58</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Conversão Geral</span>
                  <span className="font-medium">{metrics.conversionRate}%</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Trial → Pago</span>
                  <span className="font-medium">{metrics.trialConversion}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crescimento de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                    <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +12.5%
                    </p>
                    <p className="text-xs text-muted-foreground">vs mês anterior</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Novos este mês</p>
                    <p className="text-2xl font-bold">{metrics.newUsersThisMonth}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +8.2%
                    </p>
                    <p className="text-xs text-muted-foreground">vs mês anterior</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens em Circulação</p>
                    <p className="text-2xl font-bold">{tokenStats?.totalTokens?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {tokenStats?.totalHolders || 0} holders
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Receita por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Free</span>
                  <Badge variant="outline">0%</Badge>
                </div>
                <p className="text-2xl font-bold">R$ 0</p>
                <p className="text-sm text-muted-foreground">850 usuários</p>
              </div>
              <div className="p-4 border rounded-lg border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Starter</span>
                  <Badge>25%</Badge>
                </div>
                <p className="text-2xl font-bold">R$ 3.125</p>
                <p className="text-sm text-muted-foreground">125 usuários</p>
              </div>
              <div className="p-4 border rounded-lg border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Professional</span>
                  <Badge className="bg-purple-600">55%</Badge>
                </div>
                <p className="text-2xl font-bold">R$ 6.875</p>
                <p className="text-sm text-muted-foreground">55 usuários</p>
              </div>
              <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Enterprise</span>
                  <Badge className="bg-yellow-600">20%</Badge>
                </div>
                <p className="text-2xl font-bold">R$ 2.500</p>
                <p className="text-sm text-muted-foreground">5 usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
