import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { 
  Shield, CheckCircle, XCircle, AlertTriangle,
  Lock, User, Database, Calculator, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// Mapeamento de escopos para ícones e descrições
const SCOPE_INFO: Record<string, { icon: React.ReactNode; description: string; category: string }> = {
  "cases:read": {
    icon: <FileText className="w-4 h-4" />,
    description: "Ver detalhes de cases públicos",
    category: "Cases",
  },
  "cases:list": {
    icon: <Database className="w-4 h-4" />,
    description: "Listar todos os cases disponíveis",
    category: "Cases",
  },
  "cases:stats": {
    icon: <Database className="w-4 h-4" />,
    description: "Acessar estatísticas agregadas de impacto",
    category: "Estatísticas",
  },
  "calculator:use": {
    icon: <Calculator className="w-4 h-4" />,
    description: "Usar a calculadora de impacto social",
    category: "Calculadora",
  },
  "sdgs:read": {
    icon: <FileText className="w-4 h-4" />,
    description: "Ver informações sobre ODS",
    category: "ODS",
  },
  "profile:read": {
    icon: <User className="w-4 h-4" />,
    description: "Ver informações básicas do seu perfil",
    category: "Perfil",
  },
};

export default function OAuthAuthorize() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extrair parâmetros da URL
  const searchParams = new URLSearchParams(window.location.search);
  const clientId = searchParams.get("client_id") || "";
  const redirectUri = searchParams.get("redirect_uri") || "";
  const responseType = searchParams.get("response_type") || "";
  const scope = searchParams.get("scope") || "";
  const state = searchParams.get("state") || "";
  const codeChallenge = searchParams.get("code_challenge") || undefined;
  const codeChallengeMethod = searchParams.get("code_challenge_method") as "plain" | "S256" | undefined;
  
  const scopes = scope.split(" ").filter(s => s);
  
  // Validar autorização
  const { data: validation, isLoading: isValidating } = trpc.oauth.validateAuthorization.useQuery(
    {
      clientId,
      redirectUri,
      scopes,
      state,
      codeChallenge,
      codeChallengeMethod,
    },
    {
      enabled: isAuthenticated && !!clientId && !!redirectUri && scopes.length > 0,
    }
  );
  
  // Mutation para autorizar
  const authorizeMutation = trpc.oauth.authorize.useMutation({
    onSuccess: (data) => {
      // Redirecionar de volta para o client com o code
      const url = new URL(redirectUri);
      url.searchParams.set("code", data.code);
      if (data.state) {
        url.searchParams.set("state", data.state);
      }
      window.location.href = url.toString();
    },
    onError: (err) => {
      setError(err.message);
      setIsAuthorizing(false);
    },
  });
  
  const handleAuthorize = () => {
    setIsAuthorizing(true);
    authorizeMutation.mutate({
      clientId,
      redirectUri,
      scopes,
      state,
      codeChallenge,
      codeChallengeMethod,
    });
  };
  
  const handleDeny = () => {
    // Redirecionar com erro
    const url = new URL(redirectUri);
    url.searchParams.set("error", "access_denied");
    url.searchParams.set("error_description", "User denied the authorization request");
    if (state) {
      url.searchParams.set("state", state);
    }
    window.location.href = url.toString();
  };
  
  // Validação básica
  if (!clientId || !redirectUri || responseType !== "code" || scopes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <CardTitle>Requisição Inválida</CardTitle>
            <CardDescription>
              A requisição de autorização está incompleta ou mal formatada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Parâmetros obrigatórios</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 text-sm">
                  {!clientId && <li>client_id não fornecido</li>}
                  {!redirectUri && <li>redirect_uri não fornecido</li>}
                  {responseType !== "code" && <li>response_type deve ser "code"</li>}
                  {scopes.length === 0 && <li>scope não fornecido</li>}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Se não autenticado, redirecionar para login
  if (!isAuthenticated) {
    const currentUrl = window.location.href;
    const loginUrl = getLoginUrl() + `&redirect=${encodeURIComponent(currentUrl)}`;
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle>Login Necessário</CardTitle>
            <CardDescription>
              Você precisa estar logado para autorizar esta aplicação.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href={loginUrl}>
              <Button size="lg" className="w-full">
                Fazer Login para Continuar
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Se validação falhou
  if (validation && !validation.valid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <CardTitle>Autorização Negada</CardTitle>
            <CardDescription>
              Não foi possível validar esta requisição de autorização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro de Validação</AlertTitle>
              <AlertDescription>{validation.error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Carregando validação
  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validando requisição...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Tela de consent
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <CardTitle className="text-2xl">Autorizar Aplicação</CardTitle>
          <CardDescription>
            <span className="font-semibold text-foreground">{validation?.client?.name || "Aplicação"}</span>
            {" "}está solicitando acesso à sua conta IMPACT7
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações do usuário */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user?.name || "Usuário"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Escopos solicitados */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Esta aplicação poderá:
            </h4>
            <div className="space-y-2">
              {scopes.map((scopeKey) => {
                const info = SCOPE_INFO[scopeKey];
                return (
                  <div 
                    key={scopeKey}
                    className="flex items-center gap-3 p-2 rounded border"
                  >
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                      {info?.icon || <Shield className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {info?.description || scopeKey}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {info?.category || "Permissão"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {scopeKey}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Aviso de segurança */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Informação de Segurança</AlertTitle>
            <AlertDescription className="text-sm">
              Ao autorizar, você permite que esta aplicação acesse os recursos listados acima em seu nome.
              Você pode revogar este acesso a qualquer momento nas configurações da sua conta.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleDeny}
            disabled={isAuthorizing}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Negar
          </Button>
          <Button 
            className="flex-1"
            onClick={handleAuthorize}
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Autorizando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Autorizar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
