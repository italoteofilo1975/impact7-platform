import { useState, useEffect } from 'react';

export interface WhiteLabelConfig {
  platformName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customDomain?: string;
  supportEmail?: string;
  supportPhone?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

const DEFAULT_CONFIG: WhiteLabelConfig = {
  platformName: 'IMPACT7',
  primaryColor: '#ff6b35',
  secondaryColor: '#004e89',
  accentColor: '#f7931e',
  fontFamily: 'Inter',
};

export function useWhiteLabel() {
  const [config, setConfig] = useState<WhiteLabelConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load white label config from API or localStorage
    const loadConfig = async () => {
      try {
        // Try to load from API
        const response = await fetch('/api/white-label/config');
        if (response.ok) {
          const data = await response.json();
          setConfig({ ...DEFAULT_CONFIG, ...data });
        }
      } catch (error) {
        console.warn('Failed to load white label config, using defaults');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    // Apply white label config to DOM
    if (!loading) {
      document.documentElement.style.setProperty('--color-primary', config.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
      document.documentElement.style.setProperty('--color-accent', config.accentColor);
      document.documentElement.style.setProperty('--font-family', config.fontFamily);
      
      // Update page title
      document.title = config.platformName;
      
      // Update favicon if provided
      if (config.faviconUrl) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = config.faviconUrl;
        }
      }
    }
  }, [config, loading]);

  return { config, loading };
}
