import { useState } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "../const";
import {
  Users,
  Gift,
  Copy,
  Send,
  CheckCircle,
  Clock,
  TrendingUp,
  Share2,
  Mail,
  Coins,
} from "lucide-react";

export default function Referrals() {
  const { user, isAuthenticated } = useAuth();
  // toast from sonner
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: referralCode, isLoading: loadingCode } = trpc.referrals.getCode.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: stats, isLoading: loadingStats } = trpc.referrals.getStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: history, isLoading: loadingHistory } = trpc.referrals.getHistory.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const inviteMutation = trpc.referrals.invite.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Convite enviado!", {
          description: `Um convite foi registrado para ${inviteEmail}`,
        });
        setInviteEmail("");
      } else {
        toast.error("Convite já existe", {
          description: "Este email já foi convidado anteriormente",
        });
      }
    },
    onError: () => {
      toast.error("Erro", {
        description: "Não foi possível enviar o convite",
      });
    },
  });

  const referralLink = referralCode?.code
    ? `${window.location.origin}?ref=${referralCode.code}`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado!", {
      description: "O link de indicação foi copiado para a área de transferência",
    });
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Conheça o IMPACT7 - a plataforma que transforma sustentabilidade em resultados mensuráveis! Use meu link: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(referralLink);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank"
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Gift className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Programa de Indicações</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Indique amigos e ganhe tokens de impacto! Cada indicação que se
              tornar cliente vale 100 tokens.
            </p>
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Entrar para Participar</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Programa de Indicações</h1>
          <p className="text-muted-foreground">
            Indique amigos e ganhe tokens de impacto por cada conversão
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Indicados</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Convertidos</p>
                  <p className="text-2xl font-bold">{stats?.converted || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Coins className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Ganhos</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referral Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Seu Link de Indicação
              </CardTitle>
              <CardDescription>
                Compartilhe este link para ganhar tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={shareOnWhatsApp}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={shareOnLinkedIn}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Seu código:</p>
                <p className="text-2xl font-bold font-mono">{referralCode?.code || "..."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Invite by Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Convidar por Email
              </CardTitle>
              <CardDescription>
                Envie um convite direto para um amigo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button
                  onClick={() => inviteMutation.mutate({ email: inviteEmail })}
                  disabled={!inviteEmail || inviteMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Recompensas
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Você ganha <strong>100 tokens</strong> por cada conversão</li>
                  <li>• Seu amigo ganha <strong>10% de desconto</strong> no primeiro mês</li>
                  <li>• Sem limite de indicações!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Histórico de Indicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.referredEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Convidado em {new Date(item.invitedAt!).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.rewardApplied && (
                        <span className="text-sm text-green-600 font-medium">
                          +{item.rewardAmount} tokens
                        </span>
                      )}
                      <Badge
                        variant={
                          item.status === "converted" || item.status === "rewarded"
                            ? "default"
                            : item.status === "signed_up"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {item.status === "pending" && "Pendente"}
                        {item.status === "signed_up" && "Cadastrado"}
                        {item.status === "converted" && "Convertido"}
                        {item.status === "rewarded" && "Recompensado"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Você ainda não fez nenhuma indicação
                </p>
                <p className="text-sm text-muted-foreground">
                  Compartilhe seu link e comece a ganhar tokens!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
