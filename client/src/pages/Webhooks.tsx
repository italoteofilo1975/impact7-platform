import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, Webhook, Plus, Trash2, RefreshCw, Play, 
  CheckCircle, XCircle, Clock, Eye, EyeOff, Copy,
  Settings, History, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Webhooks() {
  const { user, isAuthenticated } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [expandedWebhook, setExpandedWebhook] = useState<number | null>(null);
  
  const { data: events } = trpc.webhooks.getEvents.useQuery();
  const { data: webhooks, refetch: refetchWebhooks } = trpc.webhooks.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const createMutation = trpc.webhooks.create.useMutation({
    onSuccess: (data) => {
      setNewSecret(data.secret);
      refetchWebhooks();
      toast.success("Webhook criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar webhook: ${error.message}`);
    },
  });
  
  const updateMutation = trpc.webhooks.update.useMutation({
    onSuccess: () => {
      refetchWebhooks();
      toast.success("Webhook atualizado!");
    },
  });
  
  const deleteMutation = trpc.webhooks.delete.useMutation({
    onSuccess: () => {
      refetchWebhooks();
      toast.success("Webhook removido!");
    },
  });
  
  const regenerateSecretMutation = trpc.webhooks.regenerateSecret.useMutation({
    onSuccess: (data) => {
      toast.success("Secret regenerado! Copie o novo valor.");
      navigator.clipboard.writeText(data.secret);
    },
  });
  
  const testMutation = trpc.webhooks.test.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Teste bem-sucedido! Status: ${result.status}`);
      } else {
        toast.error(`Teste falhou: ${result.error}`);
      }
    },
  });
  
  const handleCreate = () => {
    createMutation.mutate({
      name: newWebhookName,
      url: newWebhookUrl,
      events: selectedEvents,
    });
  };
  
  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };
  
  const handleCopySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copiado!");
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Webhook className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle>Gerencie seus Webhooks</CardTitle>
            <CardDescription>
              Faça login para configurar webhooks e receber notificações automáticas.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href={getLoginUrl()}>
              <Button size="lg">Fazer Login</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Webhooks</h1>
              <p className="text-muted-foreground">
                Receba notificações automáticas sobre eventos da plataforma
              </p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Novo Webhook</DialogTitle>
                <DialogDescription>
                  Configure a URL e os eventos que deseja receber.
                </DialogDescription>
              </DialogHeader>
              
              {newSecret ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Importante!</AlertTitle>
                    <AlertDescription>
                      Copie o secret agora. Ele não será exibido novamente.
                      Use-o para verificar a assinatura das requisições.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={showSecret ? "text" : "password"} 
                      value={newSecret} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopySecret(newSecret)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded text-sm">
                    <p className="font-semibold mb-1">Verificação de assinatura:</p>
                    <code className="text-xs">
                      X-Webhook-Signature: sha256=HMAC(payload, secret)
                    </code>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setNewSecret(null);
                      setShowCreateDialog(false);
                      setNewWebhookName("");
                      setNewWebhookUrl("");
                      setSelectedEvents([]);
                    }}
                  >
                    Concluído
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Integração Slack"
                      value={newWebhookName}
                      onChange={(e) => setNewWebhookName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="url">URL do Endpoint</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://seu-servidor.com/webhook"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Eventos</Label>
                    <div className="grid gap-2 max-h-48 overflow-y-auto">
                      {events && Object.entries(events).map(([key, desc]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={selectedEvents.includes(key)}
                            onCheckedChange={() => toggleEvent(key)}
                          />
                          <label htmlFor={key} className="text-sm">
                            <span className="font-medium">{key}</span>
                            <span className="text-muted-foreground ml-2">- {desc}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreate}
                      disabled={!newWebhookName || !newWebhookUrl || selectedEvents.length === 0 || createMutation.isPending}
                    >
                      {createMutation.isPending ? "Criando..." : "Criar Webhook"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Webhooks List */}
        {webhooks && webhooks.length > 0 ? (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                isExpanded={expandedWebhook === webhook.id}
                onToggleExpand={() => setExpandedWebhook(
                  expandedWebhook === webhook.id ? null : webhook.id
                )}
                onToggleActive={(isActive) => {
                  updateMutation.mutate({ webhookId: webhook.id, isActive });
                }}
                onDelete={() => {
                  if (confirm("Tem certeza que deseja remover este webhook?")) {
                    deleteMutation.mutate({ webhookId: webhook.id });
                  }
                }}
                onRegenerateSecret={() => {
                  if (confirm("Regenerar o secret invalidará o anterior. Continuar?")) {
                    regenerateSecretMutation.mutate({ webhookId: webhook.id });
                  }
                }}
                onTest={() => {
                  testMutation.mutate({ webhookId: webhook.id });
                }}
                isTestingPending={testMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Webhook className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum webhook configurado</h3>
              <p className="text-muted-foreground mb-4">
                Configure webhooks para receber notificações automáticas sobre eventos da plataforma.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Webhook
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Documentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Headers da Requisição</h4>
              <div className="bg-muted p-3 rounded text-sm font-mono">
                <p>Content-Type: application/json</p>
                <p>X-Webhook-Signature: sha256=...</p>
                <p>X-Webhook-Event: case.created</p>
                <p>X-Webhook-Delivery: 12345</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Payload de Exemplo</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "event": "case.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": 123,
    "title": "Projeto Educação Digital",
    "organization": "Instituto ABC",
    "sector": "Educação",
    "investment": 500000,
    "beneficiaries": 10000
  }
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Verificação de Assinatura (Node.js)</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === \`sha256=\${expected}\`;
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Política de Retry</h4>
              <p className="text-sm text-muted-foreground">
                Em caso de falha (status != 2xx ou timeout), tentamos novamente com backoff exponencial:
                1 min, 5 min, 15 min, 1 hora, 4 horas. Máximo de 5 tentativas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente de card de webhook
function WebhookCard({
  webhook,
  isExpanded,
  onToggleExpand,
  onToggleActive,
  onDelete,
  onRegenerateSecret,
  onTest,
  isTestingPending,
}: {
  webhook: {
    id: number;
    name: string;
    url: string;
    events: string[];
    isActive: boolean;
    createdAt: Date;
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: (isActive: boolean) => void;
  onDelete: () => void;
  onRegenerateSecret: () => void;
  onTest: () => void;
  isTestingPending: boolean;
}) {
  const { data: deliveries } = trpc.webhooks.getDeliveries.useQuery(
    { webhookId: webhook.id, limit: 10 },
    { enabled: isExpanded }
  );
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{webhook.name}</h3>
              <Switch
                checked={webhook.isActive}
                onCheckedChange={onToggleActive}
              />
              {webhook.isActive ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                  Inativo
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground font-mono truncate max-w-lg">
              {webhook.url}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {webhook.events.map((event) => (
                <Badge key={event} variant="secondary" className="text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onTest}
              disabled={isTestingPending || !webhook.isActive}
            >
              <Play className="w-4 h-4 mr-1" />
              {isTestingPending ? "Testando..." : "Testar"}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onRegenerateSecret}
              title="Regenerar Secret"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleExpand}
              title="Ver Histórico"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Delivery History */}
        <Collapsible open={isExpanded}>
          <CollapsibleContent className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico de Entregas
            </h4>
            {deliveries && deliveries.length > 0 ? (
              <div className="space-y-2">
                {deliveries.map((delivery) => (
                  <div 
                    key={delivery.id}
                    className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2">
                      {delivery.deliveredAt ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : delivery.responseStatus === 0 ? (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge variant="outline">{delivery.event}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(delivery.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {delivery.responseStatus !== null && (
                        <Badge 
                          variant={delivery.responseStatus >= 200 && delivery.responseStatus < 300 ? "default" : "destructive"}
                        >
                          {delivery.responseStatus || "Erro"}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">
                        {delivery.attempts} tentativa(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma entrega registrada ainda.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
