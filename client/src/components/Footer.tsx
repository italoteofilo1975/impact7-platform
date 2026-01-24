import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Linkedin, Instagram, Youtube } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center">
                <span className="text-white font-bold text-xl">7</span>
              </div>
              <span className="font-bold text-xl">IMPACT7</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {t("footer.tagline", "Inovação Social Exponencial. Transformando impacto social com ciência, matemática e tecnologia.")}
            </p>
            <div className="flex gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.quickLinks", "Links Rápidos")}</h4>
            <ul className="space-y-2">
              <li><Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">{t("footer.admin", "Administração")}</Link></li>
              <li><Link href="/ciencia" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.science", "Ciência")}</Link></li>
              <li><Link href="/matematica" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.math", "Matemática")}</Link></li>
              <li><Link href="/tecnologia" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.technology", "Tecnologia")}</Link></li>
              <li><Link href="/calculadora" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.calculator", "Calculadora")}</Link></li>
              <li><Link href="/sobre" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.aboutUs", "Sobre Nós")}</Link></li>
              <li><Link href="/parceiros" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.partners", "Parceiros")}</Link></li>
              <li><Link href="/carreiras" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.careers", "Carreiras")}</Link></li>
              <li><Link href="/demo" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.scheduleDemo", "Agendar Demo")}</Link></li>
              <li><Link href="/newsletter" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.newsletter", "Newsletter")}</Link></li>
              <li><Link href="/casos-sucesso" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.successCases", "Casos de Sucesso")}</Link></li>
              <li><Link href="/comparacao" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.comparePlans", "Comparar Planos")}</Link></li>
              <li><Link href="/depoimentos" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.testimonials", "Depoimentos")}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.resources", "Recursos")}</h4>
            <ul className="space-y-2">
              <li><Link href="/whitepaper" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.whitepaper", "Whitepaper")}</Link></li>
              <li><Link href="/cases" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.caseStudies", "Casos de Estudo")}</Link></li>
              <li><Link href="/ebook" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.freeEbook", "E-book Gratuito")}</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.blog", "Blog")}</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.faq", "FAQ")}</Link></li>
              <li><Link href="/suporte" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.support", "Suporte")}</Link></li>
              <li><Link href="/precos" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.pricing", "Preços")}</Link></li>
              <li><Link href="/api-docs" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.apiDocs", "API Docs")}</Link></li>
              <li><Link href="/status" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.status", "Status")}</Link></li>
              <li><Link href="/changelog" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.changelog", "Changelog")}</Link></li>
              <li><Link href="/roadmap" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.roadmap", "Roadmap")}</Link></li>
              <li><Link href="/integracoes" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.integrations", "Integrações")}</Link></li>
              <li><Link href="/webinars" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.webinars", "Webinars")}</Link></li>
              <li><Link href="/seguranca" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.security", "Segurança")}</Link></li>
              <li><Link href="/comunidade" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.community", "Comunidade")}</Link></li>
              <li><Link href="/recursos" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.resourcesLink", "Recursos")}</Link></li>
              <li><Link href="/metodologia" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.methodology", "Metodologia")}</Link></li>
              <li><Link href="/glossario" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.glossary", "Glossário")}</Link></li>
              <li><Link href="/certificacoes" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("footer.certifications", "Certificações")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.contact", "Contato")}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                contato@impact7.com.br
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                +55 (11) 99999-9999
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                São Paulo, Brasil
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} IMPACT7. {t("footer.allRightsReserved", "Todos os direitos reservados.")}
          </p>
          <div className="flex gap-6">
            <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("footer.privacy", "Privacidade")}
            </Link>
            <Link href="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("footer.terms", "Termos de Uso")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
