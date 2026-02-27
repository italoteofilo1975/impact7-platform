import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Settings,
  Shield,
  Database,
  Server,
  Activity,
  Users,
  FileText,
  Key,
  Webhook,
  BarChart3,
  Bell,
  Globe,
  Coins,
  Award,
  Brain,
  RefreshCw,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Cpu,
  HardDrive,
  Wifi,
  ArrowLeft,
  Download,
  Upload,
  Trash2,
  Clock,
  Play,
  Pause,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Componente para enviar notificações de teste
function TestNotificationButton() {
  const [selectedType, setSelectedType] = useState<string>('info');
  const [isSending, setIsSending] = useState(false);
  
  const sendTestMutation = trpc.userNotifications.sendTestNotification.useMutation({
    onSuccess: () => {
      toast.success('Notificação de teste enviada!', {
        description: `Tipo: ${selectedType}`,
      });
      setIsSending(false);
    },
    onError: (error: { message: string }) => {
      toast.error('Erro ao enviar notificação', {
        description: error.message,
      });
      setIsSending(false);
    },
  });

  const handleSendTest = () => {
    setIsSending(true);
    sendTestMutation.mutate({ type: selectedType as any });
  };

  return (
    <div className="col-span-2 p-4 rounded-lg border bg-gradient-to-r from-blue-500/10 to-purple-500/10">
      <div className="flex items-center gap-4">
        <Bell className="w-8 h-8 text-blue-500" />
        <div className="flex-1">
          <p className="font-medium">Enviar Notificação de Teste</p>
          <p className="text-sm text-muted-foreground">Testar sistema de notificações SSE em tempo real</p>
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="warning">Aviso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
            <SelectItem value="case_approved">Case Aprovado</SelectItem>
            <SelectItem value="certificate_issued">Certificado</SelectItem>
            <SelectItem value="token_earned">Token Ganho</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleSendTest} 
          disabled={isSending}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
          ) : (
            <><Bell className="w-4 h-4 mr-2" />Enviar Teste</>
          )}
        </Button>
      </div>
    </div>
  );
}

