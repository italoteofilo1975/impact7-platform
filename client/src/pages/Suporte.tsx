import { useState } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "../const";
import MainNavbar from "@/components/MainNavbar";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  HelpCircle,
  FileText,
  Bug,
  Lightbulb,
  CreditCard,
  User,
  ChevronRight,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  billing: <CreditCard className="h-4 w-4" />,
  technical: <Bug className="h-4 w-4" />,
  account: <User className="h-4 w-4" />,
  feature_request: <Lightbulb className="h-4 w-4" />,
  bug_report: <Bug className="h-4 w-4" />,
  general: <HelpCircle className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  waiting_customer: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  waiting_customer: "Aguardando Resposta",
  resolved: "Resolvido",
  closed: "Fechado",
};

export default function Suporte() {
  const { user, isAuthenticated } = useAuth();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    userEmail: "",
    userName: "",
    subject: "",
    description: "",
    category: "general" as const,
    priority: "medium" as const,
  });

  const { data: myTickets, refetch: refetchTickets } = trpc.tickets.myTickets.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: ticketDetails, refetch: refetchDetails } = trpc.tickets.getTicket.useQuery(
    { ticketNumber: selectedTicket || "" },
    { enabled: !!selectedTicket && isAuthenticated }
  );

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: (data) => {
      toast.success("Ticket criado!", {
        description: `Número do ticket: ${data.ticketNumber}`,
      });
      setShowNewTicket(false);
      setFormData({
        userEmail: user?.email || "",
        userName: user?.name || "",
        subject: "",
        description: "",
        category: "general",
        priority: "medium",
      });
      refetchTickets();
    },
    onError: () => {
      toast.error("Erro ao criar ticket");
    },
  });

  const addMessageMutation = trpc.tickets.addMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetchDetails();
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicketMutation.mutate({
      ...formData,
      userEmail: formData.userEmail || user?.email || "",
      userName: formData.userName || user?.name || undefined,
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !ticketDetails?.ticket.id) return;
    addMessageMutation.mutate({
      ticketId: ticketDetails.ticket.id,
      message: newMessage,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <MainNavbar />
      
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Central de Suporte</h1>
            <p className="text-muted-foreground">
              Tire suas dúvidas e acompanhe seus tickets
            </p>
          </div>
          <Button onClick={() => setShowNewTicket(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Ticket
          </Button>
        </div>

        {/* New Ticket Form */}
        {showNewTicket && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Criar Novo Ticket</CardTitle>
              <CardDescription>
                Descreva seu problema ou dúvida em detalhes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.userEmail || user?.email || ""}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.userName || user?.name || ""}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="billing">Faturamento</SelectItem>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="account">Conta</SelectItem>
                        <SelectItem value="feature_request">Sugestão</SelectItem>
                        <SelectItem value="bug_report">Bug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Resumo do seu problema"
                    required
                    minLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva seu problema em detalhes..."
                    rows={5}
                    required
                    minLength={20}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowNewTicket(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createTicketMutation.isPending}>
                    {createTicketMutation.isPending ? "Criando..." : "Criar Ticket"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Ticket Details */}
        {selectedTicket && ticketDetails && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {categoryIcons[ticketDetails.ticket.category || "general"]}
                    {ticketDetails.ticket.subject}
                  </CardTitle>
                  <CardDescription>
                    Ticket #{ticketDetails.ticket.ticketNumber} • Criado em{" "}
                    {new Date(ticketDetails.ticket.createdAt!).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[ticketDetails.ticket.status || "open"]}>
                    {statusLabels[ticketDetails.ticket.status || "open"]}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                    Voltar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {/* Original description */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">{ticketDetails.ticket.userName || "Você"}</p>
                  <p className="text-sm whitespace-pre-wrap">{ticketDetails.ticket.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(ticketDetails.ticket.createdAt!).toLocaleString("pt-BR")}
                  </p>
                </div>
                
                {/* Thread messages */}
                {ticketDetails.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.isStaff ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {msg.senderName}
                      {msg.isStaff && <Badge variant="secondary" className="ml-2 text-xs">Equipe</Badge>}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(msg.createdAt!).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              {ticketDetails.ticket.status !== "closed" && ticketDetails.ticket.status !== "resolved" && (
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || addMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        {!selectedTicket && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Meus Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">
                    Faça login para ver seus tickets
                  </p>
                  <Button asChild>
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                </div>
              ) : myTickets && myTickets.length > 0 ? (
                <div className="space-y-3">
                  {myTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => setSelectedTicket(ticket.ticketNumber)}
                    >
                      <div className="flex items-center gap-3">
                        {categoryIcons[ticket.category || "general"]}
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            #{ticket.ticketNumber} • {new Date(ticket.createdAt!).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[ticket.status || "open"]}>
                          {statusLabels[ticket.status || "open"]}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Você ainda não tem tickets
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Novo Ticket" para criar um
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Como calcular meu impacto?</h4>
                <p className="text-sm text-muted-foreground">
                  Use nossa calculadora de impacto na página inicial para estimar
                  o retorno financeiro das suas iniciativas de sustentabilidade.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Como submeter um case?</h4>
                <p className="text-sm text-muted-foreground">
                  Acesse a seção "Cases" e clique em "Submeter Case". Preencha
                  os dados do projeto e aguarde a aprovação.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">O que são tokens de impacto?</h4>
                <p className="text-sm text-muted-foreground">
                  Tokens são recompensas digitais que você ganha ao contribuir
                  com a plataforma, como submeter cases ou indicar amigos.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Como obter meu certificado?</h4>
                <p className="text-sm text-muted-foreground">
                  Após ter um case aprovado, você pode gerar seu certificado
                  de impacto na seção "Certificados" do seu dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
