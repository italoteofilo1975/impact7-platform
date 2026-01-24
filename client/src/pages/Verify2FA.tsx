import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Verify2FA() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');

  // Get the redirect path from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      setRedirectPath(decodeURIComponent(redirect));
    }
  }, []);

  // Check if user has 2FA enabled
  const { data: status, isLoading: statusLoading } = trpc.twoFactor.getStatus.useQuery();

  // If 2FA is not enabled, redirect to the original destination
  useEffect(() => {
    if (!statusLoading && status && !status.isEnabled) {
      setLocation(redirectPath);
    }
  }, [status, statusLoading, redirectPath, setLocation]);

  const verifyMutation = trpc.twoFactor.verify.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(t('security.2fa.verificationSuccess', 'Verificação bem-sucedida'), {
          description: t('security.2fa.accessGranted', 'Acesso concedido. Redirecionando...'),
        });
        // Set a flag in session storage to indicate 2FA was verified
        sessionStorage.setItem('2fa_verified', 'true');
        sessionStorage.setItem('2fa_verified_at', Date.now().toString());
        // Redirect to original destination
        setTimeout(() => {
          setLocation(redirectPath);
        }, 500);
      } else {
        setError(data.message || t('security.2fa.invalidCode', 'Código inválido'));
      }
    },
    onError: (err) => {
      setError(err.message || t('security.2fa.verificationError', 'Erro ao verificar código'));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      await verifyMutation.mutateAsync({ code: code.trim() });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, isBackupCode ? 10 : 6);
    setCode(value);
    setError('');
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t('security.2fa.verifyTitle', 'Verificação em Duas Etapas')}
          </CardTitle>
          <CardDescription>
            {isBackupCode
              ? t('security.2fa.enterBackupCode', 'Digite um dos seus códigos de backup')
              : t('security.2fa.enterCode', 'Digite o código de 6 dígitos do seu aplicativo autenticador')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern={isBackupCode ? "[A-Za-z0-9]*" : "[0-9]*"}
                  placeholder={isBackupCode ? "XXXXXXXXXX" : "000000"}
                  value={code}
                  onChange={handleCodeChange}
                  className="pl-10 text-center text-2xl tracking-[0.5em] font-mono"
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifying || code.length < (isBackupCode ? 8 : 6)}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.verifying', 'Verificando...')}
                </>
              ) : (
                t('common.verify', 'Verificar')
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground"
                onClick={() => {
                  setIsBackupCode(!isBackupCode);
                  setCode('');
                  setError('');
                }}
              >
                {isBackupCode
                  ? t('security.2fa.useAuthenticator', 'Usar código do autenticador')
                  : t('security.2fa.useBackupCode', 'Usar código de backup')}
              </Button>
            </div>

            {status && status.backupCodesRemaining !== undefined && status.backupCodesRemaining < 3 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('security.2fa.lowBackupCodes', 'Você tem apenas {{count}} códigos de backup restantes. Considere gerar novos códigos.', { count: status.backupCodesRemaining })}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
