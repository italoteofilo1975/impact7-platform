import { useState, useMemo } from 'react';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info, Award, Coins, FileCheck, Filter, Check, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/lib/trpc';
import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'case_pending' | 'case_approved' | 'case_rejected' | 'certificate_issued' | 'token_earned' | 'system';

const typeConfig: Record<NotificationType, { icon: typeof Bell; label: string; color: string; bg: string }> = {
  info: { icon: Info, label: 'Informação', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle, label: 'Sucesso', color: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { icon: AlertTriangle, label: 'Aviso', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  error: { icon: AlertCircle, label: 'Erro', color: 'text-red-500', bg: 'bg-red-500/10' },
  case_pending: { icon: Bell, label: 'Case Pendente', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  case_approved: { icon: CheckCircle, label: 'Case Aprovado', color: 'text-green-500', bg: 'bg-green-500/10' },
  case_rejected: { icon: AlertCircle, label: 'Case Rejeitado', color: 'text-red-500', bg: 'bg-red-500/10' },
  certificate_issued: { icon: Award, label: 'Certificado', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  token_earned: { icon: Coins, label: 'Token Ganho', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  system: { icon: FileCheck, label: 'Sistema', color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

export default function Notificacoes() {
  const { user, loading: authLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const limit = 20;

  // Calculate period filter dates
  const periodDates = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { today, weekAgo, monthAgo };
  }, []);

  // Calculate startDate based on period filter
  const startDate = useMemo(() => {
    if (periodFilter === 'today') return periodDates.today.toISOString();
    if (periodFilter === 'week') return periodDates.weekAgo.toISOString();
    if (periodFilter === 'month') return periodDates.monthAgo.toISOString();
    return undefined;
  }, [periodFilter, periodDates]);

  const { data, isLoading, refetch } = trpc.userNotifications.list.useQuery(
    {
      limit,
      offset: page * limit,
      type: selectedType === 'all' ? undefined : selectedType,
      unreadOnly: showUnreadOnly,
      startDate,
    },
    { enabled: !!user }
  );

  const markAsReadMutation = trpc.userNotifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message || 'Erro ao marcar notificação como lida'),
  });

  const markAllAsReadMutation = trpc.userNotifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message || 'Erro ao marcar notificações como lidas'),
  });

  const deleteMutation = trpc.userNotifications.delete.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message || 'Erro ao excluir notificação'),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>Faça login para ver suas notificações</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button className="w-full">Voltar para Home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Notificações
            </h1>
            <p className="text-muted-foreground mt-2">
              {data?.unreadCount || 0} não lidas de {data?.total || 0} total
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || data?.unreadCount === 0}
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4 mr-2" />
              )}
              Marcar todas como lidas
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedType} onValueChange={(v) => { setSelectedType(v as NotificationType | 'all'); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={showUnreadOnly ? 'unread' : 'all'} onValueChange={(v) => { setShowUnreadOnly(v === 'unread'); setPage(0); }}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">Não lidas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={periodFilter} onValueChange={(v) => { setPeriodFilter(v as typeof periodFilter); setPage(0); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.notifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">Nenhuma notificação</h3>
              <p className="text-muted-foreground mt-2">
                {showUnreadOnly ? 'Você não tem notificações não lidas' : 'Você ainda não recebeu nenhuma notificação'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data?.notifications.map((notification) => {
              const config = typeConfig[notification.type as NotificationType] || typeConfig.info;
              const Icon = config.icon;
              return (
                <Card
                  key={notification.id}
                  className={`transition-colors ${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.isRead && (
                                <Badge variant="default" className="text-xs">Nova</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            {notification.link && (
                              <Link href={notification.link}>
                                <Button variant="link" className="p-0 h-auto text-sm mt-2">
                                  Ver detalhes
                                </Button>
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate({ notificationId: notification.id })}
                              disabled={markAsReadMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate({ notificationId: notification.id })}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Próxima
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
