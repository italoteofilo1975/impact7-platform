import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Cpu, Database, Brain, Shield, Zap, Cloud, Code, ChevronRight, Calculator, Server, Lock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function Tecnologia() {
  const { t } = useTranslation();

  const techStackKeys = ["jarvis", "contextLake", "analytics", "security"];
  const techStackIcons: Record<string, typeof Brain> = {
    jarvis: Brain,
    contextLake: Database,
    analytics: BarChart3,
    security: Shield,
  };

  const frameworkKeys = ["7r", "7v", "77t"];
  const architectureLayers = ["frontend", "backend", "database", "ia", "infra"];

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-16">
        {/* Hero */}
        <section className="gradient-hero text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-white/60 hover:text-white text-sm">Home</Link>
              <span className="text-white/40">/</span>
              <span className="text-sm">{t("technology.breadcrumb")}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
              <Cpu className="w-4 h-4" />
              {t("technology.badge")}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("technology.title")}</h1>
            <p className="text-white/80 max-w-2xl">
              {t("technology.subtitle")}
            </p>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("technology.stack.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("technology.stack.subtitle")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {techStackKeys.map((key) => {
                const Icon = techStackIcons[key];
                return (
                  <Card key={key} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {t(`technology.stack.${key}.title`)}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {t(`technology.stack.${key}.description`)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(t(`technology.stack.${key}.features`, { returnObjects: true }) as string[]).map((feature, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Frameworks */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("technology.frameworks.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("technology.frameworks.subtitle")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {frameworkKeys.map((key) => (
                <Card key={key} className="card-hover">
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 rounded-full gradient-orange flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                      {t(`technology.frameworks.${key}.name`)}
                    </div>
                    <CardTitle className="text-lg">
                      {t(`technology.frameworks.${key}.description`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(t(`technology.frameworks.${key}.items`, { returnObjects: true }) as string[]).map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("technology.architecture.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("technology.architecture.subtitle")}
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {architectureLayers.map((layer) => (
                  <Card key={layer} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Server className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {t(`technology.architecture.layers.${layer}.name`)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {t(`technology.architecture.layers.${layer}.description`)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-mono bg-muted px-3 py-1 rounded">
                          {t(`technology.architecture.layers.${layer}.tech`)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{t("technology.securitySection.title")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t("technology.securitySection.subtitle")}
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("technology.securitySection.encryption.title")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("technology.securitySection.encryption.description")}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("technology.securitySection.lgpd.title")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("technology.securitySection.lgpd.description")}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                      <Cloud className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("technology.securitySection.backup.title")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("technology.securitySection.backup.description")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("technology.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("technology.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculadora">
                <Button size="lg" className="gradient-orange text-white border-0">
                  <Calculator className="w-5 h-5 mr-2" />
                  {t("technology.cta.calculateImpact")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline">
                  <Code className="w-5 h-5 mr-2" />
                  {t("technology.cta.talkToTeam")}
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
