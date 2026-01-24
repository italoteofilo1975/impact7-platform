import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Building,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainNavbar from "@/components/MainNavbar";
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type SubmissionStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

const statusConfig: Record<SubmissionStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  reviewing: { label: 'Em Revisão', color: 'bg-blue-500/10 text-blue-600', icon: Eye },
  approved: { label: 'Aprovado', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  rejected: { label: 'Rejeitado', color: 'bg-red-500/10 text-red-600', icon: XCircle },
};

export default function AdminCaseReview() {
  const { user, loading, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<SubmissionStatus>('approved');

  const { data: submissions, isLoading, refetch } = trpc.cases.getSubmissions.useQuery();

  const updateStatusMutation = trpc.cases.updateSubmissionStatus.useMutation({
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!');
      setReviewDialogOpen(false);
      setReviewNotes('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });

  const handleOpenReview = (submission: any, status: SubmissionStatus) => {
    setSelectedSubmission(submission);
    setNewStatus(status);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedSubmission) return;
    
    updateStatusMutation.mutate({
      submissionId: selectedSubmission.id,
      status: newStatus,
      reviewNotes: reviewNotes || undefined,
    });
  };

  const filteredSubmissions = submissions?.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch = 
      sub.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const stats = {
    total: submissions?.length || 0,
    pending: submissions?.filter(s => s.status === 'pending').length || 0,
    reviewing: submissions?.filter(s => s.status === 'reviewing').length || 0,
    approved: submissions?.filter(s => s.status === 'approved').length || 0,
    rejected: submissions?.filter(s => s.status === 'rejected').length || 0,
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <div className="pt-32 container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground mb-6">
                Esta página é restrita a administradores.
              </p>
              <Link href="/admin">
                <Button>Voltar ao Admin</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <AdminBreadcrumb items={[{ label: 'Revisão de Cases' }]} />
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Revisão de Cases
              </h1>
              <p className="text-muted-foreground">
                Gerencie as submissões de cases de organizações parceiras
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter('all')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-yellow-500/50 transition-colors" onClick={() => setStatusFilter('pending')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => setStatusFilter('reviewing')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
                <div className="text-xs text-muted-foreground">Em Revisão</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-green-500/50 transition-colors" onClick={() => setStatusFilter('approved')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-xs text-muted-foreground">Aprovados</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setStatusFilter('rejected')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-xs text-muted-foreground">Rejeitados</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por projeto, organização ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="reviewing">Em Revisão</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma submissão encontrada</h3>
                <p className="text-muted-foreground">
                  {statusFilter !== 'all' 
                    ? `Não há submissões com status "${statusConfig[statusFilter as SubmissionStatus]?.label}"`
                    : 'Ainda não há submissões de cases para revisar'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => {
                const status = submission.status as SubmissionStatus;
                const StatusIcon = statusConfig[status]?.icon || Clock;
                const isExpanded = expandedId === submission.id;
                const metrics = submission.metrics ? JSON.parse(submission.metrics) : [];

                return (
                  <Card key={submission.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={statusConfig[status]?.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig[status]?.label}
                              </Badge>
                              <Badge variant="outline">{submission.sector}</Badge>
                            </div>
                            <h3 className="font-semibold text-lg">{submission.projectTitle}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                {submission.organizationName}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {submission.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(submission.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenReview(submission, 'reviewing');
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Revisar
                                </Button>
                              </>
                            )}
                            {status === 'reviewing' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenReview(submission, 'approved');
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenReview(submission, 'rejected');
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t p-4 bg-muted/30">
                          <Tabs defaultValue="details">
                            <TabsList className="mb-4">
                              <TabsTrigger value="details">Detalhes</TabsTrigger>
                              <TabsTrigger value="impact">Impacto</TabsTrigger>
                              <TabsTrigger value="contact">Contato</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-4">
                              <div className="grid md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Investimento:</span>
                                  <span className="font-medium">{submission.investment}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Beneficiários:</span>
                                  <span className="font-medium">{submission.beneficiaries}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Duração:</span>
                                  <span className="font-medium">{submission.duration}</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Descrição</h4>
                                <p className="text-sm text-muted-foreground">{submission.description}</p>
                              </div>
                              {submission.documentUrl && (
                                <div>
                                  <h4 className="font-medium mb-2">Documentação</h4>
                                  <a 
                                    href={submission.documentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {submission.documentUrl}
                                  </a>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="impact" className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2 text-red-500">Desafio</h4>
                                <p className="text-sm text-muted-foreground">{submission.challenge}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2 text-blue-500">Solução</h4>
                                <p className="text-sm text-muted-foreground">{submission.solution}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2 text-green-500">Resultados</h4>
                                <p className="text-sm text-muted-foreground">{submission.results}</p>
                              </div>
                              {metrics.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Métricas</h4>
                                  <div className="grid md:grid-cols-3 gap-2">
                                    {metrics.map((m: any, i: number) => (
                                      <div key={i} className="p-2 bg-background rounded border">
                                        <div className="text-xs text-muted-foreground">{m.label}</div>
                                        <div className="font-semibold">{m.value}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="contact" className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-1">Nome do Contato</h4>
                                  <p className="text-sm text-muted-foreground">{submission.contactName}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-1">Email</h4>
                                  <a 
                                    href={`mailto:${submission.contactEmail}`}
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {submission.contactEmail}
                                  </a>
                                </div>
                                {submission.contactPhone && (
                                  <div>
                                    <h4 className="font-medium mb-1">Telefone</h4>
                                    <p className="text-sm text-muted-foreground">{submission.contactPhone}</p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>

                          {/* Review Notes */}
                          {submission.reviewNotes && (
                            <div className="mt-4 p-3 bg-background rounded border">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Notas da Revisão</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{submission.reviewNotes}</p>
                              {submission.reviewedAt && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Revisado em {new Date(submission.reviewedAt).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'reviewing' && 'Iniciar Revisão'}
              {newStatus === 'approved' && 'Aprovar Case'}
              {newStatus === 'rejected' && 'Rejeitar Case'}
            </DialogTitle>
            <DialogDescription>
              {newStatus === 'reviewing' && 'Marcar este case como "Em Revisão" para análise detalhada.'}
              {newStatus === 'approved' && 'Aprovar este case para publicação na plataforma.'}
              {newStatus === 'rejected' && 'Rejeitar este case com feedback para a organização.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedSubmission && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedSubmission.projectTitle}</p>
                <p className="text-sm text-muted-foreground">{selectedSubmission.organizationName}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">
                Notas da Revisão {newStatus === 'rejected' && '(recomendado)'}
              </Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  newStatus === 'rejected' 
                    ? 'Explique o motivo da rejeição e sugestões de melhoria...'
                    : 'Adicione observações sobre a revisão (opcional)...'
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={updateStatusMutation.isPending}
              className={
                newStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                newStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                ''
              }
            >
              {updateStatusMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
