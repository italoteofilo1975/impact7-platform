import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, TrendingUp, Target, ChevronRight, Calendar, MapPin, Building, Award, Filter, Search, ArrowUpRight, Quote, Download, Heart, HeartOff, FileText, Scale, Check, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

// Case data type from database
type CaseFromDB = {
  id: number;
  title: string;
  organization: string;
  location: string;
  region: string;
  sector: string;
  investment: string;
  beneficiaries: string | number;
  duration: string;
  sroi: string;
  year: number;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  testimonialQuote?: string | null;
  testimonialAuthor?: string | null;
  testimonialRole?: string | null;
  sdgs: string | string[];
  metrics: string | null;
  isFeatured: number | boolean;
  isActive?: number | boolean;
};

// Helper to normalize DB case to UI format
function normalizeCaseFromDB(c: CaseFromDB) {
  const sdgs: string[] = typeof c.sdgs === 'string' ? (() => { try { return JSON.parse(c.sdgs); } catch { return []; } })() : (c.sdgs || []);
  const metricsRaw: Array<{label: string; value: string; change: 'up' | 'down'}> = typeof c.metrics === 'string' ? (() => { try { return JSON.parse(c.metrics); } catch { return []; } })() : (c.metrics || []);
  const sroiNum = parseFloat(String(c.sroi || '0'));
  const sRoiFormatted = sroiNum > 100 ? `${(sroiNum / 100).toFixed(1)}x` : `${sroiNum.toFixed(1)}x`;
  const investmentNum = parseFloat(String(c.investment || '0'));
  const investmentFormatted = investmentNum >= 1000000 ? `R$ ${(investmentNum / 1000000).toFixed(1)}M` : investmentNum >= 1000 ? `R$ ${(investmentNum / 1000).toFixed(0)}K` : `R$ ${investmentNum.toFixed(0)}`;
  const beneficiariesNum = typeof c.beneficiaries === 'number' ? c.beneficiaries : parseInt(String(c.beneficiaries || '0').replace(/\D/g, ''));
  const beneficiariesFormatted = beneficiariesNum >= 1000 ? `${(beneficiariesNum / 1000).toFixed(0)}.000` : String(beneficiariesNum);
  return {
    id: c.id,
    title: c.title,
    organization: c.organization,
    location: c.location || '',
    region: c.region,
    sector: c.sector,
    investment: investmentFormatted,
    investmentRaw: investmentNum,
    beneficiaries: beneficiariesFormatted,
    beneficiariesRaw: beneficiariesNum,
    duration: c.duration || '',
    sRoi: sRoiFormatted,
    sRoiRaw: sroiNum,
    year: c.year,
    description: c.description || '',
    challenge: c.challenge || '',
    solution: c.solution || '',
    results: c.results || '',
    testimonial: {
      quote: c.testimonialQuote || '',
      author: c.testimonialAuthor || '',
      role: c.testimonialRole || '',
    },
    sdgs,
    metrics: metricsRaw.length > 0 ? metricsRaw : [
      { label: 'S-ROI', value: sRoiFormatted, change: 'up' as const },
    ],
    featured: Boolean(c.isFeatured),
  };
}

