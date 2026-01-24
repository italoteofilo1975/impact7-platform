import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Globe,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  latency?: number;
  lastCheck: Date;
}

interface Incident {
  id: number;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  createdAt: Date;
  updatedAt: Date;
  description: string;
}

const services: ServiceStatus[] = [
  { name: "API Principal", status: "operational", latency: 45, lastCheck: new Date() },
  { name: "Banco de Dados", status: "operational", latency: 12, lastCheck: new Date() },
  { name: "Autenticação", status: "operational", latency: 38, lastCheck: new Date() },
  { name: "Calculadora de Impacto", status: "operational", latency: 120, lastCheck: new Date() },
  { name: "Sistema de Notificações", status: "operational", latency: 25, lastCheck: new Date() },
  { name: "Processamento de Pagamentos", status: "operational", latency: 180, lastCheck: new Date() },
  { name: "CDN / Assets", status: "operational", latency: 15, lastCheck: new Date() },
  { name: "Webhooks", status: "operational", latency: 55, lastCheck: new Date() },
];

const recentIncidents: Incident[] = [
  {
    id: 1,
    title: "Manutenção Programada - Atualização de Banco de Dados",
    status: "resolved",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    description: "Manutenção programada para otimização do banco de dados. Duração estimada: 2 horas.",
  },
];

const uptimeHistory = [
  { date: "Hoje", uptime: 100 },
  { date: "Ontem", uptime: 100 },
  { date: "2 dias", uptime: 100 },
  { date: "3 dias", uptime: 99.9 },
  { date: "4 dias", uptime: 100 },
  { date: "5 dias", uptime: 100 },
  { date: "6 dias", uptime: 100 },
  { date: "7 dias", uptime: 99.8 },
  { date: "8 dias", uptime: 100 },
  { date: "9 dias", uptime: 100 },
  { date: "10 dias", uptime: 100 },
  { date: "11 dias", uptime: 100 },
  { date: "12 dias", uptime: 100 },
  { date: "13 dias", uptime: 100 },
  { date: "14 dias", uptime: 100 },
];

export default function Status() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const overallStatus = services.every((s) => s.status === "operational")
    ? "operational"
    : services.some((s) => s.status === "outage")
    ? "outage"
    : "degraded";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500">Operacional</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500">Degradado</Badge>;
      case "outage":
        return <Badge variant="destructive">Fora do Ar</Badge>;
      case "investigating":
        return <Badge variant="secondary">Investigando</Badge>;
      case "identified":
        return <Badge className="bg-yellow-500">Identificado</Badge>;
      case "monitoring":
        return <Badge className="bg-blue-500">Monitorando</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolvido</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "bg-green-500";
    if (uptime >= 99) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className={`py-16 px-4 ${
        overallStatus === "operational" 
          ? "bg-green-500/10" 
          : overallStatus === "degraded" 
          ? "bg-yellow-500/10" 
          : "bg-red-500/10"
      }`}>
        <div className="container max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {getStatusIcon(overallStatus)}
            <h1 className="text-3xl md:text-4xl font-bold">
              {overallStatus === "operational"
                ? "Todos os Sistemas Operacionais"
                : overallStatus === "degraded"
                ? "Alguns Sistemas com Problemas"
                : "Interrupção de Serviço"}
            </h1>
          </div>
          <p className="text-muted-foreground mb-4">
            Última atualização: {lastUpdate.toLocaleString("pt-BR")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </section>

      {/* Uptime History */}
      <section className="py-8 px-4 border-b">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Histórico de Uptime (últimos 14 dias)</h2>
            <span className="text-sm text-muted-foreground">99.98% média</span>
          </div>
          <div className="flex gap-1">
            {uptimeHistory.map((day, index) => (
              <div
                key={index}
                className="flex-1 group relative"
                title={`${day.date}: ${day.uptime}%`}
              >
                <div
                  className={`h-8 rounded ${getUptimeColor(day.uptime)} opacity-80 hover:opacity-100 transition-opacity`}
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap">
                  {day.uptime}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-8 text-xs text-muted-foreground">
            <span>14 dias atrás</span>
            <span>Hoje</span>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl">
          <h2 className="text-xl font-bold mb-6">Status dos Serviços</h2>
          <div className="space-y-3">
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {service.latency && (
                      <span className="text-sm text-muted-foreground">
                        {service.latency}ms
                      </span>
                    )}
                    {getStatusBadge(service.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-xl font-bold mb-6">Incidentes Recentes</h2>
          {recentIncidents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum incidente nos últimos 14 dias
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <Card key={incident.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{incident.title}</CardTitle>
                      {getStatusBadge(incident.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {incident.description}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        Criado: {incident.createdAt.toLocaleDateString("pt-BR")}
                      </span>
                      <span>
                        Atualizado: {incident.updatedAt.toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl text-center">
          <h2 className="text-xl font-bold mb-4">Receba Atualizações de Status</h2>
          <p className="text-muted-foreground mb-6">
            Inscreva-se para receber notificações sobre incidentes e manutenções programadas
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              RSS Feed
            </Button>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Inscrever-se
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
