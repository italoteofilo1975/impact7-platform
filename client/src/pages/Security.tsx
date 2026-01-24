import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Activity
} from 'lucide-react';

export default function Security() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('2fa');

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            {t('security.title', 'Segurança da Conta')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('security.description', 'Gerencie a segurança da sua conta com autenticação de dois fatores e tokens de acesso.')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="2fa" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              {t('security.tabs.2fa', 'Autenticação 2FA')}
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t('security.tabs.tokens', 'Tokens de Acesso')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="2fa" className="mt-6">
            <TwoFactorSection />
          </TabsContent>

          <TabsContent value="tokens" className="mt-6">
            <AccessTokensSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function TwoFactorSection() {
  const { t } = useTranslation();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { data: status, refetch: refetchStatus } = trpc.twoFactor.getStatus.useQuery();
  const setupMutation = trpc.twoFactor.setup.useMutation();
  const enableMutation = trpc.twoFactor.enable.useMutation();
  const disableMutation = trpc.twoFactor.disable.useMutation();
  const regenerateMutation = trpc.twoFactor.regenerateBackupCodes.useMutation();

  const handleSetup = async () => {
    try {
      const result = await setupMutation.mutateAsync();
      setBackupCodes(result.backupCodes);
      setSetupOpen(true);
    } catch (error) {
      toast.error(t('security.2fa.setupError', 'Erro ao configurar 2FA'));
    }
  };

  const handleEnable = async () => {
    if (verificationCode.length !== 6) {
      toast.error(t('security.2fa.invalidCode', 'Código inválido'));
      return;
    }

    try {
      const result = await enableMutation.mutateAsync({ code: verificationCode });
      if (result.success) {
        toast.success(t('security.2fa.enabled', '2FA ativado com sucesso!'));
        setSetupOpen(false);
        setVerificationCode('');
        refetchStatus();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t('security.2fa.enableError', 'Erro ao ativar 2FA'));
    }
  };

  const handleDisable = async () => {
    if (verificationCode.length < 6) {
      toast.error(t('security.2fa.invalidCode', 'Código inválido'));
      return;
    }

    try {
      const result = await disableMutation.mutateAsync({ code: verificationCode });
      if (result.success) {
        toast.success(t('security.2fa.disabled', '2FA desativado com sucesso!'));
        setDisableOpen(false);
        setVerificationCode('');
        refetchStatus();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t('security.2fa.disableError', 'Erro ao desativar 2FA'));
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (verificationCode.length < 6) {
      toast.error(t('security.2fa.invalidCode', 'Código inválido'));
      return;
    }

    try {
      const result = await regenerateMutation.mutateAsync({ code: verificationCode });
      if (result.success && result.backupCodes) {
        setBackupCodes(result.backupCodes);
        setShowBackupCodes(true);
        toast.success(t('security.2fa.backupCodesRegenerated', 'Códigos de backup regenerados!'));
        setRegenerateOpen(false);
        setVerificationCode('');
        refetchStatus();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t('security.2fa.regenerateError', 'Erro ao regenerar códigos'));
    }
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success(t('security.2fa.allCodesCopied', 'Todos os códigos copiados!'));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('security.2fa.title', 'Autenticação de Dois Fatores')}
              </CardTitle>
              <CardDescription>
                {t('security.2fa.description', 'Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador.')}
              </CardDescription>
            </div>
            <Badge variant={status?.isEnabled ? 'default' : 'secondary'}>
              {status?.isEnabled ? t('security.2fa.active', 'Ativo') : t('security.2fa.inactive', 'Inativo')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.isEnabled ? (
            <>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>{t('security.2fa.protectedTitle', 'Conta Protegida')}</AlertTitle>
                <AlertDescription>
                  {t('security.2fa.protectedDescription', 'Sua conta está protegida com autenticação de dois fatores.')}
                  {status.lastUsedAt && (
                    <span className="block mt-1 text-sm">
                      {t('security.2fa.lastUsed', 'Último uso:')} {new Date(status.lastUsedAt).toLocaleString()}
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t('security.2fa.backupCodes', 'Códigos de Backup')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('security.2fa.backupCodesRemaining', '{{count}} códigos restantes', { count: status.backupCodesRemaining })}
                  </p>
                </div>
                <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('security.2fa.regenerate', 'Regenerar')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('security.2fa.regenerateTitle', 'Regenerar Códigos de Backup')}</DialogTitle>
                      <DialogDescription>
                        {t('security.2fa.regenerateDescription', 'Digite o código do seu aplicativo autenticador para gerar novos códigos de backup. Os códigos antigos serão invalidados.')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-4">
                      <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRegenerateOpen(false)}>
                        {t('common.cancel', 'Cancelar')}
                      </Button>
                      <Button onClick={handleRegenerateBackupCodes} disabled={regenerateMutation.isPending}>
                        {regenerateMutation.isPending ? t('common.loading', 'Carregando...') : t('security.2fa.regenerate', 'Regenerar')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    {t('security.2fa.disable', 'Desativar 2FA')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('security.2fa.disableTitle', 'Desativar 2FA')}</DialogTitle>
                    <DialogDescription>
                      {t('security.2fa.disableDescription', 'Digite o código do seu aplicativo autenticador ou um código de backup para desativar a autenticação de dois fatores.')}
                    </DialogDescription>
                  </DialogHeader>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('common.warning', 'Atenção')}</AlertTitle>
                    <AlertDescription>
                      {t('security.2fa.disableWarning', 'Desativar o 2FA reduzirá a segurança da sua conta.')}
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-center py-4">
                    <InputOTP maxLength={8} value={verificationCode} onChange={setVerificationCode}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                        <InputOTPSlot index={6} />
                        <InputOTPSlot index={7} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDisableOpen(false)}>
                      {t('common.cancel', 'Cancelar')}
                    </Button>
                    <Button variant="destructive" onClick={handleDisable} disabled={disableMutation.isPending}>
                      {disableMutation.isPending ? t('common.loading', 'Carregando...') : t('security.2fa.disable', 'Desativar')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('security.2fa.notProtectedTitle', 'Conta Não Protegida')}</AlertTitle>
                <AlertDescription>
                  {t('security.2fa.notProtectedDescription', 'Recomendamos ativar a autenticação de dois fatores para maior segurança.')}
                </AlertDescription>
              </Alert>

              <Button onClick={handleSetup} disabled={setupMutation.isPending} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                {setupMutation.isPending ? t('common.loading', 'Carregando...') : t('security.2fa.setup', 'Configurar 2FA')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('security.2fa.setupTitle', 'Configurar Autenticação 2FA')}</DialogTitle>
            <DialogDescription>
              {t('security.2fa.setupDescription', 'Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)')}
            </DialogDescription>
          </DialogHeader>

          {setupMutation.data && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={setupMutation.data.qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('security.2fa.manualEntry', 'Entrada manual:')}</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={setupMutation.data.secret} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(setupMutation.data!.secret);
                      toast.success(t('common.copied', 'Copiado!'));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('security.2fa.enterCode', 'Digite o código do aplicativo:')}</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {backupCodes.length > 0 && (
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertTitle>{t('security.2fa.backupCodesTitle', 'Códigos de Backup')}</AlertTitle>
                  <AlertDescription>
                    {t('security.2fa.backupCodesDescription', 'Guarde estes códigos em um lugar seguro. Você pode usá-los para acessar sua conta caso perca acesso ao seu aplicativo autenticador.')}
                  </AlertDescription>
                </Alert>
              )}

              {showBackupCodes || backupCodes.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>{t('security.2fa.backupCodes', 'Códigos de Backup')}</Label>
                    <Button variant="ghost" size="sm" onClick={copyAllBackupCodes}>
                      <Copy className="h-4 w-4 mr-2" />
                      {t('common.copyAll', 'Copiar todos')}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded font-mono text-sm cursor-pointer hover:bg-muted/80"
                        onClick={() => copyBackupCode(code, index)}
                      >
                        <span>{code}</span>
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleEnable} disabled={enableMutation.isPending || verificationCode.length !== 6}>
              {enableMutation.isPending ? t('common.loading', 'Carregando...') : t('security.2fa.activate', 'Ativar 2FA')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes && !setupOpen} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('security.2fa.newBackupCodes', 'Novos Códigos de Backup')}</DialogTitle>
            <DialogDescription>
              {t('security.2fa.backupCodesDescription', 'Guarde estes códigos em um lugar seguro.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={copyAllBackupCodes}>
                <Copy className="h-4 w-4 mr-2" />
                {t('common.copyAll', 'Copiar todos')}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded font-mono text-sm cursor-pointer hover:bg-muted/80"
                  onClick={() => copyBackupCode(code, index)}
                >
                  <span>{code}</span>
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBackupCodes(false)}>
              {t('common.done', 'Concluído')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccessTokensSection() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenExpiry, setNewTokenExpiry] = useState<number | undefined>(90);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const { data: tokens, refetch: refetchTokens } = trpc.accessTokens.list.useQuery();
  const createMutation = trpc.accessTokens.create.useMutation();
  const revokeMutation = trpc.accessTokens.revoke.useMutation();

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast.error(t('security.tokens.nameRequired', 'Nome do token é obrigatório'));
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: newTokenName,
        expiresInDays: newTokenExpiry,
      });
      setCreatedToken(result.token);
      setShowToken(true);
      refetchTokens();
    } catch (error) {
      toast.error(t('security.tokens.createError', 'Erro ao criar token'));
    }
  };

  const handleRevokeToken = async (tokenId: number) => {
    try {
      await revokeMutation.mutateAsync({ tokenId });
      toast.success(t('security.tokens.revoked', 'Token revogado com sucesso'));
      refetchTokens();
    } catch (error) {
      toast.error(t('security.tokens.revokeError', 'Erro ao revogar token'));
    }
  };

  const copyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      toast.success(t('common.copied', 'Copiado!'));
    }
  };

  const closeCreateDialog = () => {
    setCreateOpen(false);
    setNewTokenName('');
    setNewTokenExpiry(90);
    setCreatedToken(null);
    setShowToken(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('security.tokens.title', 'Tokens de Acesso')}
              </CardTitle>
              <CardDescription>
                {t('security.tokens.description', 'Crie tokens para acessar a API programaticamente.')}
              </CardDescription>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('security.tokens.create', 'Criar Token')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('security.tokens.createTitle', 'Criar Novo Token')}</DialogTitle>
                  <DialogDescription>
                    {t('security.tokens.createDescription', 'Tokens permitem acesso programático à API. Guarde o token em um lugar seguro, pois ele não será exibido novamente.')}
                  </DialogDescription>
                </DialogHeader>

                {!createdToken ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tokenName">{t('security.tokens.name', 'Nome do Token')}</Label>
                      <Input
                        id="tokenName"
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                        placeholder={t('security.tokens.namePlaceholder', 'Ex: Integração CRM')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tokenExpiry">{t('security.tokens.expiry', 'Validade (dias)')}</Label>
                      <Input
                        id="tokenExpiry"
                        type="number"
                        value={newTokenExpiry || ''}
                        onChange={(e) => setNewTokenExpiry(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder={t('security.tokens.expiryPlaceholder', 'Deixe vazio para não expirar')}
                        min={1}
                        max={365}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{t('security.tokens.important', 'Importante')}</AlertTitle>
                      <AlertDescription>
                        {t('security.tokens.copyWarning', 'Copie este token agora. Você não poderá vê-lo novamente.')}
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label>{t('security.tokens.yourToken', 'Seu Token')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={showToken ? createdToken : '•'.repeat(40)}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyToken}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {!createdToken ? (
                    <>
                      <Button variant="outline" onClick={closeCreateDialog}>
                        {t('common.cancel', 'Cancelar')}
                      </Button>
                      <Button onClick={handleCreateToken} disabled={createMutation.isPending}>
                        {createMutation.isPending ? t('common.loading', 'Carregando...') : t('security.tokens.create', 'Criar Token')}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={closeCreateDialog}>
                      {t('common.done', 'Concluído')}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {tokens && tokens.length > 0 ? (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{token.name}</span>
                      <Badge variant={token.isActive ? 'default' : 'secondary'}>
                        {token.isActive ? t('security.tokens.active', 'Ativo') : t('security.tokens.revoked', 'Revogado')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">{token.tokenPrefix}...</span>
                      {token.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t('security.tokens.expiresAt', 'Expira em:')} {new Date(token.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                      {token.lastUsedAt && (
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {t('security.tokens.lastUsed', 'Último uso:')} {new Date(token.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                      <span>{t('security.tokens.usageCount', '{{count}} usos', { count: token.usageCount })}</span>
                    </div>
                  </div>
                  {token.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeToken(token.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('security.tokens.noTokens', 'Nenhum token de acesso criado.')}</p>
              <p className="text-sm">{t('security.tokens.createFirst', 'Crie um token para começar a usar a API.')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