// Fallback static cases (used when DB is unavailable)
const STATIC_CASES = [
  {
    id: 1,
    titleKey: "case1.title",
    organizationKey: "case1.organization",
    locationKey: "case1.location",
    region: "Sudeste",
    sector: "Educação",
    investment: "R$ 2.5M",
    beneficiaries: "15.000",
    durationKey: "case1.duration",
    sRoi: "12.4x",
    year: 2024,
    metrics: [
      { labelKey: "case1.metrics.employability", value: "+340%", change: "up" as const },
      { labelKey: "case1.metrics.income", value: "+180%", change: "up" as const },
      { labelKey: "case1.metrics.completion", value: "87%", change: "up" as const },
    ],
    descriptionKey: "case1.description",
    challengeKey: "case1.challenge",
    solutionKey: "case1.solution",
    resultsKey: "case1.results",
    testimonial: {
      quoteKey: "case1.testimonial.quote",
      authorKey: "case1.testimonial.author",
      roleKey: "case1.testimonial.role",
    },
    sdgs: ["4", "8", "10"],
    featured: true,
  },
  {
    id: 2,
    titleKey: "case2.title",
    organizationKey: "case2.organization",
    locationKey: "case2.location",
    region: "Nordeste",
    sector: "Microfinanças",
    investment: "R$ 5M",
    beneficiaries: "8.500",
    durationKey: "case2.duration",
    sRoi: "9.7x",
    year: 2023,
    metrics: [
      { labelKey: "case2.metrics.businesses", value: "2.400", change: "up" as const },
      { labelKey: "case2.metrics.default", value: "3.2%", change: "down" as const },
      { labelKey: "case2.metrics.income", value: "+220%", change: "up" as const },
    ],
    descriptionKey: "case2.description",
    challengeKey: "case2.challenge",
    solutionKey: "case2.solution",
    resultsKey: "case2.results",
    testimonial: {
      quoteKey: "case2.testimonial.quote",
      authorKey: "case2.testimonial.author",
      roleKey: "case2.testimonial.role",
    },
    sdgs: ["1", "8", "10"],
    featured: true,
  },
  {
    id: 3,
    titleKey: "case3.title",
    organizationKey: "case3.organization",
    locationKey: "case3.location",
    region: "Sudeste",
    sector: "Saúde",
    investment: "R$ 3.8M",
    beneficiaries: "45.000",
    durationKey: "case3.duration",
    sRoi: "15.2x",
    year: 2024,
    metrics: [
      { labelKey: "case3.metrics.hospitalizations", value: "4.200", change: "down" as const },
      { labelKey: "case3.metrics.susCost", value: "R$ 12M", change: "down" as const },
      { labelKey: "case3.metrics.vaccination", value: "94%", change: "up" as const },
    ],
    descriptionKey: "case3.description",
    challengeKey: "case3.challenge",
    solutionKey: "case3.solution",
    resultsKey: "case3.results",
    testimonial: {
      quoteKey: "case3.testimonial.quote",
      authorKey: "case3.testimonial.author",
      roleKey: "case3.testimonial.role",
    },
    sdgs: ["3", "10", "11"],
    featured: true,
  },
  {
    id: 4,
    titleKey: "case4.title",
    organizationKey: "case4.organization",
    locationKey: "case4.location",
    region: "Sul",
    sector: "Agricultura",
    investment: "R$ 1.8M",
    beneficiaries: "1.200",
    durationKey: "case4.duration",
    sRoi: "8.3x",
    year: 2023,
    metrics: [
      { labelKey: "case4.metrics.productivity", value: "+156%", change: "up" as const },
      { labelKey: "case4.metrics.income", value: "+210%", change: "up" as const },
      { labelKey: "case4.metrics.organic", value: "340", change: "up" as const },
    ],
    descriptionKey: "case4.description",
    challengeKey: "case4.challenge",
    solutionKey: "case4.solution",
    resultsKey: "case4.results",
    testimonial: {
      quoteKey: "case4.testimonial.quote",
      authorKey: "case4.testimonial.author",
      roleKey: "case4.testimonial.role",
    },
    sdgs: ["2", "12", "15"],
    featured: false,
  },
  {
    id: 5,
    titleKey: "case5.title",
    organizationKey: "case5.organization",
    locationKey: "case5.location",
    region: "Nordeste",
    sector: "Habitação",
    investment: "R$ 8.5M",
    beneficiaries: "2.800",
    durationKey: "case5.duration",
    sRoi: "11.6x",
    year: 2024,
    metrics: [
      { labelKey: "case5.metrics.families", value: "700", change: "up" as const },
      { labelKey: "case5.metrics.regularization", value: "100%", change: "up" as const },
      { labelKey: "case5.metrics.appreciation", value: "+280%", change: "up" as const },
    ],
    descriptionKey: "case5.description",
    challengeKey: "case5.challenge",
    solutionKey: "case5.solution",
    resultsKey: "case5.results",
    testimonial: {
      quoteKey: "case5.testimonial.quote",
      authorKey: "case5.testimonial.author",
      roleKey: "case5.testimonial.role",
    },
    sdgs: ["1", "6", "11"],
    featured: false,
  },
  {
    id: 6,
    titleKey: "case6.title",
    organizationKey: "case6.organization",
    locationKey: "case6.location",
    region: "Sul",
    sector: "Educação",
    investment: "R$ 800K",
    beneficiaries: "5.200",
    durationKey: "case6.duration",
    sRoi: "7.8x",
    year: 2024,
    metrics: [
      { labelKey: "case6.metrics.digitally", value: "4.800", change: "up" as const },
      { labelKey: "case6.metrics.isolation", value: "-62%", change: "down" as const },
      { labelKey: "case6.metrics.services", value: "+340%", change: "up" as const },
    ],
    descriptionKey: "case6.description",
    challengeKey: "case6.challenge",
    solutionKey: "case6.solution",
    resultsKey: "case6.results",
    testimonial: {
      quoteKey: "case6.testimonial.quote",
      authorKey: "case6.testimonial.author",
      roleKey: "case6.testimonial.role",
    },
    sdgs: ["4", "10", "3"],
    featured: false,
  },
];

