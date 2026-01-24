import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, Key, Plus, Copy, Trash2, Eye, EyeOff,
  Clock, Shield, AlertTriangle, Check, Code, Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function ApiKeys() {
  const { user, isAuthenticated } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["cases:read"]);
  const [rateLimit, setRateLimit] = useState("1000");
  const [expiresIn, setExpiresIn] = useState<string>("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  
  const { data: permissions } = trpc.publicApi.getPermissions.useQuery();
  const { data: keys, refetch: refetchKeys } = trpc.publicApi.listKeys.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: documentation } = trpc.publicApi.getDocumentation.useQuery();
  
  const createKeyMutation = trpc.publicApi.createKey.useMutation({
    onSuccess: (data) => {
      setNewKey(data.key);
      refetchKeys();
      toast.success("API key criada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar API key: ${error.message}`);
    },
  });
  
  const revokeKeyMutation = trpc.publicApi.revokeKey.useMutation({
    onSuccess: () => {
      refetchKeys();
      toast.success("API key revogada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao revogar API key: ${error.message}`);
    },
  });
  
  const handleCreateKey = () => {
    createKeyMutation.mutate({
      name: newKeyName,
      permissions: selectedPermissions,
      rateLimit: parseInt(rateLimit),
      expiresInDays: expiresIn ? parseInt(expiresIn) : undefined,
    });
  };
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copiada para a área de transferência!");
  };
  
  const handleRevokeKey = (keyId: number) => {
    if (confirm("Tem certeza que deseja revogar esta API key? Esta ação não pode ser desfeita.")) {
      revokeKeyMutation.mutate({ keyId });
    }
  };
  
  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Key className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle>Acesse suas API Keys</CardTitle>
            <CardDescription>
              Faça login para gerenciar suas chaves de API e integrar com a plataforma IMPACT7.
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
              <h1 className="text-3xl font-bold">API Keys</h1>
              <p className="text-muted-foreground">
                Gerencie suas chaves de acesso à API pública
              </p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova API Key</DialogTitle>
                <DialogDescription>
                  Configure as permissões e limites da sua nova chave de API.
                </DialogDescription>
              </DialogHeader>
              
              {newKey ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Importante!</AlertTitle>
                    <AlertDescription>
                      Copie sua API key agora. Ela não será exibida novamente.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={showKey ? "text" : "password"} 
                      value={newKey} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopyKey(newKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setNewKey(null);
                      setShowCreateDialog(false);
                      setNewKeyName("");
                      setSelectedPermissions(["cases:read"]);
                      setRateLimit("1000");
                      setExpiresIn("");
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Concluído
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Key</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Integração CRM"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Permissões</Label>
                    <div className="space-y-2">
                      {permissions && Object.entries(permissions).map(([key, desc]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={selectedPermissions.includes(key)}
                            onCheckedChange={() => togglePermission(key)}
                          />
                          <label htmlFor={key} className="text-sm">
                            <span className="font-medium">{key}</span>
                            <span className="text-muted-foreground ml-2">- {desc}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rateLimit">Rate Limit (req/hora)</Label>
                      <Select value={rateLimit} onValueChange={setRateLimit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                          <SelectItem value="1000">1.000</SelectItem>
                          <SelectItem value="5000">5.000</SelectItem>
                          <SelectItem value="10000">10.000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expires">Expira em (dias)</Label>
                      <Select value={expiresIn} onValueChange={setExpiresIn}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nunca" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nunca</SelectItem>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                          <SelectItem value="180">180 dias</SelectItem>
                          <SelectItem value="365">1 ano</SelectItem>
                        </SelectContent>
                      </Select>
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
                      onClick={handleCreateKey}
                      disabled={!newKeyName || selectedPermissions.length === 0 || createKeyMutation.isPending}
                    >
                      {createKeyMutation.isPending ? "Criando..." : "Criar API Key"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="keys">
          <TabsList className="mb-6">
            <TabsTrigger value="keys">Minhas Keys</TabsTrigger>
            <TabsTrigger value="docs">Documentação</TabsTrigger>
          </TabsList>
          
          {/* Keys Tab */}
          <TabsContent value="keys">
            {keys && keys.length > 0 ? (
              <div className="space-y-4">
                {keys.map((key) => (
                  <Card key={key.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">{key.name}</h3>
                            {key.isActive ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                Ativa
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                                Revogada
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-mono">{key.keyPrefix}...</span>
                            <span className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              {key.rateLimit}/hora
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {key.expiresAt 
                                ? `Expira em ${new Date(key.expiresAt).toLocaleDateString("pt-BR")}`
                                : "Sem expiração"
                              }
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {key.permissions.map((perm) => (
                              <Badge key={perm} variant="secondary" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                          
                          {key.lastUsedAt && (
                            <p className="text-xs text-muted-foreground">
                              Último uso: {new Date(key.lastUsedAt).toLocaleString("pt-BR")}
                            </p>
                          )}
                        </div>
                        
                        {key.isActive && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRevokeKey(key.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Key className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma API key</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie sua primeira API key para começar a integrar com a plataforma IMPACT7.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar API Key
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Documentation Tab */}
          <TabsContent value="docs">
            {documentation && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      {documentation.title}
                    </CardTitle>
                    <CardDescription>
                      Versão {documentation.version} • Base URL: {documentation.baseUrl}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Authentication */}
                      <div>
                        <h3 className="font-semibold mb-2">Autenticação</h3>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm mb-2">{documentation.authentication.description}</p>
                          <code className="text-xs bg-background px-2 py-1 rounded">
                            {documentation.authentication.header}: sua_api_key
                          </code>
                        </div>
                      </div>
                      
                      {/* Endpoints */}
                      <div>
                        <h3 className="font-semibold mb-4">Endpoints</h3>
                        <div className="space-y-4">
                          {documentation.endpoints.map((endpoint, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={endpoint.method === "GET" ? "secondary" : "default"}>
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm font-mono">{endpoint.path}</code>
                                <Badge variant="outline" className="ml-auto">
                                  {endpoint.permission}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {endpoint.description}
                              </p>
                              {endpoint.parameters && (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold mb-1">Parâmetros:</p>
                                  <div className="grid gap-1">
                                    {endpoint.parameters.map((param, pIndex) => (
                                      <div key={pIndex} className="text-xs flex gap-2">
                                        <code className="bg-muted px-1 rounded">{param.name}</code>
                                        <span className="text-muted-foreground">({param.type})</span>
                                        <span>{param.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {endpoint.body && (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold mb-1">Body:</p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(endpoint.body, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Rate Limits */}
                      <div>
                        <h3 className="font-semibold mb-2">Rate Limits</h3>
                        <div className="bg-muted p-4 rounded-lg text-sm">
                          <p><strong>Padrão:</strong> {documentation.rateLimits.default}</p>
                          <p><strong>Personalizado:</strong> {documentation.rateLimits.custom}</p>
                        </div>
                      </div>
                      
                      {/* Errors */}
                      <div>
                        <h3 className="font-semibold mb-2">Códigos de Erro</h3>
                        <div className="grid gap-2">
                          {documentation.errors.map((error, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm">
                              <Badge variant="destructive">{error.code}</Badge>
                              <span>{error.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Example */}
                      <div>
                        <h3 className="font-semibold mb-2">Exemplo de Uso</h3>
                        <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm">
{`curl -X GET "${window.location.origin}/api/v1/cases" \\
  -H "X-API-Key: imp7_sua_api_key_aqui" \\
  -H "Content-Type: application/json"`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
