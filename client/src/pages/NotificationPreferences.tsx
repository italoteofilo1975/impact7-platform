import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Save, Loader2, CheckCircle, AlertTriangle, AlertCircle, Info, Award, Coins, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/lib/trpc';
import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { toast } from 'sonner';

interface NotificationTypeConfig {
  key: string;
  label: string;
  description: string;
  icon: typeof Bell;
  color: string;
}

const notificationTypes: NotificationTypeConfig[] = [
  { key: 'info', label: 'Informações', description: 'Atualizações gerais e informativas', icon: Info, color: 'text-blue-500' },
  { key: 'success', label: 'Sucesso', description: 'Confirmações de ações bem-sucedidas', icon: CheckCircle, color: 'text-green-500' },
  { key: 'warning', label: 'Avisos', description: 'Alertas importantes que requerem atenção', icon: AlertTriangle, color: 'text-yellow-500' },
  { key: 'error', label: 'Erros', description: 'Problemas que precisam de ação imediata', icon: AlertCircle, color: 'text-red-500' },
  { key: 'casePending', label: 'Cases Pendentes', description: 'Novos cases aguardando revisão', icon: Clock, color: 'text-orange-500' },
  { key: 'caseApproved', label: 'Cases Aprovados', description: 'Quando seus cases são aprovados', icon: CheckCircle, color: 'text-green-500' },
  { key: 'caseRejected', label: 'Cases Rejeitados', description: 'Quando seus cases precisam de ajustes', icon: AlertCircle, color: 'text-red-500' },
  { key: 'certificateIssued', label: 'Certificados', description: 'Novos certificados emitidos', icon: Award, color: 'text-purple-500' },
  { key: 'tokenEarned', label: 'Tokens Ganhos', description: 'Quando você ganha tokens de impacto', icon: Coins, color: 'text-amber-500' },
  { key: 'system', label: 'Sistema', description: 'Notificações do sistema e manutenção', icon: FileCheck, color: 'text-slate-500' },
];

export default function NotificationPreferences() {
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState<'instant' | 'daily' | 'weekly' | 'never'>('instant');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: savedPreferences, isLoading } = trpc.userNotifications.getPreferences.useQuery(
    undefined,
    { enabled: !!user }
  );

  const saveMutation = trpc.userNotifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success('Preferências salvas com sucesso!');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Erro ao salvar preferências');
    },
  });

  // Carregar preferências salvas
  useEffect(() => {
    if (savedPreferences) {
      const prefs: Record<string, boolean> = {};
      notificationTypes.forEach(type => {
        const key = `${type.key}Enabled` as keyof typeof savedPreferences;
        prefs[type.key] = savedPreferences[key] !== 0;
      });
      setPreferences(prefs);
      setEmailEnabled(savedPreferences.emailEnabled !== 0);
      setEmailDigestFrequency((savedPreferences.emailDigestFrequency || 'instant') as 'instant' | 'never' | 'daily' | 'weekly');
      setPushEnabled(savedPreferences.pushEnabled !== 0);
    } else {
      // Valores padrão
      const defaultPrefs: Record<string, boolean> = {};
      notificationTypes.forEach(type => {
        defaultPrefs[type.key] = true;
      });
      setPreferences(defaultPrefs);
    }
  }, [savedPreferences]);

  const handleToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const data: Record<string, boolean | string> = {
      emailEnabled,
      emailDigestFrequency,
      pushEnabled,
    };
    notificationTypes.forEach(type => {
      data[`${type.key}Enabled`] = preferences[type.key] ?? true;
    });
    saveMutation.mutate(data as any);
  };

  const handleEnableAll = () => {
    const allEnabled: Record<string, boolean> = {};
    notificationTypes.forEach(type => {
      allEnabled[type.key] = true;
    });
    setPreferences(allEnabled);
    setHasChanges(true);
  };

  const handleDisableAll = () => {
    const allDisabled: Record<string, boolean> = {};
    notificationTypes.forEach(type => {
      allDisabled[type.key] = false;
    });
    setPreferences(allDisabled);
    setHasChanges(true);
  };

  if (authLoading || isLoading) {
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
              <CardDescription>Faça login para configurar suas preferências</CardDescription>
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

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Preferências de Notificação
            </h1>
            <p className="text-muted-foreground mt-2">
              Escolha quais notificações você deseja receber
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>

        {/* Canais de Notificação */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Canais de Notificação</CardTitle>
            <CardDescription>Configure como você deseja receber notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                </div>
              </div>
              <Switch
                checked={pushEnabled}
                onCheckedChange={(v) => { setPushEnabled(v); setHasChanges(true); }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações importantes por email</p>
                </div>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={(v) => { setEmailEnabled(v); setHasChanges(true); }}
              />
            </div>

            {emailEnabled && (
              <div className="ml-13 pl-13">
                <Label className="text-sm mb-2 block">Frequência de emails</Label>
                <Select
                  value={emailDigestFrequency}
                  onValueChange={(v) => { setEmailDigestFrequency(v as any); setHasChanges(true); }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Imediatamente</SelectItem>
                    <SelectItem value="daily">Resumo diário</SelectItem>
                    <SelectItem value="weekly">Resumo semanal</SelectItem>
                    <SelectItem value="never">Nunca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipos de Notificação */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Tipos de Notificação</CardTitle>
                <CardDescription>Escolha quais tipos de notificação você deseja receber</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEnableAll}>
                  Ativar todas
                </Button>
                <Button variant="outline" size="sm" onClick={handleDisableAll}>
                  Desativar todas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div key={type.key}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${type.color}`} />
                        </div>
                        <div>
                          <Label className="text-base">{type.label}</Label>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[type.key] ?? true}
                        onCheckedChange={(v) => handleToggle(type.key, v)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/notificacoes">
            <Button variant="link">
              ← Voltar para Notificações
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
