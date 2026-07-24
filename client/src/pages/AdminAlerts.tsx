import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Filter, 
  RefreshCw, 
  Settings, 
  XCircle,
  ArrowLeft,
  AlertCircle,
  Info,
  Zap,
  Play,
  Pause,
  Sliders,
  History,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type AlertSeverity = "critical" | "warning" | "info" | "success";
type AlertStatus = "active" | "acknowledged" | "resolved";

const severityConfig = {
  critical: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    badge: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    badge: "secondary" as const,
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    badge: "secondary" as const,
  },
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    badge: "default" as const,
  },
};

const statusConfig = {
  active: { label: "Ativo", color: "text-red-500" },
  acknowledged: { label: "Reconhecido", color: "text-yellow-500" },
  resolved: { label: "Resolvido", color: "text-green-500" },
};

export default function AdminAlerts() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [configOpen, setConfigOpen] = useState(false);

  // Queries reais do backend
  const { data: alertSummary, refetch: refetchSummary } = trpc.alerts.summary.useQuery();
  const { data: activeAlerts, refetch: refetchActive } = trpc.alerts.active.useQuery();
  const { data: alertHistory, refetch: refetchHistory } = trpc.alerts.history.useQuery({ limit: 100 });
  
  // AutoAlerts queries - usando apenas getStatus que retorna tudo
  const { data: autoAlertStatus, refetch: refetchAutoAlert } = trpc.autoAlerts.getStatus.useQuery();

  // Mutations
  const acknowledgeMutation = trpc.alerts.acknowledge.useMutation({
    onSuccess: () => {
      refetchActive();
      refetchSummary();
    },
    onError: (e) => toast.error(e.message || "Erro ao reconhecer alerta"),
  });

  const resolveMutation = trpc.alerts.resolve.useMutation({
    onSuccess: () => {
      refetchActive();
      refetchSummary();
      refetchHistory();
    },
    onError: (e) => toast.error(e.message || "Erro ao resolver alerta"),
  });

  const updateConfigMutation = trpc.autoAlerts.updateConfig.useMutation({
    onSuccess: () => {
      refetchAutoAlert();
      alert("Configuração salva com sucesso!");
    },
    onError: (e) => toast.error(e.message || "Erro ao salvar configuração"),
  });

  // Combinar alertas ativos e histórico
  const allAlerts = [
    ...(activeAlerts || []).map((a: any) => ({ ...a, status: a.acknowledged ? "acknowledged" : "active" })),
    ...(alertHistory || []).filter((h: any) => h.status === "resolved").slice(0, 20),
  ];

  const filteredAlerts = allAlerts.filter((alert: any) => {
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
    if (statusFilter !== "all" && alert.status !== statusFilter) return false;
    return true;
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchActive();
    refetchHistory();
  };

  const formatTimestamp = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  // Config form state - usando estrutura correta do backend
  const [configForm, setConfigForm] = useState({
    pendingCasesThresholdHours: autoAlertStatus?.config?.pendingCasesThresholdHours || 24,
    leadsWithoutFollowupDays: autoAlertStatus?.config?.leadsWithoutFollowupDays || 3,
    maxPendingCases: autoAlertStatus?.config?.criticalMetricsThresholds?.maxPendingCases || 10,
    minDailyLeads: autoAlertStatus?.config?.criticalMetricsThresholds?.minDailyLeads || 5,
  });

  const handleSaveConfig = () => {
    updateConfigMutation.mutate(configForm);
    setConfigOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/avancado">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className="w-6 h-6 text-primary" />
                  Painel de Alertas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitoramento e gestão de alertas do sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configuração de Alertas Automáticos</DialogTitle>
                    <DialogDescription>
                      Configure os thresholds e comportamento dos alertas automáticos do sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="thresholds">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
                      <TabsTrigger value="behavior">Comportamento</TabsTrigger>
                      <TabsTrigger value="history">Histórico</TabsTrigger>
                    </TabsList>
                    <TabsContent value="thresholds" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Casos Pendentes (horas)</Label>
                          <Input
                            type="number"
                            value={configForm.pendingCasesThresholdHours}
                            onChange={(e) => setConfigForm({ ...configForm, pendingCasesThresholdHours: Number(e.target.value) })}
                          />
                          <p className="text-xs text-muted-foreground">Alerta quando casos ficarem pendentes por mais tempo</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Leads sem Follow-up (dias)</Label>
                          <Input
                            type="number"
                            value={configForm.leadsWithoutFollowupDays}
                            onChange={(e) => setConfigForm({ ...configForm, leadsWithoutFollowupDays: Number(e.target.value) })}
                          />
                          <p className="text-xs text-muted-foreground">Alerta quando leads não tiverem follow-up</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Máximo de Casos Pendentes</Label>
                          <Input
                            type="number"
                            value={configForm.maxPendingCases}
                            onChange={(e) => setConfigForm({ ...configForm, maxPendingCases: Number(e.target.value) })}
                          />
                          <p className="text-xs text-muted-foreground">Alerta quando exceder este número de casos</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Mínimo de Leads Diários</Label>
                          <Input
                            type="number"
                            value={configForm.minDailyLeads}
                            onChange={(e) => setConfigForm({ ...configForm, minDailyLeads: Number(e.target.value) })}
                          />
                          <p className="text-xs text-muted-foreground">Alerta quando leads diários ficarem abaixo</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="behavior" className="space-y-4 mt-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Status Atual</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Casos Pendentes:</span>
                            <span className="ml-2 font-medium">{autoAlertStatus?.pendingCases?.count || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Leads Hoje:</span>
                            <span className="ml-2 font-medium">{autoAlertStatus?.criticalMetrics?.todayLeadsCount || 0}</span>
                          </div>
                        </div>
                        {(autoAlertStatus?.criticalMetrics?.alerts?.length ?? 0) > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="text-sm text-red-500 font-medium">Alertas Críticos:</span>
                            <ul className="mt-1 text-sm text-muted-foreground">
                              {autoAlertStatus?.criticalMetrics?.alerts?.map((alert: string, i: number) => (
                                <li key={i}>• {alert}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {autoAlertStatus?.pendingCases?.cases && autoAlertStatus.pendingCases.cases.length > 0 ? (
                          autoAlertStatus.pendingCases.cases.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div>
                                <p className="text-sm font-medium">{item.projectName || 'Caso #' + item.id}</p>
                                <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'N/A'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            Nenhum caso pendente
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setConfigOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveConfig} disabled={updateConfigMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configuração
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Auto Alerts Status */}
        {autoAlertStatus && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${autoAlertStatus.config ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                    {autoAlertStatus.config ? (
                      <Play className="w-5 h-5 text-green-500" />
                    ) : (
                      <Pause className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Alertas Automáticos</p>
                    <p className="text-sm text-muted-foreground">
                      {autoAlertStatus.config ? 'Monitoramento ativo' : 'Monitoramento pausado'}
                      {autoAlertStatus.criticalMetrics?.alerts?.length > 0 && ` • ${autoAlertStatus.criticalMetrics.alerts.length} alertas críticos`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={autoAlertStatus.config ? "default" : "secondary"}>
                    {autoAlertStatus.pendingCases?.count || 0} casos pendentes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Alertas</p>
                  <p className="text-2xl font-bold">{alertSummary?.totalActive || 0}</p>
                </div>
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className={(alertSummary?.totalActive || 0) > 0 ? "border-yellow-500/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-yellow-500">{alertSummary?.totalActive || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className={(alertSummary?.bySeverity?.P1 || 0) > 0 ? "border-red-500/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Críticos (P1)</p>
                  <p className="text-2xl font-bold text-red-500">{alertSummary?.bySeverity?.P1 || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Não Reconhecidos</p>
                  <p className="text-2xl font-bold text-green-500">{alertSummary?.unacknowledged || 0}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="acknowledged">Reconhecidos</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredAlerts.length} alertas encontrados
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum alerta encontrado</h3>
                <p className="text-muted-foreground">
                  Não há alertas correspondentes aos filtros selecionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert: any) => {
              const severity = (alert.severity || "info") as AlertSeverity;
              const config = severityConfig[severity];
              const StatusIcon = config.icon;
              const status = (alert.status || "active") as AlertStatus;
              
              return (
                <Card 
                  key={alert.id} 
                  className={`${config.border} border-l-4 ${
                    status === "resolved" ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{alert.title || alert.message}</h3>
                          <Badge variant={config.badge}>
                            {severity.charAt(0).toUpperCase() + severity.slice(1)}
                          </Badge>
                          <span className={`text-xs ${statusConfig[status].color}`}>
                            {statusConfig[status].label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description || alert.details || "Sem descrição"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {alert.source || "Sistema"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(alert.timestamp || alert.createdAt)}
                          </span>
                          {alert.acknowledgedBy && (
                            <span>Reconhecido por: {alert.acknowledgedBy}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === "active" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeMutation.mutate({ alertId: alert.id })}
                              disabled={acknowledgeMutation.isPending}
                            >
                              Reconhecer
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => resolveMutation.mutate({ alertId: alert.id })}
                              disabled={resolveMutation.isPending}
                            >
                              Resolver
                            </Button>
                          </>
                        )}
                        {status === "acknowledged" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => resolveMutation.mutate({ alertId: alert.id })}
                            disabled={resolveMutation.isPending}
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
