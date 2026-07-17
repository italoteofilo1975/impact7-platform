import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Bell, ArrowLeft, Send, Check, Clock, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const severityLabels = {
  P1: { label: 'Crítico (P1)', description: 'Sistema indisponível ou dados corrompidos', color: 'text-red-500' },
  P2: { label: 'Alto (P2)', description: 'Funcionalidade principal degradada', color: 'text-orange-500' },
  P3: { label: 'Médio (P3)', description: 'Funcionalidade secundária afetada', color: 'text-yellow-500' },
  P4: { label: 'Baixo (P4)', description: 'Problemas cosméticos ou melhorias', color: 'text-blue-500' },
};

export default function NotificationSettings() {
  const { user, loading, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: preferences, isLoading, refetch } = trpc.notifications.getPreferences.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success('Preferências salvas com sucesso');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });
  
  const testMutation = trpc.notifications.sendTest.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Notificação de teste enviada!');
      } else {
        toast.error('Falha ao enviar notificação de teste');
      }
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !preferences) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Faça login para acessar as configurações.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSeverityToggle = (severity: 'P1' | 'P2' | 'P3' | 'P4') => {
    const current = preferences.enabledSeverities || [];
    const updated = current.includes(severity)
      ? current.filter(s => s !== severity)
      : [...current, severity];
    
    updateMutation.mutate({ enabledSeverities: updated });
  };

  const handleToggle = (field: 'enableEmail' | 'enablePush', value: boolean) => {
    updateMutation.mutate({ [field]: value });
  };

  const handleQuietHours = (start: number | undefined, end: number | undefined) => {
    updateMutation.mutate({ quietHoursStart: start, quietHoursEnd: end });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Configurações de Notificações</h1>
              <p className="text-sm text-muted-foreground">Gerencie alertas e preferências</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Canais de Notificação */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Canais de Notificação
            </CardTitle>
            <CardDescription>
              Escolha como deseja receber alertas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receber alertas via email</p>
                </div>
              </div>
              <Switch
                checked={preferences.enableEmail}
                onCheckedChange={(checked) => handleToggle('enableEmail', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Receber alertas pelo canal de notificações da plataforma</p>
                </div>
              </div>
              <Switch
                checked={preferences.enablePush}
                onCheckedChange={(checked) => handleToggle('enablePush', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Níveis de Severidade */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Níveis de Alerta</CardTitle>
            <CardDescription>
              Selecione quais níveis de severidade você deseja receber
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['P1', 'P2', 'P3', 'P4'] as const).map((severity) => (
              <div key={severity} className="flex items-center justify-between">
                <div>
                  <Label className={severityLabels[severity].color}>
                    {severityLabels[severity].label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {severityLabels[severity].description}
                  </p>
                </div>
                <Switch
                  checked={preferences.enabledSeverities?.includes(severity) || false}
                  onCheckedChange={() => handleSeverityToggle(severity)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Horário Silencioso */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horário Silencioso
            </CardTitle>
            <CardDescription>
              Configure um período para não receber notificações (exceto P1)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Início</Label>
                <Select
                  value={preferences.quietHoursStart?.toString() || 'none'}
                  onValueChange={(value) => {
                    const start = value === 'none' ? undefined : parseInt(value);
                    handleQuietHours(start, preferences.quietHoursEnd);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Desativado</SelectItem>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fim</Label>
                <Select
                  value={preferences.quietHoursEnd?.toString() || 'none'}
                  onValueChange={(value) => {
                    const end = value === 'none' ? undefined : parseInt(value);
                    handleQuietHours(preferences.quietHoursStart, end);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Desativado</SelectItem>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Alertas P1 (críticos) sempre serão enviados, independente do horário silencioso.
            </p>
          </CardContent>
        </Card>

        {/* Testar Notificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Testar Notificações
            </CardTitle>
            <CardDescription>
              Envie uma notificação de teste para verificar se está funcionando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              className="w-full"
            >
              {testMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Notificação de Teste
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
