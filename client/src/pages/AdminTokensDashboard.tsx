import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Coins,
  TrendingUp,
  Users,
  Award,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Loader2,
  PieChart,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

const TOKEN_TYPE_LABELS: Record<string, { label: string; color: string; icon: typeof Coins }> = {
  impact_credit: { label: 'Crédito de Impacto', color: 'bg-green-500', icon: Coins },
  verification_badge: { label: 'Badge de Verificação', color: 'bg-blue-500', icon: Award },
  achievement: { label: 'Conquista', color: 'bg-purple-500', icon: TrendingUp },
  contribution: { label: 'Contribuição', color: 'bg-orange-500', icon: Users },
};

export default function AdminTokensDashboard() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: userTokens, isLoading: tokensLoading, refetch } = trpc.tokens.getUserTokens.useQuery(
    { limit: 100 },
    { enabled: !!user }
  );

  const tokenStats = userTokens ? {
    total: userTokens.length,
    totalValue: userTokens.reduce((sum, t) => sum + (t.value || 0), 0),
    byType: Object.entries(
      userTokens.reduce((acc, t) => {
        acc[t.tokenType] = (acc[t.tokenType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
    recentTokens: userTokens.slice(0, 5),
  } : null;

  if (authLoading || tokensLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">Faça login para acessar o dashboard de tokens.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <AdminBreadcrumb items={[{ label: 'Tokens de Impacto' }]} />
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Coins className="w-7 h-7 text-primary" />
              Dashboard de Tokens SIT
            </h1>
            <p className="text-muted-foreground mt-1">Tokens de Impacto Social - Gestão e Métricas</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Tokens</p>
                  <p className="text-3xl font-bold">{tokenStats?.total || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12% este mês</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-3xl font-bold">{tokenStats?.totalValue.toLocaleString('pt-BR') || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                <span>+8% este mês</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tipos Ativos</p>
                  <p className="text-3xl font-bold">{tokenStats?.byType.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">de 4 tipos disponíveis</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Certificados</p>
                  <p className="text-3xl font-bold">{userTokens?.filter(t => t.certificateId).length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">tokens vinculados</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Distribuição por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tokenStats?.byType.map(([type, count]) => {
                      const config = TOKEN_TYPE_LABELS[type] || { label: type, color: 'bg-gray-500', icon: Coins };
                      const percentage = tokenStats.total > 0 ? (count / tokenStats.total) * 100 : 0;
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${config.color}`} />
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                    {(!tokenStats?.byType || tokenStats.byType.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">Nenhum token emitido ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Tokens Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tokenStats?.recentTokens.map((token) => {
                      const config = TOKEN_TYPE_LABELS[token.tokenType] || { label: token.tokenType, color: 'bg-gray-500', icon: Coins };
                      const IconComponent = config.icon;
                      return (
                        <div key={token.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <div className={`w-10 h-10 rounded-full ${config.color}/10 flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{token.name}</p>
                            <p className="text-sm text-muted-foreground">{config.label}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{token.value || 0}</p>
                            <p className="text-xs text-muted-foreground">{new Date(token.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      );
                    })}
                    {(!tokenStats?.recentTokens || tokenStats.recentTokens.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">Nenhum token emitido ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Tokens Disponíveis</CardTitle>
                <CardDescription>Conheça os diferentes tipos de tokens de impacto social</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {Object.entries(TOKEN_TYPE_LABELS).map(([type, config]) => {
                    const IconComponent = config.icon;
                    const count = tokenStats?.byType.find(([t]) => t === type)?.[1] || 0;
                    return (
                      <div key={type} className="p-4 rounded-lg border">
                        <div className={`w-12 h-12 rounded-lg ${config.color}/10 flex items-center justify-center mb-3`}>
                          <IconComponent className={`w-6 h-6 ${config.color.replace('bg-', 'text-')}`} />
                        </div>
                        <h3 className="font-semibold mb-1">{config.label}</h3>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground">tokens emitidos</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Organização</CardTitle>
                <CardDescription>Tokens emitidos por organização parceira</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Organização Alpha', tokens: 45, value: 12500, growth: 15 },
                    { name: 'Fundação Beta', tokens: 32, value: 8900, growth: 8 },
                    { name: 'Instituto Gamma', tokens: 28, value: 7200, growth: -3 },
                    { name: 'ONG Delta', tokens: 21, value: 5600, growth: 22 },
                  ].map((org, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{org.name}</h4>
                        <p className="text-sm text-muted-foreground">{org.tokens} tokens • Valor: {org.value.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${org.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {org.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span className="font-medium">{Math.abs(org.growth)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Emissões</CardTitle>
                <CardDescription>Todos os tokens emitidos ordenados por data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userTokens?.map((token) => {
                    const config = TOKEN_TYPE_LABELS[token.tokenType] || { label: token.tokenType, color: 'bg-gray-500', icon: Coins };
                    return (
                      <div key={token.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${config.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{token.name}</p>
                          <p className="text-sm text-muted-foreground">{config.label}</p>
                        </div>
                        <Badge variant="outline">{token.status}</Badge>
                        <div className="text-right">
                          <p className="font-semibold">{token.value || 0}</p>
                          <p className="text-xs text-muted-foreground">{new Date(token.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(!userTokens || userTokens.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">Nenhum token emitido ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
