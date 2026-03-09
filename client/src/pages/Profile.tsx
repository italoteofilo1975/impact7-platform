import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, Trophy, Star, Flame, Target, Award, 
  ChevronRight, TrendingUp, Calendar, Zap, Crown,
  Medal, Gift, User, Lock, Save, Eye, EyeOff, Building2, Phone, FileText, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const RARITY_COLORS = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
};

const RARITY_LABELS = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: stats, isLoading: statsLoading } = trpc.gamification.getStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: allBadges } = trpc.gamification.getAllBadges.useQuery();
  const { data: leaderboard } = trpc.gamification.getLeaderboard.useQuery({ limit: 10 });
  
  // GDPR mutations
  const exportDataMutation = trpc.gdpr.exportData.useMutation();
  const deletionMutation = trpc.gdpr.requestDeletion.useMutation();

  // Profile editing state
  const [profileForm, setProfileForm] = useState({ name: "", bio: "", phone: "", organization: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { data: profileData, refetch: refetchProfile } = trpc.auth.getProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Sync profile form when data loads
  const [profileFormInitialized, setProfileFormInitialized] = useState(false);
  if (profileData && !profileFormInitialized) {
    const pd = profileData as any;
    setProfileForm({ name: pd.name || "", bio: pd.bio || "", phone: pd.phone || "", organization: pd.organization || "" });
    setProfileFormInitialized(true);
  }

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => { toast.success("Perfil atualizado!"); refetchProfile(); },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar perfil"),
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => { toast.success("Senha alterada com sucesso!"); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setPasswordError(""); },
    onError: (err: any) => toast.error(err.message || "Senha atual incorreta"),
  });

  const handleProfileSave = () => updateProfileMutation.mutate({ name: profileForm.name, bio: profileForm.bio, phone: profileForm.phone, organization: profileForm.organization });

  const handlePasswordChange = () => {
    setPasswordError("");
    if (passwordForm.newPassword.length < 8) { setPasswordError("A nova senha deve ter pelo menos 8 caracteres."); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError("As senhas não coincidem."); return; }
    changePasswordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle>Acesse seu Perfil</CardTitle>
            <CardDescription>
              Faça login para ver suas conquistas, pontos e badges do Jarvis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href={getLoginUrl()}>
              <Button size="lg">
                Fazer Login
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const earnedBadgeIds = new Set(stats?.badges?.map(b => b.id) || []);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e conquistas
            </p>
          </div>
        </div>
        
        {/* User Stats Hero */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar & Level */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-bold">
                  Nv. {stats?.level || 1}
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{user?.name || "Usuário"}</h2>
                <p className="text-muted-foreground mb-4">{user?.email}</p>
                
                {/* Progress to next level */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso para Nível {(stats?.level || 1) + 1}</span>
                    <span>{stats?.progressPercent || 0}%</span>
                  </div>
                  <Progress value={stats?.progressPercent || 0} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {stats?.pointsToNextLevel || 100} pontos para o próximo nível
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Star className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                  <div className="text-2xl font-bold">{stats?.points || 0}</div>
                  <div className="text-xs text-muted-foreground">Pontos</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Flame className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                  <div className="text-2xl font-bold">{stats?.streak || 0}</div>
                  <div className="text-xs text-muted-foreground">Dias Seguidos</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Target className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <div className="text-2xl font-bold">{stats?.totalInteractions || 0}</div>
                  <div className="text-xs text-muted-foreground">Interações</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Trophy className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <div className="text-2xl font-bold">#{stats?.rank || "-"}</div>
                  <div className="text-xs text-muted-foreground">Ranking</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="badges">Badges ({stats?.badges?.length || 0}/{allBadges?.length || 0})</TabsTrigger>
            <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="meus-dados" className="gap-1"><User className="h-3.5 w-3.5" />Meus Dados</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.badges && stats.badges.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {stats.badges.slice(0, 6).map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                          title={badge.description || ""}
                        >
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{badge.name}</div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]} text-white`}
                            >
                              {RARITY_LABELS[badge.rarity as keyof typeof RARITY_LABELS]}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum badge conquistado ainda</p>
                      <p className="text-sm">Continue usando o Jarvis para ganhar badges!</p>
                    </div>
                  )}
                  {stats?.badges && stats.badges.length > 6 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("badges")}
                    >
                      Ver todos os badges
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              {/* Points Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Como Ganhar Pontos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>Pergunta ao Jarvis</span>
                      <Badge>+10 pts</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>Usar Calculadora</span>
                      <Badge>+15 pts</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>Favoritar Case</span>
                      <Badge>+5 pts</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>Download de Case</span>
                      <Badge>+10 pts</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>Login Diário</span>
                      <Badge>+20 pts</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>Bônus de Streak</span>
                      <Badge variant="secondary">+10 pts/dia</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Badges Tab */}
          <TabsContent value="badges">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBadges?.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                return (
                  <Card 
                    key={badge.id} 
                    className={`transition-all ${isEarned ? "border-primary" : "opacity-60 grayscale"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${
                            isEarned ? "" : "bg-muted"
                          }`}
                          style={{ backgroundColor: isEarned ? badge.color + "20" : undefined }}
                        >
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{badge.name}</h3>
                            {isEarned && <Medal className="w-4 h-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {badge.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline"
                              className={`${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]} text-white`}
                            >
                              {RARITY_LABELS[badge.rarity as keyof typeof RARITY_LABELS]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              +{badge.pointsReward} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Top 10 Usuários
                </CardTitle>
                <CardDescription>
                  Os usuários mais ativos da plataforma IMPACT7
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard?.map((entry, index) => (
                    <div 
                      key={entry.userId}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        entry.userId === user?.id ? "bg-primary/10 border border-primary/20" : "bg-muted"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-amber-600 text-white" :
                        "bg-muted-foreground/20"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {entry.userId === user?.id ? user.name || "Você" : `Usuário #${entry.userId}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Nível {entry.level} • {entry.totalInteractions} interações
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{entry.points.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">pontos</div>
                      </div>
                      {entry.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm font-medium">{entry.streak}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Histórico de Pontos
                </CardTitle>
                <CardDescription>
                  Suas últimas transações de pontos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentTransactions.map((tx) => (
                      <div 
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {tx.reason.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <Badge variant={tx.points > 0 ? "default" : "destructive"}>
                          {tx.points > 0 ? "+" : ""}{tx.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma transação ainda</p>
                    <p className="text-sm">Comece a usar a plataforma para ganhar pontos!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meus Dados Tab */}
          <TabsContent value="meus-dados">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Editar Perfil */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Dados Pessoais</CardTitle>
                  <CardDescription>Atualize suas informações de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Nome completo</Label>
                    <Input id="profile-name" value={profileForm.name} onChange={e => setProfileForm(f => ({...f, name: e.target.value}))} placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-org" className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />Organização</Label>
                    <Input id="profile-org" value={profileForm.organization} onChange={e => setProfileForm(f => ({...f, organization: e.target.value}))} placeholder="Nome da organização" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone" className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Telefone</Label>
                    <Input id="profile-phone" value={profileForm.phone} onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))} placeholder="+55 11 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-bio" className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />Bio</Label>
                    <Textarea id="profile-bio" value={profileForm.bio} onChange={e => setProfileForm(f => ({...f, bio: e.target.value}))} placeholder="Fale um pouco sobre você..." rows={3} />
                  </div>
                  <Button onClick={handleProfileSave} disabled={updateProfileMutation.isPending} className="w-full">
                    {updateProfileMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar Dados</>}
                  </Button>
                </CardContent>
              </Card>

              {/* Alterar Senha */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Alterar Senha</CardTitle>
                  <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive"><AlertDescription>{passwordError}</AlertDescription></Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="current-pass">Senha atual</Label>
                    <div className="relative">
                      <Input id="current-pass" type={showPasswords ? "text" : "password"} value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({...f, currentPassword: e.target.value}))} placeholder="Senha atual" />
                      <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-7 w-7 p-0" onClick={() => setShowPasswords(v => !v)}>{showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-pass">Nova senha</Label>
                    <Input id="new-pass" type={showPasswords ? "text" : "password"} value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({...f, newPassword: e.target.value}))} placeholder="Mínimo 8 caracteres" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass">Confirmar nova senha</Label>
                    <Input id="confirm-pass" type={showPasswords ? "text" : "password"} value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({...f, confirmPassword: e.target.value}))} placeholder="Repita a nova senha" />
                  </div>
                  <Separator />
                  <Button onClick={handlePasswordChange} disabled={changePasswordMutation.isPending || !passwordForm.currentPassword || !passwordForm.newPassword} className="w-full">
                    {changePasswordMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Alterando...</> : <><Lock className="w-4 h-4 mr-2" />Alterar Senha</>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Privacidade (GDPR)</CardTitle>
                <CardDescription>
                  Gerencie seus dados pessoais de acordo com o Regulamento Geral de Proteção de Dados (GDPR)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Exportar Dados */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Exportar Meus Dados</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Baixe uma cópia de todos os seus dados pessoais armazenados na plataforma (Art. 20 GDPR - Direito à Portabilidade).
                  </p>
                  <Button 
                    variant="outline"
                    disabled={exportDataMutation.isPending}
                    onClick={() => {
                      exportDataMutation.mutate(undefined, {
                        onSuccess: (data) => {
                          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `meus-dados-impact7-${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        },
                        onError: (error) => {
                          alert(`Erro ao exportar dados: ${error.message}`);
                        },
                      });
                    }}
                  >
                    {exportDataMutation.isPending ? 'Exportando...' : 'Exportar Dados (JSON)'}
                  </Button>
                </div>

                {/* Excluir Conta */}
                <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5">
                  <h3 className="font-semibold text-destructive mb-2">Excluir Minha Conta</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exclua permanentemente sua conta e todos os seus dados da plataforma (Art. 17 GDPR - Direito ao Esquecimento). Esta ação é irreversível.
                  </p>
                  <Button 
                    variant="destructive"
                    disabled={deletionMutation.isPending}
                    onClick={() => {
                      const confirmation = prompt('Para confirmar a exclusão da sua conta, digite "DELETE" (em maiúsculas):');
                      if (confirmation === 'DELETE') {
                        deletionMutation.mutate({ confirmation }, {
                          onSuccess: () => {
                            alert('Sua conta foi excluída com sucesso. Você será redirecionado.');
                            window.location.href = '/';
                          },
                          onError: (error) => {
                            alert(`Erro ao excluir conta: ${error.message}`);
                          },
                        });
                      }
                    }}
                  >
                    {deletionMutation.isPending ? 'Excluindo...' : 'Excluir Conta Permanentemente'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
