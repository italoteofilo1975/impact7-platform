import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Plus, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import { usePDFDownload } from '@/components/PDFDownload';
import { Streamdown } from 'streamdown';
import { toast } from 'sonner';

const reportTypes = [
  { value: 'impact', label: 'Relatório de Impacto', icon: BarChart3, description: 'Análise completa do impacto social' },
  { value: 'executive_summary', label: 'Resumo Executivo', icon: FileText, description: 'Síntese para stakeholders' },
  { value: 'progress', label: 'Relatório de Progresso', icon: TrendingUp, description: 'Status e marcos alcançados' },
  { value: 'comparison', label: 'Análise Comparativa', icon: FileSpreadsheet, description: 'Comparação entre projetos' },
  { value: 'forecast', label: 'Projeção de Impacto', icon: Brain, description: 'Cenários futuros' },
] as const;

type ReportType = typeof reportTypes[number]['value'];

export default function JarvisReports() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState<ReportType>('impact');
  const [customPrompt, setCustomPrompt] = useState('');
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');

  const { generatePDF, isGenerating: isPDFGenerating } = usePDFDownload();

  const { data: reports, isLoading, refetch } = trpc.jarvisReports.list.useQuery({});
  const { data: selectedReport } = trpc.jarvisReports.get.useQuery(
    { reportId: selectedReportId! },
    { enabled: !!selectedReportId }
  );

  const generateMutation = trpc.jarvisReports.generate.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setTitle('');
      setCustomPrompt('');
    },
    onError: (e) => toast.error(e.message || 'Erro ao gerar relatório'),
  });

  const deleteMutation = trpc.jarvisReports.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedReportId(null);
    },
    onError: (e) => toast.error(e.message || 'Erro ao excluir relatório'),
  });

  const handleGenerate = () => {
    if (!title) return;
    
    generateMutation.mutate({
      title,
      reportType,
      customPrompt: customPrompt || undefined,
      language,
      includeRecommendations: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Concluído</Badge>;
      case 'generating':
        return <Badge className="bg-blue-500/10 text-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Gerando</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Faça login para acessar os relatórios do Jarvis.</p>
            </CardContent>
          </Card>
        </main>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                Relatórios Jarvis IA
              </h1>
              <p className="text-muted-foreground mt-1">
                Geração automática de relatórios de impacto com inteligência artificial
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-orange text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Relatório
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Gerar Novo Relatório</DialogTitle>
                  <DialogDescription>
                    O Jarvis irá gerar um relatório personalizado com base nas suas configurações.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Relatório</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Relatório de Impacto Q4 2024"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Relatório</Label>
                    <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v as 'pt' | 'en' | 'es')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">🇧🇷 Português</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customPrompt">Instruções Adicionais (Opcional)</Label>
                    <Textarea
                      id="customPrompt"
                      placeholder="Ex: Foque nos projetos de educação e inclua análise de tendências..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleGenerate}
                    disabled={!title || generateMutation.isPending}
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Reports List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-semibold text-lg">Meus Relatórios</h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : reports?.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum relatório gerado ainda.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {reports?.map((report) => (
                    <Card 
                      key={report.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedReportId === report.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedReportId(report.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{report.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(report.status)}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Report Content */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedReport.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {getStatusBadge(selectedReport.status)}
                          <span>•</span>
                          <span>
                            {reportTypes.find(t => t.value === selectedReport.reportType)?.label}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={isPDFGenerating || !selectedReport?.content}
                          onClick={() => {
                            if (selectedReport) {
                              const htmlContent = `
                                <html>
                                <head>
                                  <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; }
                                    h1 { color: #1a365d; border-bottom: 2px solid #ed8936; padding-bottom: 10px; }
                                    h2 { color: #2d3748; margin-top: 20px; }
                                    .summary { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
                                    .meta { color: #718096; font-size: 12px; margin-bottom: 20px; }
                                    .content { line-height: 1.6; }
                                  </style>
                                </head>
                                <body>
                                  <h1>${selectedReport.title}</h1>
                                  <div class="meta">
                                    <p>Tipo: ${reportTypes.find(t => t.value === selectedReport.reportType)?.label}</p>
                                    <p>Gerado em: ${new Date(selectedReport.createdAt).toLocaleDateString('pt-BR')}</p>
                                  </div>
                                  ${selectedReport.summary ? `<div class="summary"><h2>Resumo Executivo</h2><p>${selectedReport.summary}</p></div>` : ''}
                                  <div class="content">${selectedReport.content}</div>
                                </body>
                                </html>
                              `;
                              generatePDF(htmlContent, `relatorio-${selectedReport.id}`);
                            }
                          }}
                        >
                          {isPDFGenerating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</>
                          ) : (
                            <><Download className="w-4 h-4 mr-2" />PDF</>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteMutation.mutate({ reportId: selectedReport.id })}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedReport.summary && (
                      <div className="bg-muted/50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium mb-2">Resumo Executivo</h4>
                        <p className="text-sm text-muted-foreground">{selectedReport.summary}</p>
                      </div>
                    )}
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <Streamdown>{selectedReport.content}</Streamdown>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">Selecione um Relatório</h3>
                    <p className="text-muted-foreground">
                      Clique em um relatório na lista para visualizar seu conteúdo.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
