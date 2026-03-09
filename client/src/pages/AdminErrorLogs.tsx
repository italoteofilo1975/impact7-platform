import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import DashboardLayout from '@/components/DashboardLayout';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw, Eye } from 'lucide-react';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export default function AdminErrorLogs() {
  const { user } = useAuth();
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.errorLogs.stats.useQuery();
  const { data: logsData, isLoading: logsLoading, refetch } = trpc.errorLogs.list.useQuery({
    level: levelFilter !== 'all' ? levelFilter as any : undefined,
    resolved: resolvedFilter === 'unresolved' ? false : resolvedFilter === 'resolved' ? true : undefined,
    limit: 100,
  });

  const resolveLog = trpc.errorLogs.resolve.useMutation({
    onSuccess: () => {
      toast.success('Erro marcado como resolvido');
      utils.errorLogs.list.invalidate();
      utils.errorLogs.stats.invalidate();
      setSelectedLog(null);
    },
    onError: (e) => toast.error(e.message),
  });

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p className="mb-4">Você precisa estar autenticado.</p>
          <a href={getLoginUrl()} className="text-primary underline">Entrar</a>
        </div>
      </DashboardLayout>
    );
  }

  const logs = logsData?.logs ?? [];

  const levelIcon = (level: string) => {
    if (level === 'error') return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (level === 'warn') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const levelBadge = (level: string) => {
    if (level === 'error') return <Badge variant="destructive">Erro</Badge>;
    if (level === 'warn') return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
    return <Badge variant="outline">Info</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <AdminBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Error Logs' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Error Logs</h1>
            <p className="text-muted-foreground">Monitoramento de erros e avisos do sistema</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats?.errors ?? 0}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Avisos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats?.warnings ?? 0}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Não Resolvidos</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats?.unresolved ?? 0}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Últimas 24h</CardTitle>
                  <Info className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats?.last24h ?? 0}</div></CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="error">Erros</SelectItem>
              <SelectItem value="warn">Avisos</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="unresolved">Não resolvidos</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Erro</CardTitle>
            <CardDescription>{logs.length} registros encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log: any) => (
                  <div
                    key={log.id}
                    className={`flex items-start justify-between p-3 border rounded-lg transition-colors ${log.resolved ? 'opacity-60' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">{levelIcon(log.level)}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {levelBadge(log.level)}
                          {log.path && <code className="text-xs bg-muted px-1 rounded">{log.method} {log.path}</code>}
                          {log.statusCode && <Badge variant="outline" className="text-xs">{log.statusCode}</Badge>}
                          {log.resolved && <Badge variant="outline" className="text-xs gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" />Resolvido</Badge>}
                        </div>
                        <p className="text-sm font-medium mt-1 truncate">{log.message}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(log.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!log.resolved && (
                        <Button variant="ghost" size="icon" className="text-green-600" onClick={() => resolveLog.mutate({ id: log.id })}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum erro encontrado</h3>
                <p className="text-muted-foreground">O sistema está funcionando sem erros registrados.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={selectedLog !== null} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLog && levelIcon(selectedLog.level)}
                Detalhes do Erro
              </DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="font-medium">Nível:</span> {selectedLog.level}</div>
                  <div><span className="font-medium">Status:</span> {selectedLog.statusCode ?? 'N/A'}</div>
                  <div><span className="font-medium">Método:</span> {selectedLog.method ?? 'N/A'}</div>
                  <div><span className="font-medium">Path:</span> {selectedLog.path ?? 'N/A'}</div>
                  {selectedLog.userEmail && <div className="col-span-2"><span className="font-medium">Usuário:</span> {selectedLog.userEmail}</div>}
                  <div className="col-span-2"><span className="font-medium">Data:</span> {new Date(selectedLog.createdAt).toLocaleString('pt-BR')}</div>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Mensagem:</p>
                  <p className="text-sm bg-muted p-3 rounded">{selectedLog.message}</p>
                </div>
                {selectedLog.stack && (
                  <div>
                    <p className="font-medium text-sm mb-1">Stack Trace:</p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48 whitespace-pre-wrap">{selectedLog.stack}</pre>
                  </div>
                )}
                {selectedLog.context && (
                  <div>
                    <p className="font-medium text-sm mb-1">Contexto:</p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">{JSON.stringify(selectedLog.context, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedLog && !selectedLog.resolved && (
                <Button onClick={() => resolveLog.mutate({ id: selectedLog.id })} disabled={resolveLog.isPending} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />Marcar como Resolvido
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedLog(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
