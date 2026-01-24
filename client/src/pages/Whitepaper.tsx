import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { FileText, Download, CheckCircle, BookOpen, ChevronRight, Mail, User, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function Whitepaper() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const chapterNumbers = [1, 2, 3, 4, 5, 6, 7];

  const downloadMutation = trpc.downloads.whitepaper.useMutation({
    onSuccess: (data) => {
      setIsDownloaded(true);
      toast.success(t("whitepaper.toast.success"));
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message || t("whitepaper.toast.error"));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error(t("whitepaper.toast.validation"));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await downloadMutation.mutateAsync({
        name,
        email,
        organization: organization || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <span className="text-sm">{t("whitepaper.breadcrumb")}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
              <FileText className="w-4 h-4" />
              {t("whitepaper.badge")}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("whitepaper.title")}</h1>
            <p className="text-white/80 max-w-2xl">
              {t("whitepaper.subtitle")}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Document Info */}
              <div>
                <Card className="mb-8">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-28 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{t("whitepaper.document.title")}</h3>
                        <p className="text-muted-foreground">{t("whitepaper.document.subtitle")}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{t("whitepaper.document.pages")}</span>
                          <span>•</span>
                          <span>{t("whitepaper.document.format")}</span>
                          <span>•</span>
                          <span>{t("whitepaper.document.version")}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {(t("whitepaper.highlights", { returnObjects: true }) as string[]).map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("whitepaper.chapters.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chapterNumbers.map((num) => (
                        <div key={num} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {num}
                            </div>
                            <span className="text-sm">{t(`whitepaper.chapters.${num}.title`)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            p. {t(`whitepaper.chapters.${num}.pages`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Download Form */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-primary" />
                      {isDownloaded ? t("whitepaper.form.titleSuccess") : t("whitepaper.form.title")}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {isDownloaded 
                        ? t("whitepaper.form.subtitleSuccess")
                        : t("whitepaper.form.subtitle")}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {isDownloaded ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h4 className="font-semibold mb-2">{t("whitepaper.form.successTitle")}</h4>
                        <p className="text-sm text-muted-foreground mb-6">
                          {t("whitepaper.form.successMessage")}
                        </p>
                        <Button className="w-full gradient-orange text-white border-0" size="lg">
                          <Download className="w-5 h-5 mr-2" />
                          {t("whitepaper.form.downloadNow")}
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("whitepaper.form.name")} *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="name"
                              placeholder={t("whitepaper.form.namePlaceholder")}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("whitepaper.form.email")} *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder={t("whitepaper.form.emailPlaceholder")}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="organization">{t("whitepaper.form.organization")}</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="organization"
                              placeholder={t("whitepaper.form.organizationPlaceholder")}
                              value={organization}
                              onChange={(e) => setOrganization(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full gradient-orange text-white border-0" 
                          size="lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>{t("whitepaper.form.processing")}</>
                          ) : (
                            <>
                              <Download className="w-5 h-5 mr-2" />
                              {t("whitepaper.form.submit")}
                            </>
                          )}
                        </Button>
                        
                        <p className="text-xs text-muted-foreground text-center">
                          {t("whitepaper.form.consent")}
                        </p>
                      </form>
                    )}
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
              {t("whitepaper.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("whitepaper.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculadora">
                <Button size="lg" className="gradient-orange text-white border-0">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t("whitepaper.cta.calculateImpact")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline">
                  {t("whitepaper.cta.scheduleConsulting")}
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
