import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Google Analytics Component
 * Integra Google Analytics 4 (GA4) para rastreamento de conversões
 */

// ID do Google Analytics (substitua pelo seu ID real)
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Substituir pelo ID real do GA4

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function GoogleAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    // Carregar script do Google Analytics
    if (typeof window !== 'undefined' && !window.gtag) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location,
      });
    }
  }, []);

  // Rastrear mudanças de página
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location,
      });
    }
  }, [location]);

  return null;
}

/**
 * Rastreia evento customizado no Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}

/**
 * Rastreia conversão (evento importante)
 */
export function trackConversion(
  conversionName: string,
  value?: number,
  currency: string = 'BRL'
) {
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: GA_MEASUREMENT_ID,
      value: value,
      currency: currency,
      transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event_category: 'engagement',
      event_label: conversionName,
    });
  }
}

/**
 * Eventos pré-configurados para facilitar o uso
 */
export const GAEvents = {
  // Leads e Contatos
  leadCaptured: (source?: string) => {
    trackConversion('lead_captured', 10);
    trackEvent('generate_lead', {
      event_category: 'lead',
      event_label: source || 'unknown',
    });
  },

  contactFormSubmitted: () => {
    trackConversion('contact_form_submitted', 5);
    trackEvent('contact', {
      event_category: 'engagement',
      event_label: 'contact_form',
    });
  },

  // Downloads
  whitepaperDownloaded: () => {
    trackConversion('whitepaper_download', 15);
    trackEvent('file_download', {
      event_category: 'download',
      event_label: 'whitepaper',
      file_name: 'IMPACT7_Whitepaper.pdf',
    });
  },

  ebookDownloaded: () => {
    trackConversion('ebook_download', 12);
    trackEvent('file_download', {
      event_category: 'download',
      event_label: 'ebook',
    });
  },

  certificateDownloaded: () => {
    trackConversion('certificate_download', 8);
    trackEvent('file_download', {
      event_category: 'download',
      event_label: 'certificate',
    });
  },

  // Calculadora
  calculatorUsed: (result?: number) => {
    trackEvent('calculator_used', {
      event_category: 'tool',
      event_label: 'impact_calculator',
      value: result,
    });
  },

  calculatorResultDownloaded: () => {
    trackConversion('calculator_pdf_download', 10);
    trackEvent('file_download', {
      event_category: 'download',
      event_label: 'calculator_result',
    });
  },

  // Cases
  caseSubmitted: () => {
    trackConversion('case_submitted', 20);
    trackEvent('case_submission', {
      event_category: 'engagement',
      event_label: 'case_study',
    });
  },

  caseViewed: (caseId: string) => {
    trackEvent('case_view', {
      event_category: 'content',
      event_label: caseId,
    });
  },

  // Jarvis
  jarvisChatStarted: () => {
    trackEvent('jarvis_chat_started', {
      event_category: 'engagement',
      event_label: 'ai_assistant',
    });
  },

  jarvisQuestionAsked: (question: string) => {
    trackEvent('jarvis_question', {
      event_category: 'engagement',
      event_label: 'ai_question',
      question_length: question.length,
    });
  },

  // Newsletter
  newsletterSubscribed: () => {
    trackConversion('newsletter_subscription', 5);
    trackEvent('newsletter_signup', {
      event_category: 'engagement',
      event_label: 'newsletter',
    });
  },

  // Navegação
  ctaClicked: (ctaName: string) => {
    trackEvent('cta_click', {
      event_category: 'engagement',
      event_label: ctaName,
    });
  },

  externalLinkClicked: (url: string) => {
    trackEvent('outbound_link', {
      event_category: 'navigation',
      event_label: url,
    });
  },
};
