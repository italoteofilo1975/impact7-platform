import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import {
  Shield,
  Loader2,
  Search,
  Calendar,
  Download,
  AlertCircle,
  RefreshCw,
  User,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Upload,
} from 'lucide-react';

const actionIcons: Record<string, typeof Edit> = {
  create: FileText,
  update: Edit,
  delete: Trash2,
  login: LogIn,
  logout: LogOut,
  approve: CheckCircle,
  reject: XCircle,
  export: Download,
  import: Upload,
  config_change: Settings,
};

const actionColors: Record<string, string> = {
  create: 'bg-green-500/10 text-green-600 border-green-500/20',
  update: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  delete: 'bg-red-500/10 text-red-600 border-red-500/20',
  login: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  logout: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  approve: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  reject: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  export: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  import: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  config_change: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

const actionLabels: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  login: 'Login',
  logout: 'Logout',
  approve: 'Aprovação',
  reject: 'Rejeição',
  export: 'Exportação',
  import: 'Importação',
  config_change: 'Config. Alterada',
};

export default function AdminAudit() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: logsData, isLoading, refetch } = trpc.audit.getLogs.useQuery({
    action: actionFilter !== 'all' ? actionFilter : undefined,
    resourceType: resourceFilter !== 'all' ? resourceFilter : undefined,
    search: searchTerm || undefined,
    limit,
    offset: page * limit,
  }, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: stats } = trpc.audit.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: resourceTypes } = trpc.audit.getResourceTypes.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { refetch: exportCsv, isFetching: isExporting } = trpc.audit.exportCsv.useQuery({
    action: actionFilter !== 'all' ? actionFilter : undefined,
    resourceType: resourceFilter !== 'all' ? resourceFilter : undefined,
  }, { enabled: 0 });

  const handleExport = async () => {
    try {
      const result = await exportCsv();
      if (result.data?.csv) {
        const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`${result.data.count} registros exportados!`);
      }
    } catch (error) {
      toast.error('Erro ao exportar logs');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Esta página é restrita a administradores.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const totalPages = Math.ceil((logsData?.total || 0) / limit);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <AdminBreadcrumb items={[{ label: 'Auditoria' }]} />
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="w-7 h-7 text-primary" />
              Auditoria
            </h1>
            <p className="text-muted-foreground mt-1">
              Log de ações administrativas para compliance e rastreabilidade
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Registros</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <Shield className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                  <p className="text-2xl font-bold">{stats?.todayCount || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tipos de Ação</p>
                  <p className="text-2xl font-bold">{Object.keys(stats?.byAction || {}).length}</p>
                </div>
                <Edit className="w-8 h-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recursos Afetados</p>
                  <p className="text-2xl font-bold">{Object.keys(stats?.byResource || {}).length}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuário, recurso..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {Object.entries(actionLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por recurso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os recursos</SelectItem>
              {resourceTypes?.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Auditoria</CardTitle>
            <CardDescription>
              {logsData?.total || 0} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : logsData?.logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum registro de auditoria encontrado
              </div>
            ) : (
              <div className="space-y-3">
                {logsData?.logs.map((log) => {
                  const ActionIcon = actionIcons[log.action] || Edit;
                  const colorClass = actionColors[log.action] || 'bg-gray-500/10 text-gray-600';
                  
                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{log.userName || 'Sistema'}</span>
                            <Badge variant="outline" className={colorClass}>
                              {actionLabels[log.action] || log.action}
                            </Badge>
                            <Badge variant="secondary">{log.resourceType}</Badge>
                            {log.resourceName && (
                              <span className="text-muted-foreground">"{log.resourceName}"</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {log.userEmail && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.userEmail}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(log.createdAt)}
                            </span>
                            {log.ipAddress && (
                              <span className="text-xs">{log.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
