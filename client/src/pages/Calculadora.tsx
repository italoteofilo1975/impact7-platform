import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { Calculator, ArrowRight, Download, Calendar, Info, TrendingUp, Target, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function Calculadora() {
  const { t, i18n } = useTranslation();
  const [investment, setInvestment] = useState(100000);
  const [contextScore, setContextScore] = useState(5);
  const [resistanceScore, setResistanceScore] = useState(3);
  const [beneficiaries, setBeneficiaries] = useState(1000);
  const [duration, setDuration] = useState(12);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    // I = (E × C^7) / R
    const E = investment;
    const C = contextScore / 10; // Normalize to 0-1
    const R = Math.max(resistanceScore / 10, 0.1); // Normalize and prevent division by zero
    
    const contextPower = Math.pow(C, 7);
    const impactScore = (E * contextPower) / R;
    
    // Calculate S-ROI (Social Return on Investment)
    const socialValue = impactScore * beneficiaries * (duration / 12);
    const sRoi = socialValue / investment;
    
    // Determine rating
    let rating = t("calculator.ratings.low");
    let ratingColor = "text-red-500";
    if (sRoi >= 12) {
      rating = t("calculator.ratings.excellent");
      ratingColor = "text-green-500";
    } else if (sRoi >= 7) {
      rating = t("calculator.ratings.veryGood");
      ratingColor = "text-emerald-500";
    } else if (sRoi >= 4) {
      rating = t("calculator.ratings.good");
      ratingColor = "text-yellow-500";
    } else if (sRoi >= 2) {
      rating = t("calculator.ratings.moderate");
      ratingColor = "text-orange-500";
    }

    return {
      impactScore: Math.round(impactScore),
      sRoi: sRoi.toFixed(1),
      socialValue: Math.round(socialValue),
      rating,
      ratingColor,
    };
  }, [investment, contextScore, resistanceScore, beneficiaries, duration, t]);

  const formatCurrency = (value: number) => {
    const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es-ES' : 'pt-BR';
    const currency = i18n.language === 'en' ? 'USD' : i18n.language === 'es' ? 'USD' : 'BRL';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateMutation = trpc.calculator.calculate.useMutation({
    onSuccess: (data) => {
      setShowResult(true);
      toast.success(t("calculator.toast.success", { sroi: data.sRoi }));
    },
    onError: (error) => {
      toast.error(error.message || t("calculator.toast.error"));
    },
  });

  const exportPdfMutation = trpc.calculator.exportPdf.useMutation({
    onSuccess: (data) => {
      // Create download link from data URI
      const link = document.createElement('a');
      link.href = data.pdfDataUri;
      link.download = `impact7-sroi-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t("calculator.toast.pdfExported"));
    },
    onError: (error) => {
      toast.error(error.message || t("calculator.toast.pdfError"));
    },
  });

  const handleExportPdf = async () => {
    try {
      await exportPdfMutation.mutateAsync({
        investment,
        contextScore,
        resistanceScore,
        beneficiaries,
        duration,
        sRoi: result.sRoi,
        socialValue: result.socialValue,
        impactScore: result.impactScore,
        rating: result.rating,
        language: i18n.language,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleCalculate = async () => {
    try {
      await calculateMutation.mutateAsync({
        investment,
        contextScore,
        resistanceScore,
        beneficiaries,
        duration,
        sessionId: `session_${Date.now()}`,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const getRecommendation = () => {
    const sRoiValue = parseFloat(result.sRoi);
    if (sRoiValue >= 7) {
      return t("calculator.results.excellent");
    } else if (sRoiValue >= 4) {
      return t("calculator.results.good");
    }
    return t("calculator.results.moderate");
  };

  return (
    <>
      <SEO
        title={t("calculator.title")}
        description={t("calculator.subtitle")}
        keywords="calculadora impacto social, SROI, retorno social investimento, mensuração impacto"
        url="https://impact7.com.br/calculadora"
      />
      <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-16">
        {/* Hero */}
        <section className="gradient-hero text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-white/60 hover:text-white text-sm">Home</Link>
              <span className="text-white/40">/</span>
              <span className="text-sm">{t("calculator.breadcrumb")}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
              <Calculator className="w-4 h-4" />
              {t("calculator.badge")}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("calculator.title")}</h1>
            <p className="text-white/80 max-w-2xl">
              {t("calculator.subtitle")}
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    {t("calculator.projectData")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("calculator.projectDataDesc")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Investment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        {t("calculator.investment")}
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{t("calculator.investmentTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{formatCurrency(investment)}</span>
                    </div>
                    <Slider
                      value={[investment]}
                      onValueChange={(v) => setInvestment(v[0])}
                      min={10000}
                      max={10000000}
                      step={10000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("calculator.investmentMin")}</span>
                      <span>{t("calculator.investmentMax")}</span>
                    </div>
                  </div>

                  {/* Context Score */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        {t("calculator.contextAlignment")}
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{t("calculator.contextTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{contextScore}/10</span>
                    </div>
                    <Slider
                      value={[contextScore]}
                      onValueChange={(v) => setContextScore(v[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("calculator.low")}</span>
                      <span>{t("calculator.high")}</span>
                    </div>
                  </div>

                  {/* Resistance Score */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        {t("calculator.barriers")}
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{t("calculator.barriersTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{resistanceScore}/10</span>
                    </div>
                    <Slider
                      value={[resistanceScore]}
                      onValueChange={(v) => setResistanceScore(v[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("calculator.few")}</span>
                      <span>{t("calculator.many")}</span>
                    </div>
                  </div>

                  {/* Beneficiaries */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t("calculator.beneficiaries")}</Label>
                      <span className="font-semibold text-primary">{beneficiaries.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[beneficiaries]}
                      onValueChange={(v) => setBeneficiaries(v[0])}
                      min={100}
                      max={100000}
                      step={100}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100</span>
                      <span>100.000</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t("calculator.duration")}</Label>
                      <span className="font-semibold text-primary">{duration} {t("calculator.months")}</span>
                    </div>
                    <Slider
                      value={[duration]}
                      onValueChange={(v) => setDuration(v[0])}
                      min={3}
                      max={60}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("calculator.durationMin")}</span>
                      <span>{t("calculator.durationMax")}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full gradient-orange text-white border-0" 
                    size="lg"
                    onClick={handleCalculate}
                    disabled={calculateMutation.isPending}
                  >
                    {calculateMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("calculator.calculating")}
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5 mr-2" />
                        {t("calculator.calculate")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <div className="space-y-6">
                {/* Equation Display */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("calculator.equation.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="equation text-center py-4">
                      <span className="text-primary">I</span> = (<span className="text-primary">E</span> × <span className="text-primary">C</span><sup>7</sup>) / <span className="text-primary">R</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <div className="font-bold text-primary">E</div>
                        <div className="text-muted-foreground">{t("calculator.equation.energy")}</div>
                      </div>
                      <div>
                        <div className="font-bold text-primary">C</div>
                        <div className="text-muted-foreground">{t("calculator.equation.context")}</div>
                      </div>
                      <div>
                        <div className="font-bold text-primary">R</div>
                        <div className="text-muted-foreground">{t("calculator.equation.resistance")}</div>
                      </div>
                      <div>
                        <div className="font-bold text-primary">I</div>
                        <div className="text-muted-foreground">{t("calculator.equation.impact")}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results */}
                {showResult && (
                  <Card className="border-primary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {t("calculator.results.title")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center p-6 bg-primary/5 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-2">{t("calculator.results.sroiEstimated")}</div>
                        <div className="text-5xl font-bold text-primary mb-2">{result.sRoi}x</div>
                        <div className={`text-lg font-semibold ${result.ratingColor}`}>{result.rating}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-card border rounded-lg">
                          <div className="text-sm text-muted-foreground">{t("calculator.results.socialValue")}</div>
                          <div className="text-xl font-bold">{formatCurrency(result.socialValue)}</div>
                        </div>
                        <div className="p-4 bg-card border rounded-lg">
                          <div className="text-sm text-muted-foreground">{t("calculator.results.impactScore")}</div>
                          <div className="text-xl font-bold">{result.impactScore.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm mb-1">{t("calculator.results.recommendation")}</div>
                            <p className="text-sm text-muted-foreground">
                              {getRecommendation()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={handleExportPdf}
                          disabled={exportPdfMutation.isPending}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {exportPdfMutation.isPending ? t("calculator.results.exporting") : t("calculator.results.exportPdf")}
                        </Button>
                        <Link href="/contato" className="flex-1">
                          <Button className="w-full gradient-orange text-white border-0">
                            <Calendar className="w-4 h-4 mr-2" />
                            {t("calculator.results.scheduleConsulting")}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Benchmarks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("calculator.benchmarks.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t("calculator.benchmarks.minRecommended")}</span>
                        <span className="font-semibold text-primary">7x</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t("calculator.benchmarks.avgSocial")}</span>
                        <span className="font-semibold">3-4x</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t("calculator.benchmarks.top10")}</span>
                        <span className="font-semibold text-green-500">12x+</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("calculator.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("calculator.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contato">
                <Button size="lg" className="gradient-orange text-white border-0">
                  <Calendar className="w-5 h-5 mr-2" />
                  {t("calculator.cta.scheduleConsulting")}
                </Button>
              </Link>
              <Link href="/whitepaper">
                <Button size="lg" variant="outline">
                  <Download className="w-5 h-5 mr-2" />
                  {t("calculator.cta.downloadWhitepaper")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppWidget />
    </div>
    </>
  );
}
