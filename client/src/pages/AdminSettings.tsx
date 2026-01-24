import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Webhook,
  Key,
  AlertCircle,
  Save,
  RefreshCw,
  Loader2,
} from 'lucide-react';

// Default settings keys
const SETTINGS_KEYS = {
  SITE_NAME: 'site_name',
  SITE_DESCRIPTION: 'site_description',
  MAINTENANCE_MODE: 'maintenance_mode',
  EMAIL_NOTIFICATIONS: 'email_notifications_enabled',
  PUSH_NOTIFICATIONS: 'push_notifications_enabled',
  ANALYTICS_ENABLED: 'analytics_enabled',
};

export default function AdminSettings() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // Estados para configurações
  const [siteName, setSiteName] = useState('IMPACT7');
  const [siteDescription, setSiteDescription] = useState('Transforme seu Impacto Social com Ciência');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Query para carregar configurações
  const { data: settings, isLoading, refetch } = trpc.systemSettings.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Mutation para salvar configurações
  const saveMutation = trpc.systemSettings.setBulk.useMutation({
    onSuccess: () => {
      toast.success('Configurações salvas!', {
        description: 'As alterações foram aplicadas com sucesso.',
      });
      setHasChanges(false);
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao salvar configurações', {
        description: error.message,
      });
    },
  });

  // Carregar configurações do banco
  useEffect(() => {
    if (settings) {
      const getValue = (key: string, defaultValue: string) => {
        const setting = settings.find(s => s.key === key);
        return setting?.value ?? defaultValue;
      };
      
      const getBoolValue = (key: string, defaultValue: boolean) => {
        const setting = settings.find(s => s.key === key);
        if (!setting?.value) return defaultValue;
        return setting.value === 'true';
      };

      setSiteName(getValue(SETTINGS_KEYS.SITE_NAME, 'IMPACT7'));
      setSiteDescription(getValue(SETTINGS_KEYS.SITE_DESCRIPTION, 'Transforme seu Impacto Social com Ciência'));
      setMaintenanceMode(getBoolValue(SETTINGS_KEYS.MAINTENANCE_MODE, false));
      setEmailNotifications(getBoolValue(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, true));
      setPushNotifications(getBoolValue(SETTINGS_KEYS.PUSH_NOTIFICATIONS, true));
      setAnalyticsEnabled(getBoolValue(SETTINGS_KEYS.ANALYTICS_ENABLED, true));
    }
  }, [settings]);

  const handleSave = () => {
    saveMutation.mutate({
      settings: [
        { key: SETTINGS_KEYS.SITE_NAME, value: siteName },
        { key: SETTINGS_KEYS.SITE_DESCRIPTION, value: siteDescription },
        { key: SETTINGS_KEYS.MAINTENANCE_MODE, value: maintenanceMode.toString() },
        { key: SETTINGS_KEYS.EMAIL_NOTIFICATIONS, value: emailNotifications.toString() },
        { key: SETTINGS_KEYS.PUSH_NOTIFICATIONS, value: pushNotifications.toString() },
        { key: SETTINGS_KEYS.ANALYTICS_ENABLED, value: analyticsEnabled.toString() },
      ],
    });
  };

  const markChanged = () => setHasChanges(true);

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <AdminBreadcrumb items={[{ label: 'Configurações' }]} />
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="w-7 h-7 text-primary" />
              Configurações
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure integrações e parâmetros do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || !hasChanges}>
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>

        {hasChanges && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Você tem alterações não salvas
          </div>
        )}

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Integrações
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações básicas do site e da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={siteName}
                      onChange={(e) => { setSiteName(e.target.value); markChanged(); }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="siteDescription">Descrição</Label>
                    <Input
                      id="siteDescription"
                      value={siteDescription}
                      onChange={(e) => { setSiteDescription(e.target.value); markChanged(); }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo de Manutenção</p>
                    <p className="text-sm text-muted-foreground">
                      Ativar para bloquear acesso ao site
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={(v) => { setMaintenanceMode(v); markChanged(); }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Coletar métricas de uso do site
                    </p>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={(v) => { setAnalyticsEnabled(v); markChanged(); }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Gerencie como as notificações são enviadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(v) => { setEmailNotifications(v); markChanged(); }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações Push</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações em tempo real via SSE
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={(v) => { setPushNotifications(v); markChanged(); }}
                  />
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <p className="font-medium">Configuração de Email</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Para configurar o servidor de email, acesse as variáveis de ambiente no painel de Secrets.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Gerencie a segurança da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <p className="font-medium">Autenticação OAuth</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Autenticação via Manus OAuth está ativa e configurada.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="w-5 h-5 text-blue-500" />
                      <p className="font-medium">Chaves de API</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gerencie chaves de API para integrações externas.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                      Gerenciar Chaves
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3 mb-2">
                      <Database className="w-5 h-5 text-purple-500" />
                      <p className="font-medium">Backup de Dados</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Último backup: Automático (gerenciado pela plataforma)
                    </p>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Backup gerenciado automaticamente')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Verificar Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Webhook className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Webhooks</p>
                          <p className="text-sm text-muted-foreground">
                            Receba notificações de eventos
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                        Configurar
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Email SMTP</p>
                          <p className="text-sm text-muted-foreground">
                            Configurar servidor de email
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                        Configurar
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Database className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">API Externa</p>
                          <p className="text-sm text-muted-foreground">
                            Integrar com APIs de terceiros
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                        Configurar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
