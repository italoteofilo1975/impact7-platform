import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, Key, Plus, Trash2, RefreshCw, 
  Eye, EyeOff, Copy, Shield, ExternalLink,
  CheckCircle, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function OAuthClients() {
  const { user, isAuthenticated } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientDescription, setNewClientDescription] = useState("");
  const [newRedirectUris, setNewRedirectUris] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [newCredentials, setNewCredentials] = useState<{ clientId: string; clientSecret: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  
  const { data: scopes } = trpc.oauth.getScopes.useQuery();
  const { data: clients, refetch: refetchClients } = trpc.oauth.listClients.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const createMutation = trpc.oauth.createClient.useMutation({
    onSuccess: (data) => {
      setNewCredentials(data);
      refetchClients();
      toast.success("OAuth client criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar client: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.oauth.deleteClient.useMutation({
    onSuccess: () => {
      refetchClients();
      toast.success("OAuth client removido!");
    },
  });
  
  const regenerateSecretMutation = trpc.oauth.regenerateSecret.useMutation({
    onSuccess: (data) => {
      toast.success("Secret regenerado! Copie o novo valor.");
      navigator.clipboard.writeText(data.clientSecret);
    },
  });
  
  const handleCreate = () => {
    const uris = newRedirectUris.split("\n").map(u => u.trim()).filter(u => u);
    createMutation.mutate({
      name: newClientName,
      description: newClientDescription,
      redirectUris: uris,
      scopes: selectedScopes,
    });
  };
  
  const toggleScope = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };
  
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle>OAuth2 Clients</CardTitle>
            <CardDescription>
              Faça login para gerenciar seus OAuth clients.
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
            <Link href="/api-keys">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">OAuth2 Clients</h1>
              <p className="text-muted-foreground">
                Gerencie aplicações que usam OAuth2 para autenticação
              </p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar OAuth Client</DialogTitle>
                <DialogDescription>
                  Configure uma aplicação para usar OAuth2.
                </DialogDescription>
              </DialogHeader>
              
              {newCredentials ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Importante!</AlertTitle>
                    <AlertDescription>
                      Copie as credenciais agora. O client_secret não será exibido novamente.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Client ID</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={newCredentials.clientId} readOnly className="font-mono text-sm" />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopy(newCredentials.clientId, "Client ID")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Client Secret</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          type={showSecret ? "text" : "password"} 
                          value={newCredentials.clientSecret} 
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
                          onClick={() => handleCopy(newCredentials.clientSecret, "Client Secret")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setNewCredentials(null);
                      setShowCreateDialog(false);
                      setNewClientName("");
                      setNewClientDescription("");
                      setNewRedirectUris("");
                      setSelectedScopes([]);
                    }}
                  >
                    Concluído
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Aplicação</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Minha Aplicação"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o propósito da aplicação..."
                      value={newClientDescription}
                      onChange={(e) => setNewClientDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="redirectUris">Redirect URIs (uma por linha)</Label>
                    <Textarea
                      id="redirectUris"
                      placeholder="https://sua-app.com/callback&#10;http://localhost:3000/callback"
                      value={newRedirectUris}
                      onChange={(e) => setNewRedirectUris(e.target.value)}
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Escopos</Label>
                    <div className="grid gap-2 max-h-40 overflow-y-auto">
                      {scopes && Object.entries(scopes).map(([key, desc]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={selectedScopes.includes(key)}
                            onCheckedChange={() => toggleScope(key)}
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
                      disabled={!newClientName || !newRedirectUris || selectedScopes.length === 0 || createMutation.isPending}
                    >
                      {createMutation.isPending ? "Criando..." : "Criar Client"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Clients List */}
        {clients && clients.length > 0 ? (
          <div className="space-y-4">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{client.name}</h3>
                        {client.isActive ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      
                      {client.description && (
                        <p className="text-sm text-muted-foreground">{client.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Client ID:</span>
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">{client.clientId}</code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(client.clientId, "Client ID")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {client.scopes.map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Redirect URIs: {client.redirectUris.join(", ")}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm("Regenerar o secret invalidará o anterior. Continuar?")) {
                            regenerateSecretMutation.mutate({ clientId: client.clientId });
                          }
                        }}
                        title="Regenerar Secret"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja remover este client?")) {
                            deleteMutation.mutate({ clientId: client.clientId });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum OAuth client configurado</h3>
              <p className="text-muted-foreground mb-4">
                Crie um OAuth client para permitir que aplicações de terceiros acessem a API em nome dos usuários.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar OAuth Client
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Fluxo OAuth2 Authorization Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Redirecionar para autorização</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`GET /oauth/authorize?
  client_id=imp7_xxx&
  redirect_uri=https://sua-app.com/callback&
  response_type=code&
  scope=cases:read calculator:use&
  state=random_state&
  code_challenge=xxx&          // PKCE (opcional)
  code_challenge_method=S256   // PKCE (opcional)`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Trocar code por tokens</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`POST /api/trpc/oauth.token
Content-Type: application/json

{
  "grantType": "authorization_code",
  "clientId": "imp7_xxx",
  "clientSecret": "xxx",
  "code": "authorization_code",
  "redirectUri": "https://sua-app.com/callback",
  "codeVerifier": "xxx"  // Se usou PKCE
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Resposta</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "access_token": "xxx",
  "refresh_token": "xxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "cases:read calculator:use"
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">4. Usar o access token</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`GET /api/v1/cases
Authorization: Bearer access_token`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">5. Refresh token</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`POST /api/trpc/oauth.token
{
  "grantType": "refresh_token",
  "clientId": "imp7_xxx",
  "clientSecret": "xxx",
  "refreshToken": "xxx"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
