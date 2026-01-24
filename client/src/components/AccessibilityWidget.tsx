/**
 * Accessibility Widget
 * SET7.05 - Construção Performática
 * 
 * Widget flutuante para controles de acessibilidade WCAG 2.2 AA
 */

import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Eye, 
  Type, 
  MousePointer2, 
  Contrast, 
  Volume2,
  ZoomIn,
  ZoomOut,
  Pause,
  Play,
  X,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  largerCursor: boolean;
  highlightLinks: boolean;
  textSpacing: boolean;
  dyslexiaFont: boolean;
  readingGuide: boolean;
  screenReaderMode: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  largerCursor: false,
  highlightLinks: false,
  textSpacing: false,
  dyslexiaFont: false,
  readingGuide: false,
  screenReaderMode: false,
};

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  // Aplicar configurações ao documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Tamanho da fonte
    root.style.fontSize = `${settings.fontSize}%`;
    
    // Alto contraste
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Movimento reduzido
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Cursor maior
    if (settings.largerCursor) {
      root.classList.add('larger-cursor');
    } else {
      root.classList.remove('larger-cursor');
    }
    
    // Destacar links
    if (settings.highlightLinks) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }
    
    // Espaçamento de texto
    if (settings.textSpacing) {
      root.classList.add('text-spacing');
    } else {
      root.classList.remove('text-spacing');
    }
    
    // Fonte para dislexia
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }
    
    // Guia de leitura
    if (settings.readingGuide) {
      root.classList.add('reading-guide');
    } else {
      root.classList.remove('reading-guide');
    }
    
    // Modo leitor de tela
    if (settings.screenReaderMode) {
      root.setAttribute('role', 'application');
    } else {
      root.removeAttribute('role');
    }
    
    // Salvar no localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const increaseFontSize = () => {
    setSettings(prev => ({ ...prev, fontSize: Math.min(prev.fontSize + 10, 150) }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({ ...prev, fontSize: Math.max(prev.fontSize - 10, 80) }));
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-20 left-4 sm:bottom-24 sm:left-6 z-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg bg-background border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all"
            aria-label="Abrir configurações de acessibilidade"
          >
            <Accessibility className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Acessibilidade
            </SheetTitle>
            <SheetDescription>
              Personalize a experiência de acordo com suas necessidades
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Tamanho da Fonte */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Tamanho do Texto
                </Label>
                <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize <= 80}
                  aria-label="Diminuir tamanho do texto"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={80}
                  max={150}
                  step={10}
                  className="flex-1"
                  aria-label="Ajustar tamanho do texto"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseFontSize}
                  disabled={settings.fontSize >= 150}
                  aria-label="Aumentar tamanho do texto"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Contraste */}
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
                <Contrast className="w-4 h-4" />
                <div>
                  <p className="font-medium">Alto Contraste</p>
                  <p className="text-xs text-muted-foreground">Aumenta o contraste das cores</p>
                </div>
              </Label>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>
            
            {/* Movimento Reduzido */}
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion" className="flex items-center gap-2 cursor-pointer">
                <Pause className="w-4 h-4" />
                <div>
                  <p className="font-medium">Reduzir Animações</p>
                  <p className="text-xs text-muted-foreground">Desativa animações e transições</p>
                </div>
              </Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>
            
            {/* Cursor Maior */}
            <div className="flex items-center justify-between">
              <Label htmlFor="larger-cursor" className="flex items-center gap-2 cursor-pointer">
                <MousePointer2 className="w-4 h-4" />
                <div>
                  <p className="font-medium">Cursor Maior</p>
                  <p className="text-xs text-muted-foreground">Aumenta o tamanho do cursor</p>
                </div>
              </Label>
              <Switch
                id="larger-cursor"
                checked={settings.largerCursor}
                onCheckedChange={(checked) => updateSetting('largerCursor', checked)}
              />
            </div>
            
            <Separator />
            
            {/* Destacar Links */}
            <div className="flex items-center justify-between">
              <Label htmlFor="highlight-links" className="flex items-center gap-2 cursor-pointer">
                <Eye className="w-4 h-4" />
                <div>
                  <p className="font-medium">Destacar Links</p>
                  <p className="text-xs text-muted-foreground">Sublinha e destaca todos os links</p>
                </div>
              </Label>
              <Switch
                id="highlight-links"
                checked={settings.highlightLinks}
                onCheckedChange={(checked) => updateSetting('highlightLinks', checked)}
              />
            </div>
            
            {/* Espaçamento de Texto */}
            <div className="flex items-center justify-between">
              <Label htmlFor="text-spacing" className="flex items-center gap-2 cursor-pointer">
                <Type className="w-4 h-4" />
                <div>
                  <p className="font-medium">Espaçamento de Texto</p>
                  <p className="text-xs text-muted-foreground">Aumenta espaço entre letras e linhas</p>
                </div>
              </Label>
              <Switch
                id="text-spacing"
                checked={settings.textSpacing}
                onCheckedChange={(checked) => updateSetting('textSpacing', checked)}
              />
            </div>
            
            {/* Fonte para Dislexia */}
            <div className="flex items-center justify-between">
              <Label htmlFor="dyslexia-font" className="flex items-center gap-2 cursor-pointer">
                <Type className="w-4 h-4" />
                <div>
                  <p className="font-medium">Fonte para Dislexia</p>
                  <p className="text-xs text-muted-foreground">Usa fonte otimizada para leitura</p>
                </div>
              </Label>
              <Switch
                id="dyslexia-font"
                checked={settings.dyslexiaFont}
                onCheckedChange={(checked) => updateSetting('dyslexiaFont', checked)}
              />
            </div>
            
            <Separator />
            
            {/* Botão de Reset */}
            <Button
              variant="outline"
              className="w-full"
              onClick={resetSettings}
            >
              <Settings className="w-4 h-4 mr-2" />
              Restaurar Padrões
            </Button>
            
            {/* Informações WCAG */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Este site segue as diretrizes de acessibilidade <strong>WCAG 2.2 AA</strong>. 
                Se você encontrar alguma barreira de acessibilidade, entre em contato conosco.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* CSS para as configurações de acessibilidade */}
      <style>{`
        .high-contrast {
          filter: contrast(1.25);
        }
        
        .high-contrast * {
          border-color: currentColor !important;
        }
        
        .reduced-motion *,
        .reduced-motion *::before,
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        
        .larger-cursor,
        .larger-cursor * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23000' stroke='%23fff' stroke-width='1'%3E%3Cpath d='M4 4l16 8-8 2-2 8z'/%3E%3C/svg%3E") 0 0, auto !important;
        }
        
        .highlight-links a {
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
          text-underline-offset: 4px !important;
          background-color: rgba(255, 107, 53, 0.1) !important;
          padding: 2px 4px !important;
          border-radius: 2px !important;
        }
        
        .highlight-links a:focus {
          outline: 3px solid currentColor !important;
          outline-offset: 2px !important;
        }
        
        .text-spacing {
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
          line-height: 1.8 !important;
        }
        
        .text-spacing p,
        .text-spacing li,
        .text-spacing span {
          letter-spacing: inherit !important;
          word-spacing: inherit !important;
          line-height: inherit !important;
        }
        
        .dyslexia-font {
          font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important;
        }
        
        .dyslexia-font * {
          font-family: inherit !important;
        }
        
        .reading-guide {
          position: relative;
        }
        
        .reading-guide::after {
          content: '';
          position: fixed;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255, 107, 53, 0.1) 50%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 9999;
          top: 50%;
          transform: translateY(-50%);
        }
      `}</style>
    </>
  );
}

export default AccessibilityWidget;
