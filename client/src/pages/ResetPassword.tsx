import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import NavigationButtons from "@/components/NavigationButtons";
import { toast } from "sonner";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(true);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setValidating(false);
      return;
    }

    fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        setTokenValid(data.valid === true);
        setValidating(false);
      })
      .catch(() => {
        setTokenValid(false);
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao redefinir senha.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Senha redefinida com sucesso!");
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => setLocation("/login"), 3000);
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Validando link de recuperação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-4">
        <NavigationButtons showBack={false} />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
            <CardDescription>
              {tokenValid === false
                ? "Este link é inválido ou já foi utilizado."
                : "Crie uma nova senha segura para sua conta."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokenValid === false ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O link de recuperação é inválido, expirou ou já foi utilizado. Solicite um novo link.
                  </AlertDescription>
                </Alert>
                <Button onClick={() => setLocation("/forgot-password")} className="w-full">
                  Solicitar Novo Link
                </Button>
              </div>
            ) : success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Senha redefinida com sucesso! Você será redirecionado para o login em instantes.
                  </AlertDescription>
                </Alert>
                <Button onClick={() => setLocation("/login")} className="w-full">
                  Ir para o Login
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
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 8 && (
                    <p className="text-xs text-destructive">Mínimo de 8 caracteres</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">As senhas não coincidem</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    "Redefinir Senha"
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
