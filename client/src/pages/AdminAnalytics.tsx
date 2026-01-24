import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from "wouter";
import NavigationButtons from "@/components/NavigationButtons";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calculator,
  Download,
  Eye,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  RefreshCw,
  Bot,
  Target,
  ArrowRight,
  Percent,
  Route
} from "lucide-react";
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function AdminAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Date range state
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    switch (dateRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
    }
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [dateRange]);
  
  // Fetch analytics data
  const { data: dashboardMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = 
    trpc.analytics.dashboard.useQuery(
      { startDate, endDate },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: metricsByDay, isLoading: metricsByDayLoading } = 
    trpc.analytics.metricsByDay.useQuery(
      { startDate, endDate },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: jarvisStats, isLoading: jarvisLoading } = 
    trpc.analytics.jarvisStats.useQuery(
      { startDate, endDate },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: jarvisByDay } = 
    trpc.analytics.jarvisByDay.useQuery(
      { startDate, endDate },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: topQueries } = 
    trpc.analytics.topQueries.useQuery(
      { limit: 10 },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: conversionFunnel } = 
    trpc.analytics.conversionFunnel.useQuery(
      { startDate, endDate },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: conversionsBySource } = 
    trpc.analytics.conversionsBySource.useQuery(
      { startDate, endDate },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: topPages } = 
    trpc.analytics.topPages.useQuery(
      { startDate, endDate, limit: 10 },
      { enabled: isAuthenticated && isAdmin }
    );
  
  // Conversions queries
  const { data: conversionFunnelData } = 
    trpc.conversions.getFunnel.useQuery(
      { startDate: new Date(startDate), endDate: new Date(endDate) },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: attributionData } = 
    trpc.conversions.getAttribution.useQuery(
      { startDate: new Date(startDate), endDate: new Date(endDate) },
      { enabled: isAuthenticated && isAdmin }
    );
  
  const { data: conversionTrends } = 
    trpc.conversions.getTrends.useQuery(
      { days: dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90 },
      { enabled: isAuthenticated && isAdmin }
    );
  
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Acesso não autorizado.</p>
            <Link href="/admin">
              <Button className="mt-4">Voltar ao Admin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Prepare chart data
  const trafficChartData = metricsByDay?.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    pageViews: item.pageViews,
    visitors: item.uniqueVisitors,
    leads: item.leads,
  })) || [];
  
  const jarvisChartData = jarvisByDay?.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    interactions: item.count,
  })) || [];
  
  const funnelData = conversionFunnel ? [
    { name: 'Visitantes', value: conversionFunnel.uniqueVisitors, fill: COLORS[0] },
    { name: 'Page Views', value: conversionFunnel.pageViews, fill: COLORS[1] },
    { name: 'Leads', value: conversionFunnel.leads, fill: COLORS[2] },
    { name: 'Conversões', value: conversionFunnel.conversions, fill: COLORS[3] },
  ] : [];
  
  const sourceData = conversionsBySource?.map((item, index) => ({
    name: item.source || 'Direto',
    value: item.count,
    fill: COLORS[index % COLORS.length],
  })) || [];
  
  const jarvisSkillsData = jarvisStats ? [
    { name: 'Chat', value: jarvisStats.chatCount || 0 },
    { name: 'Calculadora', value: jarvisStats.calculatorCount || 0 },
    { name: 'Mentoria', value: jarvisStats.mentorshipCount || 0 },
    { name: 'Exportação', value: jarvisStats.exportCount || 0 },
    { name: 'Busca', value: jarvisStats.searchCount || 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Buttons */}
      <div className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <NavigationButtons showBack={true} backUrl="/admin" />
        </div>
      </div>
      
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AdminBreadcrumb items={[{ label: 'Analytics' }]} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg overflow-hidden">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-sm ${
                    dateRange === range 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchMetrics()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Page Views</span>
              </div>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : dashboardMetrics?.pageViews?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Visitantes</span>
              </div>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : dashboardMetrics?.uniqueVisitors?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Leads</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {metricsLoading ? '...' : dashboardMetrics?.totalLeads?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Jarvis</span>
              </div>
              <div className="text-2xl font-bold text-orange-500">
                {metricsLoading ? '...' : dashboardMetrics?.jarvisInteractions?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Calculadora</span>
              </div>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : dashboardMetrics?.calculatorUses?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">E-book</span>
              </div>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : dashboardMetrics?.ebookDownloads?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Whitepaper</span>
              </div>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : dashboardMetrics?.whitepaperDownloads?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Traffic Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tráfego do Site</CardTitle>
              <CardDescription>Page views e visitantes únicos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="pageViews" 
                      name="Page Views"
                      stroke="#f97316" 
                      fill="#f97316" 
                      fillOpacity={0.2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      name="Visitantes"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Jarvis Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Uso do Jarvis IA</CardTitle>
              <CardDescription>Interações diárias com o assistente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jarvisChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="interactions" name="Interações" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Funil de Conversão</CardTitle>
              <CardDescription>Da visita à conversão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Jarvis Skills Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills do Jarvis</CardTitle>
              <CardDescription>Distribuição por tipo de interação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jarvisSkillsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {jarvisSkillsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fontes de Conversão</CardTitle>
              <CardDescription>Origem dos leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Páginas Mais Visitadas</CardTitle>
              <CardDescription>Ranking por número de visualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPages?.slice(0, 8).map((page, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <div>
                        <div className="font-medium text-sm truncate max-w-[200px]">
                          {page.pageTitle || page.pagePath}
                        </div>
                        <div className="text-xs text-muted-foreground">{page.pagePath}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{page.views}</div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Jarvis Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Perguntas Frequentes ao Jarvis</CardTitle>
              <CardDescription>O que os usuários mais perguntam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topQueries?.slice(0, 8).map((query, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <div className="font-medium text-sm truncate max-w-[250px]">
                        {query.query}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{query.count}</div>
                      <div className="text-xs text-muted-foreground">vezes</div>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jarvis Performance */}
        {jarvisStats && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Performance do Jarvis</CardTitle>
              <CardDescription>Métricas de qualidade e satisfação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{jarvisStats.totalInteractions}</div>
                  <div className="text-sm text-muted-foreground">Total Interações</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {jarvisStats.avgResponseTime ? `${Math.round(jarvisStats.avgResponseTime)}ms` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo Médio</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {jarvisStats.successRate ? `${Math.round(jarvisStats.successRate)}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-500">
                      {jarvisStats.positiveFeedback || 0}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Positivos</div>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <ThumbsDown className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold text-red-500">
                      {jarvisStats.negativeFeedback || 0}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Negativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversion Analytics Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Análise de Conversões
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Route className="w-4 h-4" />
                  Funil de Conversão
                </CardTitle>
                <CardDescription>Jornada do visitante até a conversão</CardDescription>
              </CardHeader>
              <CardContent>
                {conversionFunnelData ? (
                  <div className="space-y-4">
                    {[
                      { label: 'Page Views', value: conversionFunnelData.funnel?.pageViews || 0, color: 'bg-blue-500' },
                      { label: 'Signups', value: conversionFunnelData.funnel?.signups || 0, color: 'bg-purple-500' },
                      { label: 'Calculadora', value: conversionFunnelData.funnel?.calculatorCompletes || 0, color: 'bg-orange-500' },
                      { label: 'Checkout', value: conversionFunnelData.funnel?.checkoutCompletes || 0, color: 'bg-green-500' },
                    ].map((step, index, arr) => (
                      <div key={step.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{step.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {step.value.toLocaleString()}
                            {index > 0 && arr[index - 1].value > 0 && (
                              <span className="ml-2 text-xs">
                                ({Math.round((step.value / arr[index - 1].value) * 100)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${step.color} transition-all duration-500`}
                            style={{ 
                              width: `${arr[0].value > 0 ? (step.value / arr[0].value) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        {index < arr.length - 1 && (
                          <div className="flex justify-center my-2">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Taxa de Conversão Total</span>
                        <span className="text-lg font-bold text-green-500">
                          {conversionFunnelData.conversionRates?.overallConversion 
                            ? conversionFunnelData.conversionRates.overallConversion
                            : '0%'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Carregando dados do funil...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Atribuição de Conversões
                </CardTitle>
                <CardDescription>Origem das conversões por canal</CardDescription>
              </CardHeader>
              <CardContent>
                {attributionData && attributionData.length > 0 ? (
                  <div className="space-y-3">
                    {attributionData.map((item: any, index: number) => (
                      <div key={item.source || index} className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {item.source || 'Direto'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.conversions} conversões
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full transition-all duration-500"
                              style={{ 
                                width: `${item.percentage || 0}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.percentage?.toFixed(1) || 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado de atribuição disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversion Trends */}
          {conversionTrends && conversionTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tendência de Conversões</CardTitle>
                <CardDescription>Evolução diária das conversões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={conversionTrends.map((item: any) => ({
                      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                      conversions: item.conversions || 0,
                      leads: item.leads || 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="leads" 
                        stackId="1"
                        stroke="#f97316" 
                        fill="#f97316" 
                        fillOpacity={0.3}
                        name="Leads"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="conversions" 
                        stackId="2"
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.3}
                        name="Conversões"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
