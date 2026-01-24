import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Building, User, FileText, BarChart, Check, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const sectorKeys = [
  "education",
  "health",
  "microfinance",
  "agriculture",
  "housing",
  "environment",
  "culture",
  "socialAssistance",
  "communityDevelopment",
  "other",
];

interface FormData {
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectTitle: string;
  sector: string;
  location: string;
  investment: string;
  beneficiaries: string;
  duration: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: Array<{ label: string; value: string }>;
  documentUrl: string;
}

export default function CaseSubmit() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    organizationName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    projectTitle: "",
    sector: "",
    location: "",
    investment: "",
    beneficiaries: "",
    duration: "",
    description: "",
    challenge: "",
    solution: "",
    results: "",
    metrics: [
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
    ],
    documentUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: t('cases.submit.steps.organization'), icon: Building },
    { id: 2, title: t('cases.submit.steps.project'), icon: FileText },
    { id: 3, title: t('cases.submit.steps.impact'), icon: BarChart },
    { id: 4, title: t('cases.submit.steps.review'), icon: Check },
  ];

  const submitMutation = trpc.cases.submitCase.useMutation({
    onSuccess: (data) => {
      toast.success(t('cases.submit.toast.success'));
      setLocation('/cases');
    },
    onError: (error) => {
      toast.error(error.message || t('cases.submit.toast.error'));
    },
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const updateMetric = (index: number, field: 'label' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.organizationName.trim()) newErrors.organizationName = t('cases.submit.validation.organizationNameRequired');
      if (!formData.contactName.trim()) newErrors.contactName = t('cases.submit.validation.contactNameRequired');
      if (!formData.contactEmail.trim()) newErrors.contactEmail = t('cases.submit.validation.emailRequired');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = t('cases.submit.validation.emailInvalid');
      }
    }

    if (step === 2) {
      if (!formData.projectTitle.trim()) newErrors.projectTitle = t('cases.submit.validation.projectTitleRequired');
      if (!formData.sector) newErrors.sector = t('cases.submit.validation.sectorRequired');
      if (!formData.location.trim()) newErrors.location = t('cases.submit.validation.locationRequired');
      if (!formData.investment.trim()) newErrors.investment = t('cases.submit.validation.investmentRequired');
      if (!formData.beneficiaries.trim()) newErrors.beneficiaries = t('cases.submit.validation.beneficiariesRequired');
      if (!formData.duration.trim()) newErrors.duration = t('cases.submit.validation.durationRequired');
      if (!formData.description.trim()) newErrors.description = t('cases.submit.validation.descriptionRequired');
      else if (formData.description.length < 50) newErrors.description = t('cases.submit.validation.descriptionMinLength');
    }

    if (step === 3) {
      if (!formData.challenge.trim()) newErrors.challenge = t('cases.submit.validation.challengeRequired');
      else if (formData.challenge.length < 30) newErrors.challenge = t('cases.submit.validation.challengeMinLength');
      if (!formData.solution.trim()) newErrors.solution = t('cases.submit.validation.solutionRequired');
      else if (formData.solution.length < 30) newErrors.solution = t('cases.submit.validation.solutionMinLength');
      if (!formData.results.trim()) newErrors.results = t('cases.submit.validation.resultsRequired');
      else if (formData.results.length < 30) newErrors.results = t('cases.submit.validation.resultsMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    const validMetrics = formData.metrics.filter(m => m.label.trim() && m.value.trim());
    
    submitMutation.mutate({
      ...formData,
      metrics: validMetrics,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/cases">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{t('cases.submit.title')}</h1>
              <p className="text-muted-foreground">
                {t('cases.submit.subtitle')}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step.id 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm hidden sm:inline ${
                  currentStep >= step.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && t('cases.submit.step1.title')}
                {currentStep === 2 && t('cases.submit.step2.title')}
                {currentStep === 3 && t('cases.submit.step3.title')}
                {currentStep === 4 && t('cases.submit.step4.title')}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && t('cases.submit.step1.description')}
                {currentStep === 2 && t('cases.submit.step2.description')}
                {currentStep === 3 && t('cases.submit.step3.description')}
                {currentStep === 4 && t('cases.submit.step4.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Organization */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">{t('cases.submit.step1.organizationName')} *</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => updateField('organizationName', e.target.value)}
                      placeholder={t('cases.submit.step1.organizationNamePlaceholder')}
                      className={errors.organizationName ? 'border-red-500' : ''}
                    />
                    {errors.organizationName && (
                      <p className="text-sm text-red-500">{errors.organizationName}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">{t('cases.submit.step1.contactName')} *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => updateField('contactName', e.target.value)}
                        placeholder={t('cases.submit.step1.contactNamePlaceholder')}
                        className={errors.contactName ? 'border-red-500' : ''}
                      />
                      {errors.contactName && (
                        <p className="text-sm text-red-500">{errors.contactName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">{t('cases.submit.step1.contactPhone')}</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => updateField('contactPhone', e.target.value)}
                        placeholder={t('cases.submit.step1.contactPhonePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">{t('cases.submit.step1.contactEmail')} *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                      placeholder={t('cases.submit.step1.contactEmailPlaceholder')}
                      className={errors.contactEmail ? 'border-red-500' : ''}
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-red-500">{errors.contactEmail}</p>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Project */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="projectTitle">{t('cases.submit.step2.projectTitle')} *</Label>
                    <Input
                      id="projectTitle"
                      value={formData.projectTitle}
                      onChange={(e) => updateField('projectTitle', e.target.value)}
                      placeholder={t('cases.submit.step2.projectTitlePlaceholder')}
                      className={errors.projectTitle ? 'border-red-500' : ''}
                    />
                    {errors.projectTitle && (
                      <p className="text-sm text-red-500">{errors.projectTitle}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sector">{t('cases.submit.step2.sector')} *</Label>
                      <Select value={formData.sector} onValueChange={(v) => updateField('sector', v)}>
                        <SelectTrigger className={errors.sector ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('cases.submit.step2.sectorPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {sectorKeys.map(sectorKey => (
                            <SelectItem key={sectorKey} value={sectorKey}>
                              {t(`cases.submit.sectors.${sectorKey}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sector && (
                        <p className="text-sm text-red-500">{errors.sector}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">{t('cases.submit.step2.location')} *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        placeholder={t('cases.submit.step2.locationPlaceholder')}
                        className={errors.location ? 'border-red-500' : ''}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500">{errors.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="investment">{t('cases.submit.step2.investment')} *</Label>
                      <Input
                        id="investment"
                        value={formData.investment}
                        onChange={(e) => updateField('investment', e.target.value)}
                        placeholder={t('cases.submit.step2.investmentPlaceholder')}
                        className={errors.investment ? 'border-red-500' : ''}
                      />
                      {errors.investment && (
                        <p className="text-sm text-red-500">{errors.investment}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaries">{t('cases.submit.step2.beneficiaries')} *</Label>
                      <Input
                        id="beneficiaries"
                        value={formData.beneficiaries}
                        onChange={(e) => updateField('beneficiaries', e.target.value)}
                        placeholder={t('cases.submit.step2.beneficiariesPlaceholder')}
                        className={errors.beneficiaries ? 'border-red-500' : ''}
                      />
                      {errors.beneficiaries && (
                        <p className="text-sm text-red-500">{errors.beneficiaries}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">{t('cases.submit.step2.duration')} *</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => updateField('duration', e.target.value)}
                        placeholder={t('cases.submit.step2.durationPlaceholder')}
                        className={errors.duration ? 'border-red-500' : ''}
                      />
                      {errors.duration && (
                        <p className="text-sm text-red-500">{errors.duration}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('cases.submit.step2.description')} * (50 {t('cases.submit.step2.minChars')})</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder={t('cases.submit.step2.descriptionPlaceholder')}
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {errors.description && (
                        <p className="text-red-500">{errors.description}</p>
                      )}
                      <span className="ml-auto">{formData.description.length}/50 {t('cases.submit.step2.minChars')}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Impact */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="challenge">{t('cases.submit.step3.challenge')} * (30 {t('cases.submit.step2.minChars')})</Label>
                    <Textarea
                      id="challenge"
                      value={formData.challenge}
                      onChange={(e) => updateField('challenge', e.target.value)}
                      placeholder={t('cases.submit.step3.challengePlaceholder')}
                      rows={3}
                      className={errors.challenge ? 'border-red-500' : ''}
                    />
                    {errors.challenge && (
                      <p className="text-sm text-red-500">{errors.challenge}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solution">{t('cases.submit.step3.solution')} * (30 {t('cases.submit.step2.minChars')})</Label>
                    <Textarea
                      id="solution"
                      value={formData.solution}
                      onChange={(e) => updateField('solution', e.target.value)}
                      placeholder={t('cases.submit.step3.solutionPlaceholder')}
                      rows={3}
                      className={errors.solution ? 'border-red-500' : ''}
                    />
                    {errors.solution && (
                      <p className="text-sm text-red-500">{errors.solution}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="results">{t('cases.submit.step3.results')} * (30 {t('cases.submit.step2.minChars')})</Label>
                    <Textarea
                      id="results"
                      value={formData.results}
                      onChange={(e) => updateField('results', e.target.value)}
                      placeholder={t('cases.submit.step3.resultsPlaceholder')}
                      rows={3}
                      className={errors.results ? 'border-red-500' : ''}
                    />
                    {errors.results && (
                      <p className="text-sm text-red-500">{errors.results}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>{t('cases.submit.step3.metrics')} {t('cases.submit.step3.metricsOptional')}</Label>
                    {formData.metrics.map((metric, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <Input
                          value={metric.label}
                          onChange={(e) => updateMetric(index, 'label', e.target.value)}
                          placeholder={t('cases.submit.step3.metricLabel', { number: index + 1 })}
                        />
                        <Input
                          value={metric.value}
                          onChange={(e) => updateMetric(index, 'value', e.target.value)}
                          placeholder={t('cases.submit.step3.metricValue')}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentUrl">{t('cases.submit.step3.documentUrl')}</Label>
                    <Input
                      id="documentUrl"
                      value={formData.documentUrl}
                      onChange={(e) => updateField('documentUrl', e.target.value)}
                      placeholder={t('cases.submit.step3.documentUrlPlaceholder')}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('cases.submit.step3.documentUrlHint')}
                    </p>
                  </div>
                </>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('cases.submit.step4.alert')}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {t('cases.submit.step4.organization')}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">{t('cases.submit.step4.name')}:</span> {formData.organizationName}</div>
                        <div><span className="text-muted-foreground">{t('cases.submit.step4.contact')}:</span> {formData.contactName}</div>
                        <div><span className="text-muted-foreground">{t('cases.submit.step4.email')}:</span> {formData.contactEmail}</div>
                        <div><span className="text-muted-foreground">{t('cases.submit.step4.phone')}:</span> {formData.contactPhone || '-'}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('cases.submit.step4.project')}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-muted-foreground">{t('cases.submit.step4.title')}:</span> {formData.projectTitle}</div>
                        <div className="grid md:grid-cols-3 gap-2">
                          <div><span className="text-muted-foreground">{t('cases.submit.step4.sector')}:</span> {formData.sector ? t(`cases.submit.sectors.${formData.sector}`) : '-'}</div>
                          <div><span className="text-muted-foreground">{t('cases.submit.step4.location')}:</span> {formData.location}</div>
                          <div><span className="text-muted-foreground">{t('cases.submit.step4.duration')}:</span> {formData.duration}</div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                          <div><span className="text-muted-foreground">{t('cases.submit.step4.investment')}:</span> {formData.investment}</div>
                          <div><span className="text-muted-foreground">{t('cases.submit.step4.beneficiaries')}:</span> {formData.beneficiaries}</div>
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground">{t('cases.submit.step4.description')}:</span>
                          <p className="mt-1">{formData.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BarChart className="w-4 h-4" />
                        {t('cases.submit.step4.impact')}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground font-medium">{t('cases.submit.step4.challenge')}:</span>
                          <p className="mt-1">{formData.challenge}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">{t('cases.submit.step4.solution')}:</span>
                          <p className="mt-1">{formData.solution}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">{t('cases.submit.step4.results')}:</span>
                          <p className="mt-1">{formData.results}</p>
                        </div>
                        {formData.metrics.some(m => m.label && m.value) && (
                          <div>
                            <span className="text-muted-foreground font-medium">{t('cases.submit.step4.metrics')}:</span>
                            <ul className="mt-1 list-disc list-inside">
                              {formData.metrics.filter(m => m.label && m.value).map((m, i) => (
                                <li key={i}>{m.label}: {m.value}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('cases.submit.navigation.back')}
                </Button>
                
                {currentStep < 4 ? (
                  <Button onClick={nextStep}>
                    {t('cases.submit.navigation.next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="gradient-orange text-white border-0"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {t('cases.submit.navigation.submitting')}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t('cases.submit.navigation.submit')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
