import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

const defaultMeta = {
  title: "Método IMPACT7 - Inovação Social Exponencial",
  description:
    "Transforme seu impacto social com ciência cognitiva, modelagem matemática e engenharia de software. Calcule o S-ROI dos seus projetos e maximize resultados.",
  keywords:
    "impacto social, SROI, retorno social, inovação social, mensuração de impacto, ODS, ESG",
  image: "https://impact7.com.br/og-image.png",
  url: "https://impact7.com.br",
  type: "website" as const,
};

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  article,
}: SEOProps) {
  const { i18n } = useTranslation();
  
  const fullTitle = title
    ? `${title} | IMPACT7`
    : defaultMeta.title;
  const fullDescription = description || defaultMeta.description;
  const fullImage = image || defaultMeta.image;
  const fullUrl = url || defaultMeta.url;
  const fullKeywords = keywords || defaultMeta.keywords;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tag
    const updateMeta = (
      selector: string,
      content: string,
      attribute: string = "content"
    ) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        const [attr, value] = selector.replace(/[\[\]"']/g, "").split("=");
        if (attr === "name" || attr === "property") {
          element.setAttribute(attr, value);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Primary Meta Tags
    updateMeta('meta[name="title"]', fullTitle);
    updateMeta('meta[name="description"]', fullDescription);
    updateMeta('meta[name="keywords"]', fullKeywords);

    // Open Graph
    updateMeta('meta[property="og:type"]', type);
    updateMeta('meta[property="og:url"]', fullUrl);
    updateMeta('meta[property="og:title"]', fullTitle);
    updateMeta('meta[property="og:description"]', fullDescription);
    updateMeta('meta[property="og:image"]', fullImage);

    // Twitter
    updateMeta('meta[property="twitter:url"]', fullUrl);
    updateMeta('meta[property="twitter:title"]', fullTitle);
    updateMeta('meta[property="twitter:description"]', fullDescription);
    updateMeta('meta[property="twitter:image"]', fullImage);

    // Article specific
    if (type === "article" && article) {
      if (article.publishedTime) {
        updateMeta(
          'meta[property="article:published_time"]',
          article.publishedTime
        );
      }
      if (article.modifiedTime) {
        updateMeta(
          'meta[property="article:modified_time"]',
          article.modifiedTime
        );
      }
      if (article.author) {
        updateMeta('meta[property="article:author"]', article.author);
      }
      if (article.section) {
        updateMeta('meta[property="article:section"]', article.section);
      }
    }

    // Canonical URL
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;
    
    // Locale
    const locales: Record<string, string> = {
      pt: 'pt_BR',
      en: 'en_US',
      es: 'es_ES',
    };
    updateMeta('meta[property="og:locale"]', locales[i18n.language] || 'pt_BR');
    
    // Hreflang alternate links
    const updateHreflang = (lang: string, hreflangValue: string) => {
      const selector = `link[rel="alternate"][hreflang="${hreflangValue}"]`;
      let link = document.querySelector(selector) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = hreflangValue;
        document.head.appendChild(link);
      }
      link.href = fullUrl.replace(/\/$/, '') + `?lang=${lang}`;
    };
    
    updateHreflang('pt', 'pt');
    updateHreflang('en', 'en');
    updateHreflang('es', 'es');
    updateHreflang('pt', 'x-default');
    
    // Robots
    updateMeta('meta[name="robots"]', 'index, follow');
    
  }, [fullTitle, fullDescription, fullImage, fullUrl, fullKeywords, type, article, i18n.language]);

  return null;
}

export default SEO;
