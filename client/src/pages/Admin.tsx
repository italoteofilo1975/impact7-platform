import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import NavigationButtons from "@/components/NavigationButtons";
import { Shield, Users, FileText, BarChart3, Settings, LogOut, Home, ChevronRight, Lock, AlertTriangle, RefreshCw, Activity, Briefcase, Bell, Tag, Coins, Zap, FileCode, MessageSquare, ClipboardList, Gauge, AlertCircle, Brain, BriefcaseBusiness, Globe, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

const adminModules = [
  {
    icon: Users,
    title: "Leads",
    description: "Gerenciar leads capturados pelo site",
    count: null,
    link: "/admin/leads",
    isLink: true,
  },
  {
    icon: MessageSquare,
    title: "Contatos",
    description: "Mensagens recebidas pelo formulário de contato",
    count: null,
    link: "/admin/contacts",
    isLink: true,
  },
  {
    icon: FileText,
    title: "Downloads",
    description: "Acompanhar downloads de whitepaper e e-book",
    count: "342",
    link: "/admin/downloads",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Métricas de uso do Jarvis, calculadora e site",
    count: null,
    link: "/admin/analytics",
    isLink: true,
  },
  {
    icon: Activity,
    title: "Monitoramento",
    description: "Dashboard de métricas, alertas e saúde do sistema",
    count: null,
    link: "/admin/monitoring",
    isLink: true,
  },
  {
    icon: Briefcase,
    title: "Revisão de Cases",
    description: "Revisar e aprovar submissões de cases de parceiros",
    count: null,
    link: "/admin/cases",
    isLink: true,
  },
  {
    icon: Bell,
    title: "Notificações",
    description: "Configurar alertas e preferências de notificação",
    count: null,
    link: "/admin/notifications",
    isLink: true,
  },
  {
    icon: Tag,
    title: "Tags de Cases",
    description: "Criar e gerenciar tags para organizar cases",
    count: null,
    link: "/admin/tags",
    isLink: true,
  },
  {
    icon: Coins,
    title: "Tokens de Impacto",
    description: "Gerenciar tokens, saldos e transações",
    count: null,
    link: "/admin/tokens",
    isLink: true,
  },
  {
    icon: FileCode,
    title: "Templates de Notificação",
    description: "Criar e editar templates personalizados",
    count: null,
    link: "/admin/templates",
    isLink: true,
  },
  {
    icon: Gauge,
    title: "Métricas de Sistema",
    description: "Dashboard de performance, usuários e notificações",
    count: null,
    link: "/admin/metricas",
    isLink: true,
  },
  {
    icon: AlertCircle,
    title: "Alertas",
    description: "Painel de alertas automáticos e configurações",
    count: null,
    link: "/admin/alertas",
    isLink: true,
  },
  {
    icon: Brain,
    title: "Jarvis Memórias",
    description: "Histórico de interações e conhecimento do Jarvis",
    count: null,
    link: "/jarvis/memorias",
    isLink: true,
  },
  {
    icon: Zap,
    title: "Admin Avançado",
    description: "Ferramentas avançadas, SSE, scheduler e debug",
    count: null,
    link: "/admin/avancado",
    isLink: true,
  },
  {
    icon: ClipboardList,
    title: "Auditoria",
    description: "Log de ações administrativas para compliance",
    count: null,
    link: "/admin/audit",
    isLink: true,
  },
  {
    icon: BriefcaseBusiness,
    title: "Carreiras",
    description: "Gerenciar vagas abertas e candidaturas",
    count: null,
    link: "/admin/carreiras",
    isLink: true,
  },
  {
    icon: Globe,
    title: "Páginas CMS",
    description: "Gerenciar páginas institucionais e conteúdo do site",
    count: null,
    link: "/admin/paginas",
    isLink: true,
  },
  {
    icon: Bug,
    title: "Error Logs",
    description: "Monitorar erros e avisos do sistema em tempo real",
    count: null,
    link: "/admin/error-logs",
    isLink: true,
  },
  {
    icon: Settings,
    title: "Configurações",
    description: "Configurar integrações e parâmetros do sistema",
    count: null,
    link: "/admin/settings",
  },
  {
    icon: FileText,
    title: "Relatórios",
    description: "Relatórios consolidados e exportação de dados",
    count: null,
    link: "/admin/reports",
    isLink: true,
  },
  {
    icon: BarChart3,
    title: "Métricas de Negócio",
    description: "MRR, ARR, LTV, CAC e unit economics",
    count: null,
    link: "/admin/business",
    isLink: true,
  },
];

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  
  // Fetch real data from tRPC
  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = trpc.leads.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: contacts, isLoading: contactsLoading } = trpc.contacts.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: whitepaperDownloads } = trpc.downloads.listWhitepaper.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: ebookDownloads } = trpc.downloads.listEbook.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Fetch cases pendentes
  const { data: allCases } = trpc.cases.getSubmissions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const pendingCases = allCases?.filter(c => c.status === 'pending' || c.status === 'reviewing');
  
  // Fetch unread notifications count
  const { data: unreadCount } = trpc.userNotifications.getUnreadCount.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Fetch activity metrics for chart
  const { data: activityMetrics } = trpc.leads.activityMetrics.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Fetch recent audit logs for activity feed
  const { data: auditData } = trpc.audit.getLogs.useQuery(
    { limit: 8 },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );
  
  // Calculate stats
  const totalLeads = leads?.length || 0;
  const totalDownloads = (whitepaperDownloads?.length || 0) + (ebookDownloads?.length || 0);
  const totalContacts = contacts?.length || 0;
  const pendingCasesCount = pendingCases?.length || 0;
  const unreadNotifications = unreadCount || 0;
  
  // Calculate leads today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leadsToday = leads?.filter(l => new Date(l.createdAt) >= today).length || 0;
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Área Restrita</h1>
            <p className="text-muted-foreground mb-6">
              Faça login para acessar o painel administrativo do IMPACT7.
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full gradient-orange text-white border-0" size="lg">
                <Shield className="w-5 h-5 mr-2" />
                Fazer Login
              </Button>
            </a>
            <Link href="/">
              <Button variant="ghost" className="w-full mt-4">
                <Home className="w-4 h-4 mr-2" />
                Voltar para o Site
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Check admin role
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground mb-6">
              Você não tem permissão para acessar o painel administrativo.
              Entre em contato com o administrador.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Logado como: {user?.email}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => logout()}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              <Link href="/">
                <Button className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Buttons */}
      <div className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <NavigationButtons showBack={true} backUrl="/" />
        </div>
      </div>
      
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-xl font-bold">
                <span className="text-primary">IMPACT</span>
                <span className="text-orange-500">7</span>
              </span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel de controle do IMPACT7. Gerencie leads, downloads e configurações.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {leadsLoading ? '...' : totalLeads}
              </div>
              <div className="text-sm text-muted-foreground">Leads Total</div>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{leadsToday}</div>
              <div className="text-sm text-muted-foreground">Leads Hoje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{totalDownloads}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </CardContent>
          </Card>
          <Card className={pendingCasesCount > 0 ? "border-yellow-500/20 bg-yellow-500/5" : ""}>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${pendingCasesCount > 0 ? 'text-yellow-600' : 'text-primary'}`}>
                {pendingCasesCount}
              </div>
              <div className="text-sm text-muted-foreground">Cases Pendentes</div>
            </CardContent>
          </Card>
          <Card className={unreadNotifications > 0 ? "border-blue-500/20 bg-blue-500/5" : ""}>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${unreadNotifications > 0 ? 'text-blue-600' : 'text-primary'}`}>
                {unreadNotifications}
              </div>
              <div className="text-sm text-muted-foreground">Notificações</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {totalLeads > 0 ? Math.round((totalDownloads / totalLeads) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Conversão</div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        {activityMetrics && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Atividade dos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-32">
                {activityMetrics.days.map((day, i) => {
                  const maxValue = Math.max(...activityMetrics.leads, ...activityMetrics.downloads, 1);
                  const leadsHeight = (activityMetrics.leads[i] / maxValue) * 100;
                  const downloadsHeight = (activityMetrics.downloads[i] / maxValue) * 100;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex gap-1 items-end h-24 w-full justify-center">
                        <div
                          className="w-3 bg-primary rounded-t transition-all"
                          style={{ height: `${Math.max(leadsHeight, 4)}%` }}
                          title={`Leads: ${activityMetrics.leads[i]}`}
                        />
                        <div
                          className="w-3 bg-green-500 rounded-t transition-all"
                          style={{ height: `${Math.max(downloadsHeight, 4)}%` }}
                          title={`Downloads: ${activityMetrics.downloads[i]}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded" />
                  <span className="text-muted-foreground">Leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-muted-foreground">Downloads</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modules */}
        <h2 className="text-xl font-semibold mb-4">Módulos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {adminModules.map((module, index) => {
            const cardContent = (
              <Card key={index} className="card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <module.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{module.title}</h3>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {module.count && (
                        <span className="text-lg font-bold text-primary">{module.count}</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            
            if ('isLink' in module && module.isLink) {
              return <Link key={index} href={module.link}>{cardContent}</Link>;
            }
            return cardContent;
          })}
        </div>

        {/* Recent Activity */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-xl font-semibold">Atividade Recente</h2>
          <Link href="/admin/audit">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              Ver tudo <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            {(!auditData || auditData.logs.length === 0) ? (
              <div className="space-y-4">
                {leads?.slice(0, 5).map((lead, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium text-sm">Novo lead capturado</div>
                      <div className="text-sm text-muted-foreground">{lead.email}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
                {(!leads || leads.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {auditData.logs.map((log: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {log.action} — {log.resourceType || 'sistema'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.userEmail || log.userId || 'Sistema'}
                        {log.details ? ` — ${typeof log.details === 'string' ? log.details.slice(0, 60) : JSON.stringify(log.details).slice(0, 60)}` : ''}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link para Admin Avançado */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href="/admin/advanced">
            <div className="flex items-center justify-between p-4 rounded-lg border border-dashed hover:border-primary hover:bg-muted/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Administração Avançada</h3>
                  <p className="text-sm text-muted-foreground">Acesso completo a todas as configurações do sistema</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
