import { Link, useLocation, useSearch } from "wouter";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  Scale, 
  X, 
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Building,
  Target,
  Award,
  BarChart3,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Helper to normalize a DB case row to UI format
function normalizeCaseForCompare(c: any) {
  const sdgs: string[] = typeof c.sdgs === 'string'
    ? (() => { try { return JSON.parse(c.sdgs); } catch { return []; } })()
    : (c.sdgs || []);
  const metricsRaw: Array<{label: string; value: string; change?: string}> = typeof c.metrics === 'string'
    ? (() => { try { return JSON.parse(c.metrics); } catch { return []; } })()
    : (c.metrics || []);
  const sroiNum = parseFloat(String(c.sroi || '0'));
  const sRoiValue = sroiNum > 100 ? sroiNum / 100 : sroiNum;
  const sRoiFormatted = `${sRoiValue.toFixed(1)}x`;
  const investmentNum = parseFloat(String(c.investment || '0'));
  const investmentFormatted = investmentNum >= 1000000
    ? `R$ ${(investmentNum / 1000000).toFixed(1)}M`
    : investmentNum >= 1000
    ? `R$ ${(investmentNum / 1000).toFixed(0)}K`
    : `R$ ${investmentNum.toFixed(0)}`;
  const beneficiariesNum = typeof c.beneficiaries === 'number'
    ? c.beneficiaries
    : parseInt(String(c.beneficiaries || '0').replace(/\D/g, ''));
  const beneficiariesFormatted = beneficiariesNum.toLocaleString('pt-BR');

  return {
    id: c.id as number,
    title: c.title as string,
    organization: c.organization as string,
    location: c.location || '',
    region: c.region as string,
    sector: c.sector as string,
    investment: investmentFormatted,
    investmentValue: investmentNum,
    beneficiaries: beneficiariesFormatted,
    beneficiariesValue: beneficiariesNum,
    duration: c.duration || '',
    sRoi: sRoiFormatted,
    sRoiValue,
    year: c.year as number,
    sdgs,
    metrics: metricsRaw.length > 0
      ? metricsRaw.map(m => ({ label: m.label, value: m.value }))
      : [{ label: 'S-ROI', value: sRoiFormatted }],
  };
}

