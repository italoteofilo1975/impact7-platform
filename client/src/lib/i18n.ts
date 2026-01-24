import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Supported languages
export const supportedLanguages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

i18n
  // Load translations from /locales
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    // Default language
    fallbackLng: 'pt',
    
    // Supported languages
    supportedLngs: ['pt', 'en', 'es'],
    
    // Debug mode (disable in production)
    debug: import.meta.env.DEV,
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Backend options for loading translations
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    
    // Detection options
    detection: {
      // Order of language detection - check localStorage first, then browser settings
      order: ['localStorage', 'querystring', 'navigator', 'htmlTag', 'path', 'subdomain'],
      
      // Cache user language in localStorage
      caches: ['localStorage'],
      
      // Key for localStorage
      lookupLocalStorage: 'impact7-language',
      
      // Query string parameter for language (e.g., ?lang=en)
      lookupQuerystring: 'lang',
    },
    
    // React options
    react: {
      useSuspense: true,
    },
  });

// Helper function to change language
export const changeLanguage = async (lang: SupportedLanguage) => {
  await i18n.changeLanguage(lang);
  // Store in localStorage for persistence
  localStorage.setItem('impact7-language', lang);
  // Update HTML lang attribute
  document.documentElement.lang = lang;
};

// Get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language?.split('-')[0] || 'pt') as SupportedLanguage;
};

// Get language info
export const getLanguageInfo = (code: SupportedLanguage) => {
  return supportedLanguages.find(lang => lang.code === code);
};

export default i18n;
