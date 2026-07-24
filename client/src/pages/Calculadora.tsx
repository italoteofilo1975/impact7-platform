import { useState } from "react";
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

  // Entradas da fórmula honesta de S-ROI do Método IMPACT7 (ver server/shared/sroi-calculator.ts):
  // S-ROI = [(gatilhos*valorGatilho + transformacoes*valorTransformacao) * atribuicao * (1-deadweight) * (1-dropOff)] / custoImts
  const [gatilhos, setGatilhos] = useState(500);
  const [transformacoes, setTransformacoes] = useState(150);
  const [valorGatilhoReais, setValorGatilhoReais] = useState(300);
  const [valorTransformacaoReais, setValorTransformacaoReais] = useState(2000);
  const [atribuicaoPercent, setAtribuicaoPercent] = useState(50);
  const [deadweightPercent, setDeadweightPercent] = useState(20);
  const [dropOffPercent, setDropOffPercent] = useState(10);
  const [custoImtsReais, setCustoImtsReais] = useState(100000);

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
      toast.success(t("calculator.toast.success", { sroi: data.sroi }));
    },
    onError: (error) => {
      toast.error(error.message || t("calculator.toast.error"));
    },
  });

  const result = calculateMutation.data;
  const showResult = !!result;

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
    if (!result) return;
    try {
      await exportPdfMutation.mutateAsync({
        gatilhos: result.gatilhos,
        transformacoes: result.transformacoes,
        valorSocialBruto: result.valorSocialBruto,
        fatorDesconto: result.fatorDesconto,
        valorSocial: result.valorSocial,
        custo: result.custo,
        sroi: result.sroi,
        alavancagem: result.alavancagem,
        alavancagemLow: result.alavancagemLow,
        alavancagemHigh: result.alavancagemHigh,
        sensibilidade: result.sensibilidade,
        language: i18n.language,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleCalculate = async () => {
    try {
      await calculateMutation.mutateAsync({
        gatilhos,
        transformacoes,
        valorGatilhoReais,
        valorTransformacaoReais,
        atribuicaoPercent,
        deadweightPercent,
        dropOffPercent,
        custoImtsReais,
        sessionId: `session_${Date.now()}`,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const getRating = (sroi: number) => {
    if (sroi >= 10) return { label: "Excelente", color: "text-green-500" };
    if (sroi >= 7) return { label: "Muito bom", color: "text-emerald-500" };
    if (sroi >= 4) return { label: "Bom", color: "text-yellow-500" };
    if (sroi >= 2) return { label: "Moderado", color: "text-orange-500" };
    return { label: "Baixo", color: "text-red-500" };
  };

  const getRecommendation = (sroi: number) => {
    if (sroi >= 10) {
      return "S-ROI acima de 10x costuma indicar premissas de valor otimistas demais. Vale revisar os números (valor por gatilho/transformação, atribuição) antes de comemorar.";
    }
    if (sroi >= 7) {
      return "Resultado bastante positivo. Confira se a atribuição e os descontos de deadweight/drop-off refletem a realidade do projeto.";
    }
    if (sroi >= 3) {
      return "Faixa realista para um S-ROI honesto após os descontos de atribuição, deadweight e drop-off (geralmente entre 3x e 10x).";
    }
    return "Potencial moderado. Avalie se é possível aumentar a atribuição do projeto ao resultado ou reduzir custos fixos da IMTS.";
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
                    Preencha os números do seu projeto para simular o S-ROI honesto do Método IMPACT7.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Gatilhos */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        Número de gatilhos (pessoas que cruzaram o limiar de impacto)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Quantidade de pessoas que cruzaram o limiar mínimo de impacto do projeto.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{gatilhos.toLocaleString()}</span>
                    </div>
                    <Slider
                      aria-label="Número de gatilhos"
                      value={[gatilhos]}
                      onValueChange={(v) => setGatilhos(v[0])}
                      min={0}
                      max={5000}
                      step={10}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>5.000</span>
                    </div>
                  </div>

                  {/* Transformações */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        Número de transformações
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Subconjunto dos gatilhos que teve transformação sustentada (mais profunda e duradoura).</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{transformacoes.toLocaleString()}</span>
                    </div>
                    <Slider
                      aria-label="Número de transformações"
                      value={[transformacoes]}
                      onValueChange={(v) => setTransformacoes(v[0])}
                      min={0}
                      max={5000}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>5.000</span>
                    </div>
                  </div>

                  {/* Valor por gatilho */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Valor por gatilho (R$)</Label>
                      <span className="font-semibold text-primary">{formatCurrency(valorGatilhoReais)}</span>
                    </div>
                    <Slider
                      aria-label="Valor por gatilho em reais"
                      value={[valorGatilhoReais]}
                      onValueChange={(v) => setValorGatilhoReais(v[0])}
                      min={0}
                      max={5000}
                      step={10}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 0</span>
                      <span>R$ 5.000</span>
                    </div>
                  </div>

                  {/* Valor por transformação */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Valor por transformação (R$)</Label>
                      <span className="font-semibold text-primary">{formatCurrency(valorTransformacaoReais)}</span>
                    </div>
                    <Slider
                      aria-label="Valor por transformação em reais"
                      value={[valorTransformacaoReais]}
                      onValueChange={(v) => setValorTransformacaoReais(v[0])}
                      min={0}
                      max={20000}
                      step={50}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 0</span>
                      <span>R$ 20.000</span>
                    </div>
                  </div>

                  {/* Atribuição */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        % de atribuição
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Percentual do resultado que pode ser atribuído a este projeto (o restante se deve a outros fatores/atores).</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{atribuicaoPercent}%</span>
                    </div>
                    <Slider
                      aria-label="Percentual de atribuição"
                      value={[atribuicaoPercent]}
                      onValueChange={(v) => setAtribuicaoPercent(v[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* Deadweight */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        % deadweight (opcional)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Percentual do resultado que teria acontecido de qualquer forma, mesmo sem o projeto.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{deadweightPercent}%</span>
                    </div>
                    <Slider
                      aria-label="Percentual de deadweight"
                      value={[deadweightPercent]}
                      onValueChange={(v) => setDeadweightPercent(v[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* Drop-off */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        % drop-off (opcional)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Percentual de queda do impacto ao longo do tempo (o efeito não se mantém integralmente).</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{dropOffPercent}%</span>
                    </div>
                    <Slider
                      aria-label="Percentual de drop-off"
                      value={[dropOffPercent]}
                      onValueChange={(v) => setDropOffPercent(v[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* Custo fixo da IMTS */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        Custo fixo da IMTS (R$)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Custo fixo total do investimento social a ser dividido pelo valor social gerado.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <span className="font-semibold text-primary">{formatCurrency(custoImtsReais)}</span>
                    </div>
                    <Slider
                      aria-label="Custo fixo da IMTS em reais"
                      value={[custoImtsReais]}
                      onValueChange={(v) => setCustoImtsReais(v[0])}
                      min={1000}
                      max={1000000}
                      step={1000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 1 mil</span>
                      <span>R$ 1 milhão</span>
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
                        Calculando...
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
                    <CardTitle>A Fórmula Honesta do S-ROI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="equation text-center py-4 text-sm md:text-base">
                      <span className="text-primary">S-ROI</span> = [(gatilhos × valorGatilho + transformações × valorTransformação) × atribuição × (1-deadweight) × (1-dropOff)] / custoIMTS
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <div className="font-bold text-primary">Gatilhos</div>
                        <div className="text-muted-foreground">Pessoas que cruzaram o limiar</div>
                      </div>
                      <div>
                        <div className="font-bold text-primary">Transformações</div>
                        <div className="text-muted-foreground">Transformação sustentada</div>
                      </div>
                      <div>
                        <div className="font-bold text-primary">Custo</div>
                        <div className="text-muted-foreground">Custo fixo da IMTS</div>
                      </div>
                      <div>
                        <div className="font-bold text-primary">S-ROI</div>
                        <div className="text-muted-foreground">Retorno social</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      A esteira (nível Amplificar do Funil IMPACTA) é projeção e nunca entra nesta soma.
                    </p>
                  </CardContent>
                </Card>

                {/* Results */}
                {showResult && result && (
                  <Card className="border-primary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {t("calculator.results.title")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center p-6 bg-primary/5 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-2">S-ROI Simulado</div>
                        <div className="text-5xl font-bold text-primary mb-2">{result.sroi.toFixed(1)}x</div>
                        <div className={`text-lg font-semibold ${getRating(result.sroi).color}`}>{getRating(result.sroi).label}</div>
                        {result.sensibilidade && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Faixa de sensibilidade: {result.sensibilidade.sroiLow.toFixed(1)}x — {result.sensibilidade.sroiHigh.toFixed(1)}x
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-card border rounded-lg">
                          <div className="text-sm text-muted-foreground">Valor Social Bruto</div>
                          <div className="text-xl font-bold">{formatCurrency(result.valorSocialBruto)}</div>
                        </div>
                        <div className="p-4 bg-card border rounded-lg">
                          <div className="text-sm text-muted-foreground">Valor Social (após descontos)</div>
                          <div className="text-xl font-bold">{formatCurrency(result.valorSocial)}</div>
                        </div>
                        <div className="p-4 bg-card border rounded-lg">
                          <div className="text-sm text-muted-foreground">Custo Fixo da IMTS</div>
                          <div className="text-xl font-bold">{formatCurrency(result.custo)}</div>
                        </div>
                        <div className="p-4 bg-card border rounded-lg">
                          <div className="text-sm text-muted-foreground">Alavancagem</div>
                          <div className="text-xl font-bold">
                            {result.alavancagemLow.toFixed(2)}x – {result.alavancagemHigh.toFixed(2)}x
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm mb-1">{t("calculator.results.recommendation")}</div>
                            <p className="text-sm text-muted-foreground">
                              {getRecommendation(result.sroi)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground text-center">
                        Simulação ilustrativa com os números que você informou. Não é um S-ROI auditado de nenhuma iniciativa real.
                      </p>

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
                        <span className="text-sm text-muted-foreground">Faixa realista de S-ROI honesto</span>
                        <span className="font-semibold text-primary">3x - 10x</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Abaixo da faixa</span>
                        <span className="font-semibold text-orange-500">&lt; 3x</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Acima da faixa (revisar premissas)</span>
                        <span className="font-semibold text-green-500">&gt; 10x</span>
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
