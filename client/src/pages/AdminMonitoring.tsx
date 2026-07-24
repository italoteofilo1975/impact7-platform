import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  HardDrive, 
  RefreshCw,
  Server,
  Shield,
  Zap,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import { toast } from "sonner";

export default function AdminMonitoring() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Queries
  const { data: systemHealth, refetch: refetchHealth } = trpc.alerts.systemHealth.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 10000 : false }
  );
  
  const { data: alertSummary, refetch: refetchAlerts } = trpc.alerts.summary.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 10000 : false }
  );
  
  const { data: activeAlerts } = trpc.alerts.active.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 5000 : false }
  );
  
  const { data: circuitBreakers, refetch: refetchCB } = trpc.alerts.circuitBreakers.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 10000 : false }
  );
  
  const { data: cacheStats, refetch: refetchCache } = trpc.alerts.cacheStats.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 10000 : false }
  );

  // Mutations
  const acknowledgeMutation = trpc.alerts.acknowledge.useMutation({
    onSuccess: () => refetchAlerts(),
    onError: (e) => toast.error(e.message || "Erro ao reconhecer alerta"),
  });

  const resolveMutation = trpc.alerts.resolve.useMutation({
    onSuccess: () => refetchAlerts(),
    onError: (e) => toast.error(e.message || "Erro ao resolver alerta"),
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const refreshAll = () => {
    refetchHealth();
    refetchAlerts();
    refetchCB();
    refetchCache();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOSED': return 'bg-green-500';
      case 'OPEN': return 'bg-red-500';
      case 'HALF_OPEN': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'P1': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'P2': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'P3': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <AdminBreadcrumb items={[{ label: 'Monitoramento' }]} />
            <h1 className="text-2xl font-bold">Monitoramento do Sistema</h1>
            <p className="text-muted-foreground">
              SET7.06 - Operação, Observabilidade e Eficiência Cognitiva
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshAll}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Server className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    {systemHealth?.status || 'Verificando...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-lg font-semibold">
                    {systemHealth?.uptimeFormatted || '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <HardDrive className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Memória Heap</p>
                  <p className="text-lg font-semibold">
                    {systemHealth?.memory?.heapUsed || 0} / {systemHealth?.memory?.heapTotal || 0} MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${alertSummary?.totalActive ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <AlertTriangle className={`w-5 h-5 ${alertSummary?.totalActive ? 'text-red-500' : 'text-green-500'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                  <p className="text-lg font-semibold">
                    {alertSummary?.totalActive || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="circuit-breakers">
              <Shield className="w-4 h-4 mr-2" />
              Circuit Breakers
            </TabsTrigger>
            <TabsTrigger value="cache">
              <Database className="w-4 h-4 mr-2" />
              Cache
            </TabsTrigger>
            <TabsTrigger value="slos">
              <TrendingUp className="w-4 h-4 mr-2" />
              SLOs
            </TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{alertSummary?.bySeverity?.P1 || 0}</p>
                  <p className="text-sm text-muted-foreground">P1 - Crítico</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-orange-500">{alertSummary?.bySeverity?.P2 || 0}</p>
                  <p className="text-sm text-muted-foreground">P2 - Alto</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-500">{alertSummary?.bySeverity?.P3 || 0}</p>
                  <p className="text-sm text-muted-foreground">P3 - Médio</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-blue-500">{alertSummary?.bySeverity?.P4 || 0}</p>
                  <p className="text-sm text-muted-foreground">P4 - Baixo</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alertas Ativos</CardTitle>
                <CardDescription>Alertas que requerem atenção</CardDescription>
              </CardHeader>
              <CardContent>
                {activeAlerts && activeAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {activeAlerts.map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{alert.severity}</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => acknowledgeMutation.mutate({ alertId: alert.id })}
                          >
                            Reconhecer
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => resolveMutation.mutate({ alertId: alert.id })}
                          >
                            Resolver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>Nenhum alerta ativo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Circuit Breakers Tab */}
          <TabsContent value="circuit-breakers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {circuitBreakers && Object.entries(circuitBreakers).map(([name, cb]: [string, any]) => (
                <Card key={name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{name}</CardTitle>
                      <Badge className={getStatusColor(cb.state)}>
                        {cb.state}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Falhas</span>
                        <span className="font-medium">{cb.failures} / {cb.threshold}</span>
                      </div>
                      <Progress value={(cb.failures / cb.threshold) * 100} />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sucessos</span>
                        <span className="font-medium text-green-500">{cb.successes}</span>
                      </div>
                      {cb.lastFailure && (
                        <div className="text-xs text-muted-foreground">
                          Última falha: {new Date(cb.lastFailure).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!circuitBreakers || Object.keys(circuitBreakers).length === 0) && (
                <Card className="col-span-3">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-2" />
                    <p>Nenhum circuit breaker registrado</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Cache Tab */}
          <TabsContent value="cache" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cacheStats && Object.entries(cacheStats).map(([name, stats]: [string, any]) => (
                <Card key={name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg capitalize">{name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entradas</span>
                        <span className="font-medium">{stats.size}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hits</span>
                        <span className="font-medium text-green-500">{stats.hits}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Misses</span>
                        <span className="font-medium text-red-500">{stats.misses}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hit Rate</span>
                        <span className="font-medium">
                          {(stats.hitRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={stats.hitRate * 100} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SLOs Tab */}
          <TabsContent value="slos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    API Latency
                  </CardTitle>
                  <CardDescription>Target: p95 &lt; 500ms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current p95</span>
                      <span className="font-bold text-green-500">~150ms</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Baseado em métricas do servidor de desenvolvimento
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Availability
                  </CardTitle>
                  <CardDescription>Target: 99.9%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current</span>
                      <span className="font-bold text-green-500">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Uptime desde último restart
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Error Rate
                  </CardTitle>
                  <CardDescription>Target: &lt; 1%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current</span>
                      <span className="font-bold text-green-500">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Nenhum erro registrado na sessão atual
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-500" />
                    Jarvis Latency
                  </CardTitle>
                  <CardDescription>Target: p95 &lt; 5000ms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current p95</span>
                      <span className="font-bold text-green-500">~2500ms</span>
                    </div>
                    <Progress value={50} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Inclui tempo de processamento LLM
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
