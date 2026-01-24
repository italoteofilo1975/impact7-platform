import { Award, Building2, Globe, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

// Map icon names to components
const iconMap: Record<string, any> = {
  Users,
  Building2,
  TrendingUp,
  Globe,
};

export function SocialProofSection() {
  const { t } = useTranslation();

  // Fetch data from database
  const { data: metrics, isLoading: metricsLoading } = trpc.socialProof.getMetrics.useQuery();
  const { data: certifications, isLoading: certsLoading } = trpc.socialProof.getCertifications.useQuery();
  const { data: partners, isLoading: partnersLoading } = trpc.socialProof.getPartners.useQuery();
  const { data: featuredCases, isLoading: casesLoading } = trpc.socialProof.getFeaturedCases.useQuery();

  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">{t('socialProof.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('socialProof.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('socialProof.subtitle')}
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {metricsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="text-center">
                <CardContent className="p-6">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-10 w-20 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-1" />
                  <Skeleton className="h-3 w-32 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            metrics?.map((metric: any, index: number) => {
              const IconComponent = iconMap[metric.icon] || Users;
              return (
                <Card key={index} className="text-center card-hover">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                      {metric.value}
                    </div>
                    <div className="font-semibold mb-1">{t(metric.labelKey)}</div>
                    <div className="text-xs text-muted-foreground">{t(metric.descriptionKey)}</div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Featured Cases */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">{t('socialProof.featuredCases')}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {casesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-2 gradient-orange" />
                  <CardContent className="p-6">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-6 w-48 mb-1" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredCases?.map((caseItem: any, index: number) => (
                <Card key={index} className="card-hover overflow-hidden">
                  <div className="h-2 gradient-orange" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">{t('socialProof.verified')}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{caseItem.organization}</h4>
                    <p className="text-muted-foreground text-sm mb-4">{caseItem.title}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">{caseItem.sroi}x</div>
                        <div className="text-xs text-muted-foreground">S-ROI</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{Number(caseItem.beneficiaries).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{t('socialProof.beneficiariesLabel')}</div>
                      </div>
                    </div>
                    
                    <div className="text-xs bg-primary/5 text-primary px-3 py-2 rounded-lg">
                      {caseItem.sector}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Partners Logos */}
        <div className="mb-16">
          <h3 className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-8">
            {t('socialProof.partnersTitle')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partnersLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-4 rounded-lg bg-card border border-border">
                  <Skeleton className="w-12 h-12 rounded-full mb-2" />
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : (
              partners?.map((partner: any, index: number) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      alt={partner.name} 
                      className="w-12 h-12 rounded-full object-cover mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="text-sm font-medium text-center">{partner.name}</div>
                  <div className="text-xs text-muted-foreground">{partner.category}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="text-center">
          <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-6">
            {t('socialProof.certificationsTitle')}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {certsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-40 rounded-full" />
              ))
            ) : (
              certifications?.map((cert: any, index: number) => (
                <div 
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                >
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-medium">{cert.name}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{t(cert.descriptionKey)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SocialProofSection;

// Componente compacto para usar em outras páginas
export function SocialProofCompact() {
  const { t } = useTranslation();
  const { data: metrics } = trpc.socialProof.getMetrics.useQuery();
  
  // Extract specific metrics for compact view
  const orgMetric = metrics?.find((m: any) => m.metricKey === 'organizations');
  const benefMetric = metrics?.find((m: any) => m.metricKey === 'beneficiaries');
  
  return (
    <div className="py-8 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{orgMetric?.value || '500+'}</div>
            <div className="text-xs text-muted-foreground">{t('socialProof.compact.organizations')}</div>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{benefMetric?.value || '2.5M+'}</div>
            <div className="text-xs text-muted-foreground">{t('socialProof.compact.beneficiaries')}</div>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">12x</div>
            <div className="text-xs text-muted-foreground">{t('socialProof.compact.avgSroi')}</div>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">98%</div>
            <div className="text-xs text-muted-foreground">{t('socialProof.compact.satisfaction')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
