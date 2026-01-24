import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Brain, BookOpen, Microscope, Users, Lightbulb, ChevronRight, GraduationCap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const references = [
  {
    type: "book",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    year: 2011,
    relevanceKey: "cognitiveBiases",
  },
  {
    type: "article",
    title: "Nudge: Improving Decisions About Health, Wealth, and Happiness",
    author: "Thaler & Sunstein",
    year: 2008,
    relevanceKey: "choiceArchitecture",
  },
  {
    type: "paper",
    title: "The SROI Network Guide to Social Return on Investment",
    author: "SROI Network",
    year: 2012,
    relevanceKey: "sroiMethodology",
  },
  {
    type: "book",
    title: "Poor Economics",
    author: "Banerjee & Duflo",
    year: 2011,
    relevanceKey: "effectiveInterventions",
  },
];

export default function Ciencia() {
  const { t } = useTranslation();

  const foundations = [
    {
      icon: Brain,
      key: "cognitive",
    },
    {
      icon: Users,
      key: "behavioral",
    },
    {
      icon: Microscope,
      key: "impact",
    },
    {
      icon: Lightbulb,
      key: "innovation",
    },
  ];

  const principles = [1, 2, 3, 4, 5, 6, 7];

  const getRefTypeLabel = (type: string) => {
    return t(`science.references.${type}`);
  };

  const getRelevanceText = (key: string) => {
    const relevanceMap: Record<string, string> = {
      cognitiveBiases: t("science.foundations.cognitive.description"),
      choiceArchitecture: t("science.foundations.behavioral.description"),
      sroiMethodology: t("science.foundations.impact.description"),
      effectiveInterventions: t("science.foundations.innovation.description"),
    };
    return relevanceMap[key] || "";
  };

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
              <span className="text-sm">{t("science.breadcrumb")}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
              <Brain className="w-4 h-4" />
              {t("science.badge")}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("science.title")}</h1>
            <p className="text-white/80 max-w-2xl">
              {t("science.subtitle")}
            </p>
          </div>
        </section>

        {/* Foundations */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("science.pillars.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("science.pillars.subtitle")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {foundations.map((foundation, index) => (
                <Card key={index} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center shrink-0">
                        <foundation.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {t(`science.foundations.${foundation.key}.title`)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t(`science.foundations.${foundation.key}.description`)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(t(`science.foundations.${foundation.key}.topics`, { returnObjects: true }) as string[]).map((topic, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 7 Principles */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("science.principles.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("science.principles.subtitle")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {principles.map((num) => (
                <Card key={num} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center text-white font-bold text-sm">
                        {num}
                      </div>
                      <h4 className="font-semibold text-sm">
                        {t(`science.principles.${num}.title`)}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(`science.principles.${num}.description`)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* References */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("science.references.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("science.references.subtitle")}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {references.map((ref, index) => (
                <Card key={index} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-muted rounded">
                            {getRefTypeLabel(ref.type)}
                          </span>
                          <span className="text-xs text-muted-foreground">{ref.year}</span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{ref.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{ref.author}</p>
                        <p className="text-xs text-primary line-clamp-2">{getRelevanceText(ref.relevanceKey)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("science.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("science.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/whitepaper">
                <Button size="lg" className="gradient-orange text-white border-0">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t("science.cta.downloadWhitepaper")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/matematica">
                <Button size="lg" variant="outline">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  {t("science.cta.viewMathModel")}
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
