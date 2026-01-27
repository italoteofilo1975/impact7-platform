import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, FileText, Download, Calendar, Users, Briefcase, Award, Coins, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type Period = "7d" | "30d" | "90d" | "365d" | "all";

export default function AdminReports() {
  const { user, isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<Period>("30d");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch data
  const { data: leads } = trpc.leads.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: whitepaperDownloads } = trpc.downloads.listWhitepaper.useQuery(undefined, { enabled: isAuthenticated });
  const { data: ebookDownloads } = trpc.downloads.listEbook.useQuery(undefined, { enabled: isAuthenticated });
  const { data: cases } = trpc.cases.getSubmissions.useQuery(undefined, { enabled: isAuthenticated });
  const { data: certificates } = trpc.certificates.getPublic.useQuery(undefined, { enabled: isAuthenticated });
  const { data: tokenStats } = trpc.tokens.getStats.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const { data: activityMetrics } = trpc.leads.activityMetrics.useQuery(undefined, { enabled: isAuthenticated });

  // Filter by period
  const filterByPeriod = <T extends Record<string, any>>(
    items: T[] | undefined,
    dateField: "createdAt" | "downloadedAt" = "createdAt"
  ): T[] => {
    if (!items) return [];
    if (period === "all") return items;

    const now = new Date();
    const daysMap: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90, "365d": 365, "all": 0 };
    const days = daysMap[period];
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return items.filter((item) => {
      const date = item[dateField];
      if (!date) return false;
      return new Date(date) >= cutoff;
    });
  };

  // Calculate metrics
  const filteredLeads = filterByPeriod(leads);
  const filteredWhitepaper = filterByPeriod(whitepaperDownloads, "downloadedAt");
  const filteredEbook = filterByPeriod(ebookDownloads, "downloadedAt");
  const filteredCases = filterByPeriod(cases);
  const filteredCertificates = filterByPeriod(certificates);

  const totalLeads = filteredLeads.length;
  const totalDownloads = filteredWhitepaper.length + filteredEbook.length;
  const totalCases = filteredCases.length;
  const approvedCases = filteredCases.filter((c) => c.status === "approved").length;
  const pendingCases = filteredCases.filter((c) => c.status === "pending" || c.status === "reviewing").length;
  const totalCertificates = filteredCertificates.length;
  const conversionRate = totalLeads > 0 ? Math.round((totalDownloads / totalLeads) * 100) : 0;
  const caseApprovalRate = totalCases > 0 ? Math.round((approvedCases / totalCases) * 100) : 0;

  // Lead sources breakdown
  const leadSources = filteredLeads.reduce((acc, lead) => {
    const source = lead.source || "Desconhecido";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Case sectors breakdown
  const caseSectors = filteredCases.reduce((acc, c) => {
    const sector = c.sector || "Outros";
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Mutation para gerar PDF
  const generatePDFMutation = trpc.reports.generatePDF.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Relatório PDF exportado com sucesso!');
      setIsExporting(false);
    },
    onError: () => {
      toast.error('Erro ao gerar relatório PDF');
      setIsExporting(false);
    },
  });

  // Export report as PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const periodLabel = period === 'all' ? 'Todo o período' : `Últimos ${period.replace('d', ' dias')}`;
      
      generatePDFMutation.mutate({
        period: periodLabel,
        metrics: {
          totalLeads,
          totalDownloads,
          totalCases,
          approvedCases,
          pendingCases,
          totalCertificates,
          conversionRate,
          caseApprovalRate,
        },
        leadSources,
        caseSectors,
        activityData: activityMetrics ? {
          days: activityMetrics.days,
          leads: activityMetrics.leads,
          downloads: activityMetrics.downloads,
        } : undefined,
      });
    } catch {
      toast.error('Erro ao exportar relatório');
      setIsExporting(false);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Acesso restrito a administradores.</p>
            <Link href="/admin">
              <Button className="mt-4">Voltar ao Admin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <AdminBreadcrumb items={[{ label: "Relatórios" }]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Relatórios Consolidados
              </h1>
              <p className="text-muted-foreground">Visão geral de todas as métricas da plataforma</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="365d">Último ano</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExportPDF} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar Relatório"}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                  <div className="text-sm text-muted-foreground">Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalDownloads}</div>
                  <div className="text-sm text-muted-foreground">Downloads</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalCases}</div>
                  <div className="text-sm text-muted-foreground">Cases</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalCertificates}</div>
                  <div className="text-sm text-muted-foreground">Certificados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
                  <div className="text-3xl font-bold text-primary">{conversionRate}%</div>
                </div>
                <TrendingUp className="w-8 h-8 text-primary/30" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Leads → Downloads
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Taxa de Aprovação</div>
                  <div className="text-3xl font-bold text-green-500">{caseApprovalRate}%</div>
                </div>
                <Briefcase className="w-8 h-8 text-green-500/30" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {approvedCases} de {totalCases} cases aprovados
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Tokens de Impacto</div>
                  <div className="text-3xl font-bold text-amber-500">{tokenStats?.totalTokens || 0}</div>
                </div>
                <Coins className="w-8 h-8 text-amber-500/30" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {tokenStats?.totalHolders || 0} holders | {tokenStats?.totalTransactions || 0} transações
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          {activityMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Atividade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-32">
                  {activityMetrics.days.map((day, i) => {
                    const maxValue = Math.max(...activityMetrics.leads, ...activityMetrics.downloads, 1);
                    const leadsHeight = (activityMetrics.leads[i] / maxValue) * 100;
                    const downloadsHeight = (activityMetrics.downloads[i] / maxValue) * 100;
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex gap-1 items-end h-24 w-full justify-center">
                          <div
                            className="w-3 bg-primary rounded-t transition-all"
                            style={{ height: `${Math.max(leadsHeight, 4)}%` }}
                            title={`Leads: ${activityMetrics.leads[i]}`}
                          />
                          <div
                            className="w-3 bg-green-500 rounded-t transition-all"
                            style={{ height: `${Math.max(downloadsHeight, 4)}%` }}
                            title={`Downloads: ${activityMetrics.downloads[i]}`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded" />
                    <span className="text-muted-foreground">Leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-muted-foreground">Downloads</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lead Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Leads por Fonte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(leadSources)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([source, count]) => {
                    const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                    return (
                      <div key={source}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{source}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(leadSources).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum lead no período selecionado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases by Sector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Cases por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(caseSectors)
                .sort(([, a], [, b]) => b - a)
                .map(([sector, count]) => {
                  const percentage = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0;
                  return (
                    <div key={sector} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{sector}</span>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(caseSectors).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                  Nenhum case no período selecionado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Items Alert */}
        {pendingCases > 0 && (
          <Card className="mt-6 border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Cases Pendentes de Revisão</div>
                  <div className="text-sm text-muted-foreground">
                    {pendingCases} {pendingCases === 1 ? "case aguarda" : "cases aguardam"} análise
                  </div>
                </div>
                <Link href="/admin/cases">
                  <Button variant="outline" size="sm">
                    Revisar Agora
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