export default function Cases() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState("sRoi");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedInvestment, setSelectedInvestment] = useState("all");
  const [selectedODS, setSelectedODS] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [, setLocation] = useLocation();

  // Translated options
  const sectors = [
    { value: "all", label: t("cases.sectors.all") },
    { value: "Educação", label: t("cases.sectors.education") },
    { value: "Saúde", label: t("cases.sectors.health") },
    { value: "Microfinanças", label: t("cases.sectors.microfinance") },
    { value: "Agricultura", label: t("cases.sectors.agriculture") },
    { value: "Habitação", label: t("cases.sectors.housing") },
  ];

  const regions = [
    { value: "all", label: t("cases.regions.all") },
    { value: "Sudeste", label: t("cases.regions.southeast") },
    { value: "Nordeste", label: t("cases.regions.northeast") },
    { value: "Sul", label: t("cases.regions.south") },
    { value: "Norte", label: t("cases.regions.north") },
    { value: "Centro-Oeste", label: t("cases.regions.midwest") },
  ];

  const years = [
    { value: "all", label: t("cases.filters.all") },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
  ];

  const investmentRanges = [
    { value: "all", label: t("cases.filters.investmentRanges.all"), min: 0, max: Infinity },
    { value: "upTo1M", label: t("cases.filters.investmentRanges.upTo1M"), min: 0, max: 1000000 },
    { value: "1Mto5M", label: t("cases.filters.investmentRanges.1Mto5M"), min: 1000000, max: 5000000 },
    { value: "5Mto10M", label: t("cases.filters.investmentRanges.5Mto10M"), min: 5000000, max: 10000000 },
    { value: "above10M", label: t("cases.filters.investmentRanges.above10M"), min: 10000000, max: Infinity },
  ];

  const odsOptions = [
    { value: "all", label: t("cases.filters.allODS") },
    { value: "1", label: "ODS 1" },
    { value: "2", label: "ODS 2" },
    { value: "3", label: "ODS 3" },
    { value: "4", label: "ODS 4" },
    { value: "8", label: "ODS 8" },
    { value: "10", label: "ODS 10" },
    { value: "11", label: "ODS 11" },
    { value: "12", label: "ODS 12" },
    { value: "15", label: "ODS 15" },
  ];

  const sortOptions = [
    { value: "sRoi", label: t("cases.filters.sortOptions.sRoi") },
    { value: "investment", label: t("cases.filters.sortOptions.investment") },
    { value: "beneficiaries", label: t("cases.filters.sortOptions.beneficiaries") },
    { value: "year", label: t("cases.filters.sortOptions.year") },
  ];

  // Fetch cases from database
  const { data: dbCases, isLoading: casesLoading } = trpc.cases.list.useQuery(
    { limit: 100 },
    { staleTime: 5 * 60 * 1000 }
  );

  // Normalize DB cases or fall back to static data
  const cases = dbCases && (dbCases as CaseFromDB[]).length > 0
    ? (dbCases as CaseFromDB[]).map(normalizeCaseFromDB)
    : STATIC_CASES.map(c => ({
        ...c,
        title: t(`cases.data.${c.titleKey}`),
        organization: t(`cases.data.${c.organizationKey}`),
        location: t(`cases.data.${c.locationKey}`),
        duration: t(`cases.data.${c.durationKey}`),
        description: t(`cases.data.${c.descriptionKey}`),
        challenge: t(`cases.data.${c.challengeKey}`),
        solution: t(`cases.data.${c.solutionKey}`),
        results: t(`cases.data.${c.resultsKey}`),
        testimonial: {
          quote: t(`cases.data.${c.testimonial.quoteKey}`),
          author: t(`cases.data.${c.testimonial.authorKey}`),
          role: t(`cases.data.${c.testimonial.roleKey}`),
        },
        metrics: c.metrics.map(m => ({ label: t(`cases.data.${m.labelKey}`), value: m.value, change: m.change })),
        investmentRaw: parseInt(c.investment.replace(/\D/g, '')) * (c.investment.includes('K') ? 1000 : 1000000),
        beneficiariesRaw: parseInt(c.beneficiaries.replace(/\D/g, '')),
        sRoiRaw: parseFloat(c.sRoi),
      }));

  // Queries
  const { data: userFavorites } = trpc.cases.getFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const generatePDFMutation = trpc.cases.generatePDF.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'case-impact7.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("cases.toast.pdfSuccess"));
    },
    onError: () => {
      toast.error(t("cases.toast.pdfError"));
    },
  });

  const addFavoriteMutation = trpc.cases.addFavorite.useMutation({
    onSuccess: () => {
      toast.success(t("cases.toast.favoriteAdded"));
    },
  });

  const removeFavoriteMutation = trpc.cases.removeFavorite.useMutation({
    onSuccess: () => {
      toast.success(t("cases.toast.favoriteRemoved"));
    },
  });

  const generateReportMutation = trpc.cases.generateConsolidatedReport.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio-cases-impact7.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("cases.toast.reportSuccess", { count: data.summary.totalCases }));
    },
    onError: () => {
      toast.error(t("cases.toast.reportError"));
    },
  });

  const handleExportReport = () => {
    const casesForReport = filteredCases.map(c => ({
      id: c.id,
      title: c.title,
      organization: c.organization,
      location: c.location,
      region: c.region,
      sector: c.sector,
      investment: c.investment,
      investmentValue: c.investmentRaw || 0,
      beneficiaries: c.beneficiaries,
      beneficiariesValue: c.beneficiariesRaw || 0,
      duration: c.duration,
      sRoi: c.sRoi,
      sRoiValue: c.sRoiRaw || 0,
      year: c.year,
      metrics: c.metrics.map(m => ({ label: m.label, value: m.value })),
      sdgs: c.sdgs,
    }));
    
    const filters: { sectors?: string[]; regions?: string[]; years?: number[] } = {};
    if (selectedSector !== 'all') filters.sectors = [selectedSector];
    if (selectedRegion !== 'all') filters.regions = [selectedRegion];
    if (selectedYear !== 'all') filters.years = [parseInt(selectedYear)];
    
    generateReportMutation.mutate({
      cases: casesForReport,
      filters,
      customTitle: `${t("cases.title")}${Object.keys(filters).length > 0 ? ' (Filtered)' : ''}`,
    });
  };

  const handleDownloadPDF = (caseStudy: typeof cases[0]) => {
    const caseData = {
      id: caseStudy.id,
      title: caseStudy.title,
      organization: caseStudy.organization,
      location: caseStudy.location,
      region: caseStudy.region,
      sector: caseStudy.sector,
      investment: caseStudy.investment,
      beneficiaries: caseStudy.beneficiaries,
      duration: caseStudy.duration,
      sRoi: caseStudy.sRoi,
      year: caseStudy.year,
      description: caseStudy.description,
      challenge: caseStudy.challenge,
      solution: caseStudy.solution,
      results: caseStudy.results,
      testimonial: {
        quote: caseStudy.testimonial.quote,
        author: caseStudy.testimonial.author,
        role: caseStudy.testimonial.role,
      },
      metrics: caseStudy.metrics.map(m => ({
        label: m.label,
        value: m.value,
        change: m.change,
      })),
      sdgs: caseStudy.sdgs,
    };
    generatePDFMutation.mutate({ caseData });
  };

  const handleToggleFavorite = (caseId: number) => {
    if (!isAuthenticated) {
      toast.error(t("cases.toast.loginRequired"));
      return;
    }
    
    const isFav = userFavorites?.some(f => f.caseId === caseId) || favorites.includes(caseId);
    
    if (isFav) {
      removeFavoriteMutation.mutate({ caseId });
      setFavorites(prev => prev.filter(id => id !== caseId));
    } else {
      addFavoriteMutation.mutate({ caseId });
      setFavorites(prev => [...prev, caseId]);
    }
  };

  const isFavorite = (caseId: number) => {
    return userFavorites?.some(f => f.caseId === caseId) || favorites.includes(caseId);
  };

  const getSectorLabel = (sector: string) => {
    const found = sectors.find(s => s.value === sector);
    return found ? found.label : sector;
  };

  const getRegionLabel = (region: string) => {
    const found = regions.find(r => r.value === region);
    return found ? found.label : region;
  };

  const filteredCases = cases
    .filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === "all" || c.sector === selectedSector;
      const matchesRegion = selectedRegion === "all" || c.region === selectedRegion;
      const matchesYear = selectedYear === "all" || c.year.toString() === selectedYear;
      const investmentValue = c.investmentRaw || 0;
      const investmentRange = investmentRanges.find(r => r.value === selectedInvestment) || investmentRanges[0];
      const matchesInvestment = selectedInvestment === "all" || 
                                (investmentValue >= investmentRange.min && investmentValue < investmentRange.max);
      const matchesODS = selectedODS === "all" || c.sdgs.includes(selectedODS);
      return matchesSearch && matchesSector && matchesRegion && matchesYear && matchesInvestment && matchesODS;
    })
    .sort((a, b) => {
      if (sortBy === "sRoi") return (b.sRoiRaw || 0) - (a.sRoiRaw || 0);
      if (sortBy === "investment") return (b.investmentRaw || 0) - (a.investmentRaw || 0);
      if (sortBy === "beneficiaries") return (b.beneficiariesRaw || 0) - (a.beneficiariesRaw || 0);
      if (sortBy === "year") return b.year - a.year;
      return 0;
    });

  const featuredCases = cases.filter(c => c.featured);

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-16">
        {/* Hero */}
        <section className="gradient-hero text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-white/60 hover:text-white text-sm">{t("common.home")}</Link>
              <span className="text-white/40">/</span>
              <span className="text-sm">{t("cases.breadcrumb")}</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
                  <Award className="w-4 h-4" />
                  {t("cases.badge")}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("cases.title")}</h1>
                <p className="text-white/80 max-w-2xl text-lg">
                  {t("cases.subtitle")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg" 
                  variant={compareMode ? "default" : "outline"}
                  className={compareMode ? "bg-primary" : "bg-white/10 border-white/30 text-white hover:bg-white/20"}
                  onClick={() => {
                    if (compareMode && selectedForCompare.length >= 2) {
                      setLocation(`/cases/compare?ids=${selectedForCompare.join(',')}`);
                    } else {
                      setCompareMode(!compareMode);
                      if (!compareMode) setSelectedForCompare([]);
                    }
                  }}
                >
                  <Scale className="w-5 h-5 mr-2" />
                  {compareMode 
                    ? selectedForCompare.length >= 2 
                      ? t("cases.actions.compareSelected", { count: selectedForCompare.length })
                      : t("cases.actions.selectMore", { count: 2 - selectedForCompare.length })
                    : t("cases.actions.compare")
                  }
                </Button>
                {compareMode && (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => {
                      setCompareMode(false);
                      setSelectedForCompare([]);
                    }}
                  >
                    {t("cases.actions.cancel")}
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={handleExportReport}
                  disabled={generateReportMutation.isPending || filteredCases.length === 0}
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  {generateReportMutation.isPending ? t("cases.actions.generating") : t("cases.actions.export", { count: filteredCases.length })}
                </Button>
                <Link href="/cases/submit">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <FileText className="w-5 h-5 mr-2" />
                    {t("cases.actions.submit")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-card border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">{t("cases.stats.projects")}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">12x</div>
                <div className="text-sm text-muted-foreground">{t("cases.stats.avgSroi")}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">2M+</div>
                <div className="text-sm text-muted-foreground">{t("cases.stats.beneficiaries")}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">R$ 500M+</div>
                <div className="text-sm text-muted-foreground">{t("cases.stats.socialValue")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Cases */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              {t("cases.featured.title")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCases.map((caseStudy) => (
                <Card key={caseStudy.id} className="card-hover overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{getSectorLabel(caseStudy.sector)}</Badge>
                        <Badge className="bg-primary/10 text-primary border-0">
                          S-ROI: {caseStudy.sRoi}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleFavorite(caseStudy.id)}
                      >
                        {isFavorite(caseStudy.id) ? (
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        ) : (
                          <Heart className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{caseStudy.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {caseStudy.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {caseStudy.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {caseStudy.location}
                      </span>
                    </div>
                    <div className="pt-4 border-t flex items-center justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <Quote className="w-4 h-4 text-primary shrink-0 mt-1" />
                        <p className="text-xs text-muted-foreground italic line-clamp-2">
                          "{caseStudy.testimonial.quote || ''}"
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-2"
                        onClick={() => handleDownloadPDF(caseStudy)}
                        disabled={generatePDFMutation.isPending}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b sticky top-16 bg-background z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("cases.filters.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t("cases.filters.sector")} />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(sector => (
                      <SelectItem key={sector.value} value={sector.value}>{sector.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t("cases.filters.region")} />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t("cases.filters.sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={showAdvancedFilters ? 'bg-primary/10' : ''}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {t("cases.filters.filters")}
                </Button>
              </div>
            </div>
            
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder={t("cases.filters.year")} />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t("cases.filters.investment")} />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedODS} onValueChange={setSelectedODS}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("cases.filters.ods")} />
                  </SelectTrigger>
                  <SelectContent>
                    {odsOptions.map(ods => (
                      <SelectItem key={ods.value} value={ods.value}>{ods.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(selectedYear !== "all" || selectedInvestment !== "all" || selectedODS !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedYear("all");
                      setSelectedInvestment("all");
                      setSelectedODS("all");
                    }}
                  >
                    {t("common.clearFilters")}
                  </Button>
                )}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-3">
              {t("cases.results.found", { count: filteredCases.length })}
              {(selectedYear !== "all" || selectedInvestment !== "all" || selectedODS !== "all" || selectedSector !== "all" || selectedRegion !== "all") && (
                <span className="text-primary"> ({t("common.filtersActive")})</span>
              )}
            </p>
          </div>
        </section>

        {/* Cases List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="space-y-8">
              {filteredCases.map((caseStudy) => (
                <Card key={caseStudy.id} className="overflow-hidden">
                  <div className="grid lg:grid-cols-3 gap-0">
                    {/* Main Info */}
                    <div className="lg:col-span-2 p-6 lg:p-8">
                      <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{getSectorLabel(caseStudy.sector)}</Badge>
                          <Badge variant="outline">{getRegionLabel(caseStudy.region)}</Badge>
                          <Badge variant="outline" className="text-primary border-primary">
                            S-ROI: {caseStudy.sRoi}
                          </Badge>
                          {caseStudy.featured && (
                            <Badge className="bg-yellow-500/10 text-yellow-600 border-0">
                              <Award className="w-3 h-3 mr-1" />
                              {t("common.featured")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {compareMode && (
                            <Button
                              variant={selectedForCompare.includes(caseStudy.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (selectedForCompare.includes(caseStudy.id)) {
                                  setSelectedForCompare(selectedForCompare.filter(id => id !== caseStudy.id));
                                } else if (selectedForCompare.length < 3) {
                                  setSelectedForCompare([...selectedForCompare, caseStudy.id]);
                                } else {
                                  toast.error(t("common.maxCompare"));
                                }
                              }}
                            >
                              {selectedForCompare.includes(caseStudy.id) ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  {t("common.selected")}
                                </>
                              ) : (
                                <>
                                  <Scale className="w-4 h-4 mr-1" />
                                  {t("cases.actions.compare")}
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFavorite(caseStudy.id)}
                          >
                            {isFavorite(caseStudy.id) ? (
                              <>
                                <Heart className="w-4 h-4 mr-1 fill-red-500 text-red-500" />
                                {t("common.saved")}
                              </>
                            ) : (
                              <>
                                <Heart className="w-4 h-4 mr-1" />
                                {t("common.save")}
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(caseStudy)}
                            disabled={generatePDFMutation.isPending}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2">{caseStudy.title}</h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {caseStudy.organization}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {caseStudy.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {caseStudy.duration}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">{caseStudy.description}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-1 text-red-500">{t("common.challenge")}</h4>
                          <p className="text-sm text-muted-foreground">{caseStudy.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1 text-blue-500">{t("common.solution")}</h4>
                          <p className="text-sm text-muted-foreground">{caseStudy.solution}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1 text-green-500">{t("common.results")}</h4>
                          <p className="text-sm text-muted-foreground">{caseStudy.results}</p>
                        </div>
                      </div>

                      {/* Testimonial */}
                      {caseStudy.testimonial.quote && (
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Quote className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm italic text-muted-foreground mb-2">
                              "{caseStudy.testimonial.quote}"
                            </p>
                            {caseStudy.testimonial.author && (
                              <p className="text-xs font-semibold">
                                {caseStudy.testimonial.author}
                              </p>
                            )}
                            {caseStudy.testimonial.role && (
                              <p className="text-xs text-muted-foreground">
                                {caseStudy.testimonial.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      )}

                      {/* SDGs */}
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t("common.relatedSDGs")}:</span>
                        <div className="flex gap-1">
                          {caseStudy.sdgs.map(sdg => (
                            <span key={sdg} className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                              {sdg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Metrics Sidebar */}
                    <div className="bg-muted/30 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l">
                      <h4 className="font-semibold mb-4">{t("common.impactMetrics")}</h4>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t("cases.card.investment")}</span>
                          <span className="font-semibold">{caseStudy.investment}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t("cases.card.beneficiaries")}</span>
                          <span className="font-semibold">{caseStudy.beneficiaries}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t("cases.filters.year")}</span>
                          <span className="font-semibold">{caseStudy.year}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {caseStudy.metrics.map((metric, index) => (
                          <div key={index} className="p-3 bg-background rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                            <div className={`text-lg font-bold ${metric.change === 'up' ? 'text-green-500' : 'text-blue-500'}`}>
                              {metric.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{caseStudy.sRoi}</div>
                          <div className="text-xs text-muted-foreground">{t("common.sroiDescription")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("cases.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("cases.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculadora">
                <Button size="lg" className="gradient-orange text-white border-0">
                  <Target className="w-5 h-5 mr-2" />
                  {t("common.calculateImpact")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline">
                  <Users className="w-5 h-5 mr-2" />
                  {t("cases.cta.contact")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