// Componente de Dashboard de Métricas SSE
function SSEMetricsDashboard() {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = trpc.sseMetrics.getMetrics.useQuery(undefined, {
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
  const { data: clientsData, isLoading: clientsLoading } = trpc.sseMetrics.getClients.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const { data: history, isLoading: historyLoading } = trpc.sseMetrics.getHistory.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conexões Ativas</p>
                <p className="text-3xl font-bold text-green-500">{metrics?.activeConnections || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Conexões</p>
                <p className="text-3xl font-bold">{metrics?.totalConnections || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notificações Enviadas</p>
                <p className="text-3xl font-bold text-purple-500">{metrics?.notificationsSent || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime SSE</p>
                <p className="text-2xl font-bold text-teal-500">{metrics?.uptimeFormatted || '0s'}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-teal-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Clientes Conectados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Clientes Conectados
              <Badge variant="outline" className="ml-auto">
                {clientsData?.byRole.admins || 0} admins / {clientsData?.byRole.users || 0} usuários
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : clientsData?.clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wifi className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum cliente conectado</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {clientsData?.clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${client.role === 'admin' ? 'bg-purple-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{client.userId.slice(0, 12)}...</p>
                        <p className="text-xs text-muted-foreground">{client.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Conectado há</p>
                      <p className="text-sm font-medium">{formatDuration(Date.now() - client.connectedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Histórico de Notificações
              <Badge variant="outline" className="ml-auto">
                Últimas {history?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : history?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma notificação enviada</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history?.map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">{notif.type}</Badge>
                      <p className="text-sm font-medium truncate max-w-[150px]">{notif.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{notif.recipientCount} destinatários</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(notif.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notificações por Tipo */}
      {metrics?.notificationsByType && Object.keys(metrics.notificationsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Notificações por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(metrics.notificationsByType).map(([type, count]) => (
                <div key={type} className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Estatísticas Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Duração Média de Conexão</p>
              <p className="text-xl font-bold">{formatDuration(metrics?.averageConnectionDuration || 0)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Última Notificação</p>
              <p className="text-xl font-bold">
                {metrics?.lastNotificationAt ? formatTimestamp(metrics.lastNotificationAt) : 'Nunca'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
              <p className="text-xl font-bold text-green-500">100%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Atualizar */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => refetchMetrics()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Métricas
        </Button>
      </div>
    </div>
  );
}

// Componente de Dashboard do Agendador
function SchedulerDashboard() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = trpc.scheduler.getStatus.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.scheduler.getTasks.useQuery();
  const { data: logs, isLoading: logsLoading } = trpc.scheduler.getLogs.useQuery({ limit: 20 });

  const startMutation = trpc.scheduler.start.useMutation({
    onSuccess: () => {
      toast.success('Agendador iniciado!');
      refetchStatus();
    },
    onError: (error) => toast.error('Erro ao iniciar', { description: error.message }),
  });

  const stopMutation = trpc.scheduler.stop.useMutation({
    onSuccess: () => {
      toast.success('Agendador parado!');
      refetchStatus();
    },
    onError: (error) => toast.error('Erro ao parar', { description: error.message }),
  });

  const triggerMutation = trpc.scheduler.triggerTask.useMutation({
    onSuccess: () => {
      toast.success('Tarefa executada!');
      refetchTasks();
    },
    onError: (error) => toast.error('Erro ao executar', { description: error.message }),
  });

  const setEnabledMutation = trpc.scheduler.setTaskEnabled.useMutation({
    onSuccess: () => {
      toast.success('Tarefa atualizada!');
      refetchTasks();
    },
    onError: (error) => toast.error('Erro ao atualizar', { description: error.message }),
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (statusLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status do Agendador */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-2xl font-bold ${status?.isRunning ? 'text-green-500' : 'text-red-500'}`}>
                  {status?.isRunning ? 'Ativo' : 'Parado'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status?.isRunning ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {status?.isRunning ? <Play className="w-6 h-6 text-green-500" /> : <Pause className="w-6 h-6 text-red-500" />}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Tarefas</p>
                <p className="text-3xl font-bold">{status?.taskCount || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarefas Ativas</p>
                <p className="text-3xl font-bold text-green-500">{status?.enabledTaskCount || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Execução</p>
                <p className="text-lg font-bold">
                  {status?.lastExecution ? formatDate(new Date(status.lastExecution.startedAt)) : 'Nunca'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Controles do Agendador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => startMutation.mutate()}
              disabled={status?.isRunning || startMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {startMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Iniciar
            </Button>
            <Button
              onClick={() => stopMutation.mutate()}
              disabled={!status?.isRunning || stopMutation.isPending}
              variant="destructive"
            >
              {stopMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pause className="w-4 h-4 mr-2" />}
              Parar
            </Button>
            <Button variant="outline" onClick={() => { refetchStatus(); refetchTasks(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tarefas Agendadas
          </CardTitle>
          <CardDescription>Gerencie as tarefas automáticas do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks?.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${task.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Cron: <code className="bg-muted px-1 rounded">{task.cronExpression}</code></span>
                      <span>Próxima: {formatDate(task.nextRun)}</span>
                      {task.lastRun && <span>Última: {formatDate(task.lastRun)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={task.isEnabled}
                    onCheckedChange={(checked) => setEnabledMutation.mutate({ taskId: task.id, enabled: checked })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerMutation.mutate({ taskId: task.id })}
                    disabled={triggerMutation.isPending}
                  >
                    {triggerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs de Execução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Logs de Execução
            <Badge variant="outline" className="ml-auto">Últimos {logs?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : logs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma execução registrada</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs?.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' :
                      log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{log.taskName}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.status === 'success' ? log.result : log.error}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                      {log.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(new Date(log.startedAt))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: typeof Settings;
  href: string;
  badge?: string;
  status?: 'active' | 'warning' | 'error';
}

const ADMIN_SECTIONS: AdminSection[] = [
  { id: 'users', title: 'Gestão de Usuários', description: 'Gerenciar usuários e permissões', icon: Users, href: '/admin', status: 'active' },
  { id: 'cases', title: 'Revisão de Cases', description: 'Aprovar e gerenciar cases', icon: FileText, href: '/admin/cases', badge: '3 pendentes', status: 'warning' },
  { id: 'analytics', title: 'Analytics', description: 'Métricas de uso', icon: BarChart3, href: '/admin/analytics', status: 'active' },
  { id: 'monitoring', title: 'Monitoramento', description: 'Status e alertas', icon: Activity, href: '/admin/monitoring', status: 'active' },
  { id: 'api-metrics', title: 'Métricas de API', description: 'Performance dos endpoints', icon: Server, href: '/admin/api-metrics', status: 'active' },
  { id: 'tags', title: 'Gestão de Tags', description: 'Tags para cases', icon: Globe, href: '/admin/tags', status: 'active' },
  { id: 'tokens', title: 'Dashboard de Tokens', description: 'Tokens de Impacto Social', icon: Coins, href: '/admin/tokens', status: 'active' },
  { id: 'certificates', title: 'Certificados', description: 'Certificados blockchain', icon: Award, href: '/certificados/verificar', status: 'active' },
  { id: 'jarvis', title: 'Relatórios Jarvis', description: 'IA e relatórios', icon: Brain, href: '/jarvis/relatorios', status: 'active' },
  { id: 'api-keys', title: 'Chaves de API', description: 'Gerenciar chaves', icon: Key, href: '/api/keys', status: 'active' },
  { id: 'webhooks', title: 'Webhooks', description: 'Integrações', icon: Webhook, href: '/webhooks', status: 'active' },
  { id: 'notifications', title: 'Notificações', description: 'Alertas', icon: Bell, href: '/notificacoes', status: 'active' },
];

export default function AdminAdvanced() {
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const systemStats = { cpu: 45, memory: 62, disk: 38, network: 'healthy', uptime: '15d 4h 32m', requests: 12453, errors: 23, avgResponseTime: 145 };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">Esta área é restrita a administradores.</p>
            <Button asChild className="mt-4">
              <Link href="/admin"><ArrowLeft className="w-4 h-4 mr-2" />Voltar ao Admin</Link>
            </Button>
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
            <AdminBreadcrumb items={[{ label: 'Avançado' }]} />
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="w-7 h-7 text-primary" />
              Administração Avançada
            </h1>
            <p className="text-muted-foreground mt-1">Controle total do sistema IMPACT7</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />Atualizar
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">CPU</p><p className="text-2xl font-bold">{systemStats.cpu}%</p></div>
                <Cpu className="w-8 h-8 text-blue-500" />
              </div>
              <Progress value={systemStats.cpu} className="h-2 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Memória</p><p className="text-2xl font-bold">{systemStats.memory}%</p></div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
              <Progress value={systemStats.memory} className="h-2 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Disco</p><p className="text-2xl font-bold">{systemStats.disk}%</p></div>
                <HardDrive className="w-8 h-8 text-green-500" />
              </div>
              <Progress value={systemStats.disk} className="h-2 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Rede</p><p className="text-2xl font-bold capitalize">{systemStats.network}</p></div>
                <Wifi className="w-8 h-8 text-teal-500" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Uptime: {systemStats.uptime}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sse">SSE em Tempo Real</TabsTrigger>
            <TabsTrigger value="scheduler">Agendador</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
            <TabsTrigger value="featureFlags">Feature Flags</TabsTrigger>
            <TabsTrigger value="emailDigest">Email Digest</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acesso Rápido</CardTitle>
                <CardDescription>Todas as áreas administrativas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {ADMIN_SECTIONS.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <Link key={section.id} href={section.href}>
                        <div className="p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all cursor-pointer group">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.status === 'warning' ? 'bg-yellow-500/10' : 'bg-primary/10'}`}>
                              <IconComponent className={`w-5 h-5 ${section.status === 'warning' ? 'text-yellow-500' : 'text-primary'}`} />
                            </div>
                            {section.badge && <Badge variant="secondary">{section.badge}</Badge>}
                          </div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{section.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" />Atividade Recente</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Case aprovado', user: 'Admin', time: '2 min atrás', type: 'success' },
                    { action: 'Novo usuário registrado', user: 'Sistema', time: '15 min atrás', type: 'info' },
                    { action: 'Certificado emitido', user: 'Admin', time: '1h atrás', type: 'success' },
                    { action: 'Alerta de rate limit', user: 'Sistema', time: '2h atrás', type: 'warning' },
                    { action: 'Backup automático concluído', user: 'Sistema', time: '6h atrás', type: 'info' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' : activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                      <div className="flex-1"><p className="font-medium">{activity.action}</p><p className="text-sm text-muted-foreground">Por: {activity.user}</p></div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sse" className="space-y-6">
            <SSEMetricsDashboard />
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-6">
            <SchedulerDashboard />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Server className="w-5 h-5" />Informações do Sistema</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Versão</span><span className="font-medium">IMPACT7 v2.5.0</span></div>
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Ambiente</span><Badge>Produção</Badge></div>
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Uptime</span><span className="font-medium">{systemStats.uptime}</span></div>
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Requisições (24h)</span><span className="font-medium">{systemStats.requests.toLocaleString()}</span></div>
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Erros (24h)</span><span className="font-medium text-red-500">{systemStats.errors}</span></div>
                    <div className="flex justify-between py-2"><span className="text-muted-foreground">Tempo de Resposta Médio</span><span className="font-medium">{systemStats.avgResponseTime}ms</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" />Banco de Dados</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Tipo</span><span className="font-medium">MySQL/TiDB</span></div>
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Status</span><Badge variant="outline" className="bg-green-500/10 text-green-500">Conectado</Badge></div>
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Tabelas</span><span className="font-medium">29</span></div>
                    <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Conexões Ativas</span><span className="font-medium">12</span></div>
                    <div className="flex justify-between py-2"><span className="text-muted-foreground">Último Backup</span><span className="font-medium">Hoje, 06:00</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Configurações de Segurança</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between"><div><p className="font-medium">Autenticação de Dois Fatores</p><p className="text-sm text-muted-foreground">Exigir 2FA para administradores</p></div><Switch checked={true} /></div>
                  <Separator />
                  <div className="flex items-center justify-between"><div><p className="font-medium">Rate Limiting</p><p className="text-sm text-muted-foreground">Limitar requisições por IP</p></div><Switch checked={true} /></div>
                  <Separator />
                  <div className="flex items-center justify-between"><div><p className="font-medium">Logs de Auditoria</p><p className="text-sm text-muted-foreground">Registrar todas as ações administrativas</p></div><Switch checked={true} /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Modo de Manutenção</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div><p className="font-medium">Modo de Manutenção</p><p className="text-sm text-muted-foreground">Apenas administradores podem acessar</p></div>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div><p className="font-medium">Modo Debug</p><p className="text-sm text-muted-foreground">Exibir informações detalhadas de erro</p></div>
                    <Switch checked={debugMode} onCheckedChange={setDebugMode} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Ações de Manutenção</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4 justify-start"><RefreshCw className="w-5 h-5 mr-3" /><div className="text-left"><p className="font-medium">Limpar Cache</p><p className="text-sm text-muted-foreground">Limpar cache do sistema</p></div></Button>
                  <Button variant="outline" className="h-auto py-4 justify-start"><Download className="w-5 h-5 mr-3" /><div className="text-left"><p className="font-medium">Backup Manual</p><p className="text-sm text-muted-foreground">Criar backup do banco</p></div></Button>
                  <Button variant="outline" className="h-auto py-4 justify-start"><Upload className="w-5 h-5 mr-3" /><div className="text-left"><p className="font-medium">Restaurar Backup</p><p className="text-sm text-muted-foreground">Restaurar backup anterior</p></div></Button>
                  <Button variant="outline" className="h-auto py-4 justify-start text-red-500"><Trash2 className="w-5 h-5 mr-3" /><div className="text-left"><p className="font-medium">Limpar Logs Antigos</p><p className="text-sm text-muted-foreground">Remover logs &gt; 30 dias</p></div></Button>
                  <TestNotificationButton />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="featureFlags" className="space-y-6">
            <FeatureFlagsPanel />
          </TabsContent>

          {/* Email Digest Tab */}
          <TabsContent value="emailDigest" className="space-y-6">
            <EmailDigestPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Componente de Feature Flags
function FeatureFlagsPanel() {
  const { data: flags, isLoading, refetch } = trpc.featureFlags.getAll.useQuery();
  const upsertFlagMutation = trpc.featureFlags.upsert.useMutation({
    onSuccess: () => {
      toast.success('Feature flag atualizada!');
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error('Erro ao atualizar flag', { description: error.message });
    },
  });

  const handleToggle = (flag: any) => {
    upsertFlagMutation.mutate({ 
      key: flag.key, 
      name: flag.name || flag.key,
      isEnabled: !flag.isEnabled 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Feature Flags
        </CardTitle>
        <CardDescription>
          Controle funcionalidades da plataforma em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flags && flags.length > 0 ? (
            flags.map((flag: any) => (
              <div key={flag.key} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{flag.name || flag.key}</p>
                    <Badge variant={flag.isEnabled ? 'default' : 'secondary'}>
                      {flag.isEnabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {flag.description || `Flag: ${flag.key}`}
                  </p>
                  {flag.updatedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Última atualização: {new Date(flag.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
                <Switch
                  checked={flag.isEnabled}
                  onCheckedChange={() => handleToggle(flag)}
                  disabled={upsertFlagMutation.isPending}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma feature flag configurada</p>
              <p className="text-sm mt-1">Feature flags são criadas automaticamente pelo sistema</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Email Digest
function EmailDigestPanel() {
  const { data: digestStatus, isLoading, refetch } = trpc.emailDigest.getStatus.useQuery();
  const { data: digestPreview } = trpc.emailDigest.preview.useQuery({ frequency: 'weekly' });
  const sendDigestMutation = trpc.emailDigest.sendNow.useMutation({
    onSuccess: (result: { sent: number; failed: number }) => {
      toast.success(`Digest enviado para ${result.sent} usuários!`);
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error('Erro ao enviar digest', { description: error.message });
    },
  });

  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly'>('weekly');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Email Digest
          </CardTitle>
          <CardDescription>
            Envie resumos periódicos por email para usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Status do Digest */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Próximo Digest Diário</p>
                <p className="text-lg font-medium">
                  {digestStatus?.nextDailyRun 
                    ? new Date(digestStatus.nextDailyRun).toLocaleString('pt-BR')
                    : 'Não agendado'}
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Próximo Digest Semanal</p>
                <p className="text-lg font-medium">
                  {digestStatus?.nextWeeklyRun 
                    ? new Date(digestStatus.nextWeeklyRun).toLocaleString('pt-BR')
                    : 'Não agendado'}
                </p>
              </div>
            </div>

            {/* Últimas Execuções */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">Último Digest Diário</p>
                <p className="text-lg font-medium">
                  {digestStatus?.lastDailyRun 
                    ? new Date(digestStatus.lastDailyRun).toLocaleString('pt-BR')
                    : 'Nunca executado'}
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">Último Digest Semanal</p>
                <p className="text-lg font-medium">
                  {digestStatus?.lastWeeklyRun 
                    ? new Date(digestStatus.lastWeeklyRun).toLocaleString('pt-BR')
                    : 'Nunca executado'}
                </p>
              </div>
            </div>

            {/* Enviar Manualmente */}
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex-1">
                <p className="font-medium">Enviar Digest Manualmente</p>
                <p className="text-sm text-muted-foreground">Selecione a frequência e envie agora</p>
              </div>
              <Select
                value={selectedFrequency}
                onValueChange={(value) => setSelectedFrequency(value as 'daily' | 'weekly')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => sendDigestMutation.mutate({ frequency: selectedFrequency })}
                disabled={sendDigestMutation.isPending}
              >
                {sendDigestMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                ) : (
                  <><Bell className="w-4 h-4 mr-2" />Enviar Agora</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Digest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Preview do Digest Semanal
          </CardTitle>
          <CardDescription>
            Visualize o conteúdo que será enviado aos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {digestPreview && digestPreview.count > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{digestPreview.count} usuários receberão o digest</Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {digestPreview.digests.map((digest: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Usuário: {digest.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      {digest.notificationCount} notificações | {digest.activityCount} atividades
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhum digest pendente para envio</p>
              <p className="text-sm mt-1">Os digests são gerados com base nas atividades dos usuários</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
