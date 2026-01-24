import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Database,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  Bell,
  Shield,
  Cpu,
  HardDrive,
  Zap,
} from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function AdminSystemMetrics() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { data: metrics, isLoading, refetch } = trpc.systemMetrics.getMetrics.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 30000 : false }
  );
  
  const { data: history } = trpc.systemMetrics.getHistory.useQuery(
    { minutes: 60 },
    { refetchInterval: autoRefresh ? 30000 : false }
  );
  
  const { data: health } = trpc.systemMetrics.health.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 10000 : false }
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(" ") || "< 1m";
  };

  const getSLOStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getSLOStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <AdminBreadcrumb items={[{ label: "Métricas do Sistema" }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Métricas do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da plataforma
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status de Saúde
            </CardTitle>
            <Badge
              variant={health?.status === "healthy" ? "default" : "destructive"}
              className={health?.status === "healthy" ? "bg-green-500" : ""}
            >
              {health?.status?.toUpperCase() || "CHECKING..."}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {health?.checks && Object.entries(health.checks).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="capitalize">{key}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SLOs */}
      {metrics?.slos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Service Level Objectives (SLOs)
            </CardTitle>
            <CardDescription>
              Monitoramento de objetivos de nível de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Availability */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Disponibilidade</span>
                  {getSLOStatusIcon(metrics.slos.availability.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={metrics.slos.availability.current} 
                    className="flex-1"
                  />
                  <span className={`text-sm font-medium ${getSLOStatusColor(metrics.slos.availability.status)}`}>
                    {metrics.slos.availability.current.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {metrics.slos.availability.target}%
                </p>
              </div>

              {/* Latency */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Latência (p95)</span>
                  {getSLOStatusIcon(metrics.slos.latency.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={metrics.slos.latency.current} 
                    className="flex-1"
                  />
                  <span className={`text-sm font-medium ${getSLOStatusColor(metrics.slos.latency.status)}`}>
                    {metrics.slos.latency.current.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt; 500ms
                </p>
              </div>

              {/* Error Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Taxa de Erros</span>
                  {getSLOStatusIcon(metrics.slos.errorRate.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={100 - metrics.slos.errorRate.current} 
                    className="flex-1"
                  />
                  <span className={`text-sm font-medium ${getSLOStatusColor(metrics.slos.errorRate.status)}`}>
                    {metrics.slos.errorRate.current.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt; 1%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="application">Aplicação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold">
                      {metrics ? formatUptime(metrics.uptime) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Cpu className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Memória Heap</p>
                    <p className="text-2xl font-bold">
                      {metrics ? `${metrics.memory.heapUsedPercent}%` : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Req/min</p>
                    <p className="text-2xl font-bold">
                      {metrics?.performance.requestsPerMinute || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latência Média</p>
                    <p className="text-2xl font-bold">
                      {metrics?.performance.avgResponseTime || 0}ms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request History Chart */}
          {history && history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Requisições (última hora)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(ts) => new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(ts) => new Date(ts).toLocaleTimeString("pt-BR")}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="requestCount" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        name="Requisições"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Latência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Média</span>
                  <span className="font-mono">{metrics?.performance.avgResponseTime || 0}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>P95</span>
                  <span className="font-mono">{metrics?.performance.p95ResponseTime || 0}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>P99</span>
                  <span className="font-mono">{metrics?.performance.p99ResponseTime || 0}ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Erros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Taxa de Erros</span>
                  <span className={`font-mono ${(metrics?.performance.errorRate || 0) > 1 ? "text-red-500" : "text-green-500"}`}>
                    {metrics?.performance.errorRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Requisições/min</span>
                  <span className="font-mono">{metrics?.performance.requestsPerMinute || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latency Chart */}
          {history && history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Latência ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(ts) => new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(ts) => new Date(ts).toLocaleTimeString("pt-BR")}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avgDuration" 
                        stroke="#10b981" 
                        name="Latência Média (ms)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários</p>
                    <p className="text-2xl font-bold">
                      {metrics?.database.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-2xl font-bold">
                      {metrics?.database.totalLeads || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <FileText className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cases</p>
                    <p className="text-2xl font-bold">
                      {metrics?.database.totalCases || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cases Pendentes</p>
                    <p className="text-2xl font-bold">
                      {metrics?.database.pendingCases || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total</span>
                  <span className="font-mono">{metrics?.database.totalNotifications || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Não Lidas</span>
                  <span className="font-mono text-orange-500">{metrics?.database.unreadNotifications || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auditoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total de Logs</span>
                  <span className="font-mono">{metrics?.database.totalAuditLogs || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Contatos</span>
                  <span className="font-mono">{metrics?.database.totalContacts || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários Ativos (24h)</p>
                    <p className="text-2xl font-bold">
                      {metrics?.application.activeUsers24h || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Novos Leads (24h)</p>
                    <p className="text-2xl font-bold">
                      {metrics?.application.newLeads24h || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Novos Leads (7d)</p>
                    <p className="text-2xl font-bold">
                      {metrics?.application.newLeads7d || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <FileText className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cases Submetidos (24h)</p>
                    <p className="text-2xl font-bold">
                      {metrics?.application.casesSubmitted24h || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cases Aprovados (24h)</p>
                    <p className="text-2xl font-bold">
                      {metrics?.application.casesApproved24h || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Bell className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notificações (24h)</p>
                    <p className="text-2xl font-bold">
                      {metrics?.application.notificationsSent24h || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Memory Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Uso de Memória
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Heap Used</span>
                    <span>{metrics ? formatBytes(metrics.memory.heapUsed) : "-"}</span>
                  </div>
                  <Progress value={metrics?.memory.heapUsedPercent || 0} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Heap Total</p>
                    <p className="font-mono">{metrics ? formatBytes(metrics.memory.heapTotal) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">External</p>
                    <p className="font-mono">{metrics ? formatBytes(metrics.memory.external) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RSS</p>
                    <p className="font-mono">{metrics ? formatBytes(metrics.memory.rss) : "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
