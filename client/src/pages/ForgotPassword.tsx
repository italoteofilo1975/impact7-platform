import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import NavigationButtons from "@/components/NavigationButtons";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao solicitar recuperação");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // In dev mode, the API returns the reset URL directly
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      setLoading(false);
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (resetUrl) {
      navigator.clipboard.writeText(resetUrl);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-4">
        <NavigationButtons showBack={false} />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Solicitação processada. O administrador foi notificado com o link de recuperação.
                  </AlertDescription>
                </Alert>

                {resetUrl && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      Link de redefinição (válido por 1 hora):
                    </p>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={resetUrl}
                        className="text-xs font-mono bg-muted"
                      />
                      <Button variant="outline" size="icon" onClick={copyLink} title="Copiar link">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(resetUrl, "_self")}
                        title="Abrir link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-amber-600">
                      Quando o serviço de email estiver configurado, este link será enviado automaticamente para {email}.
                    </p>
                  </div>
                )}

                <Button onClick={() => setLocation("/login")} className="w-full">
                  Voltar para o Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email cadastrado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Solicitar Recuperação"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setLocation("/login")}
                    disabled={loading}
                  >
                    Voltar para o Login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
