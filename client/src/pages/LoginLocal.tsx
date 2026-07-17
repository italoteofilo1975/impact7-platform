/**
 * Pagina de Login Local
 * Permite login com email/senha para usuarios locais
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function LoginLocal() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'setup'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Setup form state (criar primeiro admin)
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState(false);
  
  // Mutations
  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: () => {
      // Redirecionar para admin apos login
      window.location.href = '/admin';
    },
    onError: (error) => {
      setLoginError(error.message);
    },
  });
  
  const createAdminMutation = trpc.auth.createAdmin.useMutation({
    onSuccess: () => {
      setSetupSuccess(true);
      setSetupError('');
      // Limpar form e mudar para aba de login
      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(setupEmail);
        setSetupSuccess(false);
      }, 2000);
    },
    onError: (error) => {
      setSetupError(error.message);
    },
  });
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    loginMutation.mutate({
      email: loginEmail,
      password: loginPassword,
    });
  };
  
  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    
    if (setupPassword !== setupConfirmPassword) {
      setSetupError('As senhas nao coincidem');
      return;
    }
    
    if (setupPassword.length < 6) {
      setSetupError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    createAdminMutation.mutate({
      email: setupEmail,
      password: setupPassword,
      name: setupName,
      masterKey: masterKey || undefined,
    });
  };
  
  return (
    <>
      <SEO 
        title="Login Administrativo"
        description="Acesse o painel administrativo da plataforma IMPACT7"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">IMPACT7 Admin</CardTitle>
            <CardDescription>
              Acesse o painel administrativo
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'setup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="setup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Admin
                </TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@impact7.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Setup Tab */}
              <TabsContent value="setup">
                <form onSubmit={handleSetup} className="space-y-4 mt-4">
                  {setupError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{setupError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {setupSuccess && (
                    <Alert className="border-green-500 bg-green-500/10">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-500">
                        Administrador criado com sucesso! Redirecionando...
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="setup-name">Nome</Label>
                    <Input
                      id="setup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="setup-email">Email</Label>
                    <Input
                      id="setup-email"
                      type="email"
                      placeholder="admin@impact7.com"
                      value={setupEmail}
                      onChange={(e) => setSetupEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="setup-password">Senha</Label>
                    <Input
                      id="setup-password"
                      type="password"
                      placeholder="Minimo 6 caracteres"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="setup-confirm">Confirmar Senha</Label>
                    <Input
                      id="setup-confirm"
                      type="password"
                      placeholder="Repita a senha"
                      value={setupConfirmPassword}
                      onChange={(e) => setSetupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="master-key">Chave Mestra (opcional)</Label>
                    <Input
                      id="master-key"
                      type="password"
                      placeholder="Necessaria se ja existir admin"
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Necessaria apenas se ja existir um administrador no sistema
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createAdminMutation.isPending || setupSuccess}
                  >
                    {createAdminMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Criar Administrador
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Ou volte para a página inicial
              </p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => navigate('/')}
              >
                Voltar para Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
