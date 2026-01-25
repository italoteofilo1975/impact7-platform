import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Clock, Activity, Server, Database, Zap } from "lucide-react";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  latency: number;
  uptime: number;
  lastChecked: Date;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  createdAt: number;
  updatedAt: number;
  updates: { message: string; timestamp: number }[];
}

export default function ApiStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API Principal", status: "operational", latency: 45, uptime: 99.98, lastChecked: new Date() },
    { name: "Autenticação", status: "operational", latency: 32, uptime: 99.99, lastChecked: new Date() },
    { name: "Banco de Dados", status: "operational", latency: 12, uptime: 99.95, lastChecked: new Date() },
    { name: "Jarvis IA", status: "operational", latency: 850, uptime: 99.90, lastChecked: new Date() },
    { name: "Webhooks", status: "operational", latency: 28, uptime: 99.97, lastChecked: new Date() },
    { name: "Storage S3", status: "operational", latency: 65, uptime: 99.99, lastChecked: new Date() },
  ]);
  
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "1",
      title: "Manutenção programada - Atualização de segurança",
      status: "resolved",
      severity: "minor",
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000 * 2 + 3600000),
      updates: [
        { message: "Manutenção concluída com sucesso. Todos os sistemas operacionais.", timestamp: new Date(Date.now() - 86400000 * 2 + 3600000) },
        { message: "Iniciando manutenção programada.", timestamp: new Date(Date.now() - 86400000 * 2) },
      ],
    },
  ]);
  
  const [uptimeHistory] = useState<{ date: string; uptime: number }[]>([
    { date: "Hoje", uptime: 100 },
    { date: "Ontem", uptime: 100 },
    { date: "2 dias", uptime: 99.98 },
    { date: "3 dias", uptime: 100 },
    { date: "4 dias", uptime: 100 },
    { date: "5 dias", uptime: 99.95 },
    { date: "6 dias", uptime: 100 },
    { date: "7 dias", uptime: 100 },
    { date: "8 dias", uptime: 100 },
    { date: "9 dias", uptime: 99.99 },
    { date: "10 dias", uptime: 100 },
    { date: "11 dias", uptime: 100 },
    { date: "12 dias", uptime: 100 },
    { date: "13 dias", uptime: 99.97 },
    { date: "14 dias", uptime: 100 },
  ]);
  
  // Simular atualização de status
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(s => ({
        ...s,
        latency: Math.max(10, s.latency + Math.floor(Math.random() * 20) - 10),
        lastChecked: new Date(),
      })));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const overallStatus = services.every(s => s.status === "operational") 
    ? "operational" 
    : services.some(s => s.status === "outage") 
      ? "outage" 
      : "degraded";
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "outage": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Operacional</Badge>;
      case "degraded": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Degradado</Badge>;
      case "outage": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Indisponível</Badge>;
      default: return null;
    }
  };
  
  const getServiceIcon = (name: string) => {
    if (name.includes("API")) return <Server className="h-5 w-5" />;
    if (name.includes("Banco")) return <Database className="h-5 w-5" />;
    if (name.includes("Jarvis")) return <Zap className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };
  
  const avgUptime = services.reduce((acc, s) => acc + s.uptime, 0) / services.length;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Status da API IMPACT7</h1>
              <p className="text-muted-foreground mt-1">
                Monitoramento em tempo real dos serviços
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                {getStatusIcon(overallStatus)}
                <span className="text-lg font-semibold">
                  {overallStatus === "operational" ? "Todos os sistemas operacionais" : 
                   overallStatus === "degraded" ? "Alguns sistemas degradados" : 
                   "Interrupção detectada"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Última verificação: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        <div className="grid gap-8">
          {/* Métricas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime (30 dias)</p>
                    <p className="text-2xl font-bold">{avgUptime.toFixed(2)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latência Média</p>
                    <p className="text-2xl font-bold">
                      {Math.round(services.reduce((acc, s) => acc + s.latency, 0) / services.length)}ms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-500/10">
                    <Server className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serviços Ativos</p>
                    <p className="text-2xl font-bold">
                      {services.filter(s => s.status === "operational").length}/{services.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <Activity className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Incidentes (30 dias)</p>
                    <p className="text-2xl font-bold">{incidents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Histórico de Uptime */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Uptime (últimos 15 dias)</CardTitle>
              <CardDescription>Disponibilidade diária dos serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 justify-between">
                {uptimeHistory.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-6 h-12 rounded ${
                        day.uptime === 100 ? "bg-green-500" : 
                        day.uptime >= 99.9 ? "bg-green-400" : 
                        day.uptime >= 99 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      title={`${day.date}: ${day.uptime}%`}
                    />
                    <span className="text-xs text-muted-foreground">{i === 0 ? "Hoje" : ""}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>15 dias atrás</span>
                <span>Hoje</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Status dos Serviços */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Serviços</CardTitle>
              <CardDescription>Estado atual de cada componente da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {getServiceIcon(service.name)}
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {service.uptime}% • Latência: {service.latency}ms
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Incidentes Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Incidentes Recentes</CardTitle>
              <CardDescription>Histórico de incidentes e manutenções</CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum incidente nos últimos 30 dias</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{incident.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {incident.createdAt.toLocaleDateString()} • {incident.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant={incident.status === "resolved" ? "outline" : "destructive"}>
                          {incident.status === "resolved" ? "Resolvido" : 
                           incident.status === "investigating" ? "Investigando" :
                           incident.status === "identified" ? "Identificado" : "Monitorando"}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {incident.updates.map((update, i) => (
                          <div key={i} className="flex gap-3 text-sm">
                            <span className="text-muted-foreground whitespace-nowrap">
                              {update.timestamp.toLocaleTimeString()}
                            </span>
                            <span>{update.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Informações de Contato */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Precisa de ajuda?</p>
                  <p className="text-sm text-muted-foreground">
                    Entre em contato com nossa equipe de suporte
                  </p>
                </div>
                <a 
                  href="/contato" 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Contatar Suporte
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
