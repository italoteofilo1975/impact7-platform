import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Calculator, ChevronRight, BookOpen, Lightbulb, Target, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function Matematica() {
  const { t } = useTranslation();

  const variables = ["I", "E", "C", "R"];
  const dimensions = [1, 2, 3, 4, 5, 6, 7];

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
              <span className="text-sm">{t("math.breadcrumb")}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
              <Calculator className="w-4 h-4" />
              {t("math.badge")}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("math.title")}</h1>
            <p className="text-white/80 max-w-2xl">
              {t("math.subtitle")}
            </p>
          </div>
        </section>

        {/* Main Equation */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-primary/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{t("math.equation.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="equation text-center py-8 text-4xl md:text-6xl">
                    <span className="text-primary">I</span> = (<span className="text-primary">E</span> × <span className="text-primary">C</span><sup className="text-2xl md:text-3xl">7</sup>) / <span className="text-primary">R</span>
                  </div>
                  <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                    {t("math.equation.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Variables */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("math.variables.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("math.variables.subtitle")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {variables.map((symbol) => (
                <Card key={symbol} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl gradient-orange flex items-center justify-center text-white text-3xl font-bold shrink-0">
                        {symbol}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {t(`math.variables.${symbol}.name`)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t(`math.variables.${symbol}.description`)}
                        </p>
                        <div className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                          {t(`math.variables.${symbol}.formula`)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t("math.variables.unit")}: {t(`math.variables.${symbol}.unit`)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* The Power of 7 */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
                  <Lightbulb className="w-4 h-4" />
                  {t("math.powerOf7.badge")}
                </div>
                <h2 className="text-3xl font-bold mb-4">{t("math.powerOf7.title")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t("math.powerOf7.subtitle")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dimensions.map((dim) => (
                  <Card key={dim} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center text-white font-bold text-sm">
                          {dim}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {t(`math.powerOf7.dimensions.${dim}.name`)}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {t(`math.powerOf7.dimensions.${dim}.description`)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary/5 rounded-xl">
                <div className="flex items-start gap-4">
                  <BarChart3 className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">{t("math.powerOf7.effect.title")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("math.powerOf7.effect.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* S-ROI */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{t("math.sroi.title")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t("math.sroi.subtitle")}
                </p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <div className="equation text-center py-4 text-2xl md:text-4xl mb-6">
                    <span className="text-primary">S-ROI</span> = <span className="text-primary">VS</span> / <span className="text-primary">E</span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">{t("math.sroi.socialValue.title")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("math.sroi.socialValue.description")}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">{t("math.sroi.investment.title")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("math.sroi.investment.description")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">{t("math.sroi.interpretation.title")}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("math.sroi.interpretation.description")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("math.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("math.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculadora">
                <Button size="lg" className="gradient-orange text-white border-0">
                  <Calculator className="w-5 h-5 mr-2" />
                  {t("math.cta.calculateImpact")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/whitepaper">
                <Button size="lg" variant="outline">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t("math.cta.readWhitepaper")}
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
