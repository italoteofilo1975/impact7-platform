import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, Redirect } from "wouter";
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  AlertTriangle,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Server,
  BarChart3
} from "lucide-react";

type TimeRange = "hour" | "day" | "week";

export default function AdminApiMetrics() {
  const { user, loading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("hour");
  
  // Queries
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = 
    trpc.apiMetrics.getSummary.useQuery({ timeRange });
  
  const { data: endpoints, isLoading: endpointsLoading } = 
    trpc.apiMetrics.getEndpoints.useQuery({ timeRange });
  
  const { data: clients, isLoading: clientsLoading } = 
    trpc.apiMetrics.getClients.useQuery({ timeRange });
  
  const { data: timeSeries, isLoading: timeSeriesLoading } = 
    trpc.apiMetrics.getTimeSeries.useQuery({ timeRange });
  
  const { data: errors, isLoading: errorsLoading } = 
    trpc.apiMetrics.getErrors.useQuery({ timeRange });
  
  // Verificar autenticação e permissão
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }
  
  const isLoading = summaryLoading || endpointsLoading || clientsLoading || timeSeriesLoading || errorsLoading;
  
  const timeRangeLabels: Record<TimeRange, string> = {
    hour: "Última hora",
    day: "Últimas 24h",
    week: "Última semana",
  };
  
  // Calcular max para gráfico de barras simples
  const maxRequests = timeSeries ? Math.max(...timeSeries.map(p => p.requests), 1) : 1;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Métricas da API
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitoramento de uso e performance
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Última hora</SelectItem>
                  <SelectItem value="day">Últimas 24h</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={() => refetchSummary()}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total de Requisições
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summary?.totalRequests.toLocaleString() || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {summary?.requestsPerMinute || 0} req/min
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo de Resposta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summary?.avgResponseTime || 0}ms
              </div>
              <p className="text-sm text-muted-foreground">
                P95: {summary?.p95ResponseTime || 0}ms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Taxa de Erros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(summary?.errorRate || 0) > 5 ? "text-destructive" : "text-green-500"}`}>
                {summary?.errorRate || 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                {summary?.totalErrors || 0} erros
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes Ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summary?.uniqueClients || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {timeRangeLabels[timeRange]}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráfico de Série Temporal (simplificado) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Requisições ao Longo do Tempo
            </CardTitle>
            <CardDescription>
              Distribuição de requisições no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeSeriesLoading ? (
              <div className="h-40 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-40 flex items-end gap-1">
                {timeSeries?.map((point, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        point.errors > 0 ? "bg-destructive/50" : "bg-primary"
                      }`}
                      style={{ height: `${(point.requests / maxRequests) * 100}%`, minHeight: "2px" }}
                      title={`${point.requests} requisições, ${point.errors} erros`}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>
                {timeSeries?.[0] 
                  ? new Date(timeSeries[0].timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                  : "-"
                }
              </span>
              <span>
                {timeSeries?.[timeSeries.length - 1]
                  ? new Date(timeSeries[timeSeries.length - 1].timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                  : "-"
                }
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs de Detalhes */}
        <Tabs defaultValue="endpoints">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="errors">Erros</TabsTrigger>
          </TabsList>
          
          {/* Endpoints */}
          <TabsContent value="endpoints" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Endpoints Mais Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {endpointsLoading ? (
                  <div className="py-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : endpoints && endpoints.length > 0 ? (
                  <div className="space-y-4">
                    {endpoints.slice(0, 10).map((endpoint, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={endpoint.method === "GET" ? "secondary" : "default"} className="font-mono text-xs">
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm">{endpoint.endpoint}</code>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{endpoint.totalRequests.toLocaleString()} req</span>
                            <span className="text-muted-foreground">{endpoint.avgResponseTime}ms</span>
                            <span className={endpoint.errorRate > 5 ? "text-destructive" : "text-green-500"}>
                              {endpoint.errorRate}% erros
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={(endpoint.totalRequests / (endpoints[0]?.totalRequests || 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma requisição registrada no período</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Clientes */}
          <TabsContent value="clients" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clientes Mais Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="py-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : clients && clients.length > 0 ? (
                  <div className="space-y-4">
                    {clients.slice(0, 10).map((client, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="font-mono text-sm">{client.clientId}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{client.totalRequests.toLocaleString()} req</span>
                            <span className="text-muted-foreground">{client.avgResponseTime}ms avg</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {client.topEndpoints.map((ep, epIndex) => (
                            <Badge key={epIndex} variant="outline" className="text-xs">
                              {ep.endpoint} ({ep.count})
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Última requisição: {new Date(client.lastRequest).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum cliente registrado no período</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Erros */}
          <TabsContent value="errors" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Por Status Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    Erros por Status Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {errorsLoading ? (
                    <div className="py-8 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : errors?.byStatusCode && errors.byStatusCode.length > 0 ? (
                    <div className="space-y-3">
                      {errors.byStatusCode.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <Badge variant="destructive" className="font-mono">
                            {item.code}
                          </Badge>
                          <span className="text-sm">{item.count} ocorrências</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum erro registrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Por Endpoint */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-destructive" />
                    Erros por Endpoint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {errorsLoading ? (
                    <div className="py-8 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : errors?.byEndpoint && errors.byEndpoint.length > 0 ? (
                    <div className="space-y-3">
                      {errors.byEndpoint.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <code className="text-sm truncate max-w-[200px]">{item.endpoint}</code>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.count}</span>
                            <Badge variant="outline" className="text-destructive">
                              {item.rate}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum erro registrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Erros Recentes */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Erros Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {errorsLoading ? (
                  <div className="py-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : errors?.recentErrors && errors.recentErrors.length > 0 ? (
                  <div className="space-y-2">
                    {errors.recentErrors.map((error, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="destructive" className="font-mono">
                            {error.statusCode}
                          </Badge>
                          <code className="text-sm">{error.endpoint}</code>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">{error.clientId.slice(0, 8)}...</span>
                          <span>{new Date(error.timestamp).toLocaleTimeString("pt-BR")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum erro recente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