export default function CaseCompare() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialIds = params.get('ids')?.split(',').map(Number).filter(Boolean) || [];
  
  const [selectedIds, setSelectedIds] = useState<number[]>(initialIds.slice(0, 3));
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch real cases from database
  const { data: rawCases, isLoading } = trpc.cases.list.useQuery({ limit: 50 });

  // Normalize all cases from DB
  const allCases = useMemo(() => {
    if (!rawCases || rawCases.length === 0) return [];
    return rawCases.map(normalizeCaseForCompare);
  }, [rawCases]);

  const selectedCases = useMemo(() => 
    selectedIds.map(id => allCases.find(c => c.id === id)).filter(Boolean) as ReturnType<typeof normalizeCaseForCompare>[],
    [selectedIds, allCases]
  );

  const availableCases = useMemo(() => 
    allCases.filter(c => !selectedIds.includes(c.id)),
    [selectedIds, allCases]
  );

  const handleAddCase = (caseId: number) => {
    if (selectedIds.length >= 3) {
      toast.error(t('cases.compare.maxCases'));
      return;
    }
    setSelectedIds([...selectedIds, caseId]);
    setAddDialogOpen(false);
  };

  const handleRemoveCase = (caseId: number) => {
    setSelectedIds(selectedIds.filter(id => id !== caseId));
  };

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    if (selectedCases.length === 0) return null;
    
    const totalInvestment = selectedCases.reduce((sum, c) => sum + c.investmentValue, 0);
    const totalBeneficiaries = selectedCases.reduce((sum, c) => sum + c.beneficiariesValue, 0);
    const avgSRoi = selectedCases.reduce((sum, c) => sum + c.sRoiValue, 0) / selectedCases.length;
    const maxSRoi = Math.max(...selectedCases.map(c => c.sRoiValue));
    const minSRoi = Math.min(...selectedCases.map(c => c.sRoiValue));
    
    return {
      totalInvestment,
      totalBeneficiaries,
      avgSRoi: avgSRoi.toFixed(1),
      maxSRoi: maxSRoi.toFixed(1),
      minSRoi: minSRoi.toFixed(1),
      costPerBeneficiary: totalBeneficiaries > 0 ? (totalInvestment / totalBeneficiaries).toFixed(0) : '0',
    };
  }, [selectedCases]);

  // Find best in each category
  const getBestInCategory = (category: 'sRoi' | 'beneficiaries' | 'investment') => {
    if (selectedCases.length === 0) return null;
    
    switch (category) {
      case 'sRoi':
        return selectedCases.reduce((best, c) => c.sRoiValue > best.sRoiValue ? c : best);
      case 'beneficiaries':
        return selectedCases.reduce((best, c) => c.beneficiariesValue > best.beneficiariesValue ? c : best);
      case 'investment':
        return selectedCases.reduce((best, c) => c.investmentValue < best.investmentValue ? c : best);
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando cases...</p>
          </div>
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
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/cases">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Scale className="w-6 h-6 text-primary" />
                  {t('cases.compare.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('cases.compare.subtitle')}
                </p>
              </div>
            </div>
            
            {selectedCases.length < 3 && (
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('cases.compare.addCase')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('cases.compare.selectCase')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {availableCases.map(caseStudy => (
                      <Card 
                        key={caseStudy.id} 
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleAddCase(caseStudy.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{caseStudy.title}</h4>
                              <p className="text-sm text-muted-foreground">{caseStudy.organization}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">{caseStudy.sector}</Badge>
                                <Badge variant="outline">S-ROI: {caseStudy.sRoi}</Badge>
                              </div>
                            </div>
                            <Plus className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {availableCases.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Todos os cases já foram selecionados.
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Empty State */}
          {selectedCases.length === 0 && (
            <Card className="p-12 text-center">
              <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('cases.compare.emptyState.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('cases.compare.emptyState.description')}
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('cases.compare.emptyState.addFirst')}
              </Button>
            </Card>
          )}

          {/* Comparison View */}
          {selectedCases.length > 0 && (
            <>
              {/* Aggregate Metrics */}
              {aggregateMetrics && selectedCases.length > 1 && (
                <Card className="mb-8 bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      {t('cases.compare.summary.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          R$ {(aggregateMetrics.totalInvestment / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs text-muted-foreground">{t('cases.compare.summary.totalInvestment')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {aggregateMetrics.totalBeneficiaries.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('cases.compare.summary.totalBeneficiaries')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {aggregateMetrics.avgSRoi}x
                        </div>
                        <div className="text-xs text-muted-foreground">{t('cases.compare.summary.avgSRoi')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {aggregateMetrics.maxSRoi}x
                        </div>
                        <div className="text-xs text-muted-foreground">{t('cases.compare.summary.maxSRoi')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {aggregateMetrics.minSRoi}x
                        </div>
                        <div className="text-xs text-muted-foreground">{t('cases.compare.summary.minSRoi')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          R$ {parseInt(aggregateMetrics.costPerBeneficiary).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('cases.compare.summary.costPerBeneficiary')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cases Grid */}
              <div className={`grid gap-6 ${
                selectedCases.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' :
                selectedCases.length === 2 ? 'md:grid-cols-2' :
                'md:grid-cols-3'
              }`}>
                {selectedCases.map(caseStudy => {
                  const isBestSRoi = getBestInCategory('sRoi')?.id === caseStudy.id;
                  const isBestBeneficiaries = getBestInCategory('beneficiaries')?.id === caseStudy.id;
                  
                  return (
                    <Card key={caseStudy.id} className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => handleRemoveCase(caseStudy.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      
                      <CardHeader className="pb-3">
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary">{caseStudy.sector}</Badge>
                          {isBestSRoi && selectedCases.length > 1 && (
                            <Badge className="bg-green-500/10 text-green-600 border-0">
                              <Award className="w-3 h-3 mr-1" />
                              {t('cases.compare.badges.bestSRoi')}
                            </Badge>
                          )}
                          {isBestBeneficiaries && selectedCases.length > 1 && (
                            <Badge className="bg-blue-500/10 text-blue-600 border-0">
                              <Users className="w-3 h-3 mr-1" />
                              {t('cases.compare.badges.mostBeneficiaries')}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{caseStudy.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{caseStudy.organization}</p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-muted/50 rounded-lg text-center">
                            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
                            <div className="text-xl font-bold">{caseStudy.sRoi}</div>
                            <div className="text-xs text-muted-foreground">{t('cases.compare.metrics.sRoi')}</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg text-center">
                            <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                            <div className="text-xl font-bold">{caseStudy.beneficiaries}</div>
                            <div className="text-xs text-muted-foreground">{t('cases.compare.metrics.beneficiaries')}</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg text-center">
                            <DollarSign className="w-4 h-4 mx-auto mb-1 text-primary" />
                            <div className="text-xl font-bold">{caseStudy.investment}</div>
                            <div className="text-xs text-muted-foreground">{t('cases.compare.metrics.investment')}</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg text-center">
                            <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
                            <div className="text-xl font-bold">{caseStudy.duration || caseStudy.year}</div>
                            <div className="text-xs text-muted-foreground">{t('cases.compare.metrics.duration')}</div>
                          </div>
                        </div>

                        {/* Location */}
                        {caseStudy.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {caseStudy.location}
                          </div>
                        )}

                        {/* Specific Metrics */}
                        {caseStudy.metrics.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">{t('cases.compare.metrics.impactMetrics')}</h4>
                            {caseStudy.metrics.map((metric, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{metric.label}</span>
                                <span className="font-medium">{metric.value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ODS */}
                        {caseStudy.sdgs.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">{t('cases.compare.metrics.relatedSdgs')}</h4>
                            <div className="flex flex-wrap gap-1">
                              {caseStudy.sdgs.map(ods => (
                                <Badge key={ods} variant="outline" className="text-xs">
                                  ODS {ods}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Add More Card */}
                {selectedCases.length < 3 && (
                  <Card 
                    className="border-dashed cursor-pointer hover:border-primary transition-colors flex items-center justify-center min-h-[400px]"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    <div className="text-center p-6">
                      <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('cases.compare.addMore')}
                      </p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Comparison Table */}
              {selectedCases.length > 1 && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('cases.compare.table.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">{t('cases.compare.table.metric')}</th>
                            {selectedCases.map(c => (
                              <th key={c.id} className="text-center py-3 px-4 font-medium">
                                {c.title.length > 25 ? c.title.slice(0, 25) + '...' : c.title}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-4 text-muted-foreground">{t('cases.compare.metrics.sRoi')}</td>
                            {selectedCases.map(c => (
                              <td key={c.id} className={`text-center py-3 px-4 font-medium ${
                                getBestInCategory('sRoi')?.id === c.id ? 'text-green-600' : ''
                              }`}>
                                {c.sRoi}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 text-muted-foreground">{t('cases.compare.metrics.investment')}</td>
                            {selectedCases.map(c => (
                              <td key={c.id} className="text-center py-3 px-4">
                                {c.investment}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 text-muted-foreground">{t('cases.compare.metrics.beneficiaries')}</td>
                            {selectedCases.map(c => (
                              <td key={c.id} className={`text-center py-3 px-4 font-medium ${
                                getBestInCategory('beneficiaries')?.id === c.id ? 'text-blue-600' : ''
                              }`}>
                                {c.beneficiaries}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 text-muted-foreground">{t('cases.compare.metrics.duration')}</td>
                            {selectedCases.map(c => (
                              <td key={c.id} className="text-center py-3 px-4">
                                {c.duration || String(c.year)}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 text-muted-foreground">{t('cases.compare.table.sector')}</td>
                            {selectedCases.map(c => (
                              <td key={c.id} className="text-center py-3 px-4">
                                {c.sector}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 text-muted-foreground">{t('cases.compare.table.region')}</td>
                            {selectedCases.map(c => (
                              <td key={c.id} className="text-center py-3 px-4">
                                {c.region}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 text-muted-foreground">{t('cases.compare.table.costPerBeneficiary')}</td>
                            {selectedCases.map(c => (
                              <td key={c.id} className="text-center py-3 px-4">
                                {c.beneficiariesValue > 0
                                  ? `R$ ${Math.round(c.investmentValue / c.beneficiariesValue).toLocaleString('pt-BR')}`
                                  : '-'}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-muted-foreground">{t('cases.compare.table.sdgs')}</td>
                            {selectedCases.map(c => (
                              <td key={c.id} className="text-center py-3 px-4">
                                {c.sdgs.join(', ') || '-'}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
