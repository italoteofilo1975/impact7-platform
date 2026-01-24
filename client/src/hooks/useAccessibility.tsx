/**
 * Hook de Acessibilidade
 * Implementa atalhos de teclado e suporte a leitores de tela
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface AccessibilityOptions {
  enableKeyboardShortcuts?: boolean;
  announcePageChanges?: boolean;
  focusMainOnNavigation?: boolean;
}

const defaultOptions: AccessibilityOptions = {
  enableKeyboardShortcuts: true,
  announcePageChanges: true,
  focusMainOnNavigation: true,
};

// Mapeamento de atalhos de teclado
const KEYBOARD_SHORTCUTS = {
  // Navegação principal (Alt + tecla)
  'Alt+h': { path: '/', description: 'Ir para Home' },
  'Alt+c': { path: '/calculadora', description: 'Ir para Calculadora' },
  'Alt+s': { path: '/cases', description: 'Ir para Cases' },
  'Alt+p': { path: '/precos', description: 'Ir para Preços' },
  'Alt+a': { path: '/sobre', description: 'Ir para Sobre' },
  'Alt+j': { action: 'openJarvis', description: 'Abrir Jarvis AI' },
  'Alt+/': { action: 'showHelp', description: 'Mostrar atalhos' },
  
  // Acessibilidade (Alt + Shift + tecla)
  'Alt+Shift+m': { action: 'focusMain', description: 'Ir para conteúdo principal' },
  'Alt+Shift+n': { action: 'focusNav', description: 'Ir para navegação' },
  'Alt+Shift+f': { action: 'focusFooter', description: 'Ir para rodapé' },
  'Alt+Shift+s': { action: 'focusSearch', description: 'Ir para busca' },
};

export function useAccessibility(options: AccessibilityOptions = {}) {
  const [location, setLocation] = useLocation();
  const opts = { ...defaultOptions, ...options };

  // Anunciar mudanças de página para leitores de tela
  const announcePageChange = useCallback((title: string) => {
    const announcement = document.getElementById('a11y-announcer');
    if (announcement) {
      announcement.textContent = `Navegou para: ${title}`;
    }
  }, []);

  // Focar no conteúdo principal
  const focusMain = useCallback(() => {
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main instanceof HTMLElement) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.removeAttribute('tabindex');
    }
  }, []);

  // Focar na navegação
  const focusNav = useCallback(() => {
    const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (nav instanceof HTMLElement) {
      const firstLink = nav.querySelector('a, button');
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    }
  }, []);

  // Focar no rodapé
  const focusFooter = useCallback(() => {
    const footer = document.querySelector('footer') || document.querySelector('[role="contentinfo"]');
    if (footer instanceof HTMLElement) {
      const firstLink = footer.querySelector('a, button');
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    }
  }, []);

  // Focar na busca
  const focusSearch = useCallback(() => {
    const search = document.querySelector('input[type="search"]') || 
                   document.querySelector('[role="search"] input');
    if (search instanceof HTMLElement) {
      search.focus();
    }
  }, []);

  // Abrir Jarvis AI
  const openJarvis = useCallback(() => {
    const jarvisButton = document.querySelector('[data-jarvis-trigger]');
    if (jarvisButton instanceof HTMLElement) {
      jarvisButton.click();
    }
  }, []);

  // Mostrar ajuda de atalhos
  const showHelp = useCallback(() => {
    const helpDialog = document.getElementById('keyboard-shortcuts-dialog');
    if (helpDialog) {
      helpDialog.setAttribute('open', 'true');
    } else {
      // Criar e mostrar um toast com os atalhos
      const shortcuts = Object.entries(KEYBOARD_SHORTCUTS)
        .map(([key, value]) => `${key}: ${value.description}`)
        .join('\n');
      alert(`Atalhos de Teclado:\n\n${shortcuts}`);
    }
  }, []);

  // Handler de atalhos de teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar se estiver digitando em um input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable) {
      return;
    }

    // Construir a combinação de teclas
    const keys: string[] = [];
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    if (event.ctrlKey) keys.push('Ctrl');
    keys.push(event.key === ' ' ? 'Space' : event.key);
    const combo = keys.join('+');

    // Verificar se é um atalho conhecido
    const shortcut = KEYBOARD_SHORTCUTS[combo as keyof typeof KEYBOARD_SHORTCUTS];
    if (shortcut) {
      event.preventDefault();
      
      if ('path' in shortcut) {
        setLocation(shortcut.path);
      } else if ('action' in shortcut) {
        switch (shortcut.action) {
          case 'focusMain': focusMain(); break;
          case 'focusNav': focusNav(); break;
          case 'focusFooter': focusFooter(); break;
          case 'focusSearch': focusSearch(); break;
          case 'openJarvis': openJarvis(); break;
          case 'showHelp': showHelp(); break;
        }
      }
    }
  }, [setLocation, focusMain, focusNav, focusFooter, focusSearch, openJarvis, showHelp]);

  // Registrar event listeners
  useEffect(() => {
    if (opts.enableKeyboardShortcuts) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [opts.enableKeyboardShortcuts, handleKeyDown]);

  // Anunciar mudanças de página
  useEffect(() => {
    if (opts.announcePageChanges) {
      const title = document.title || location;
      announcePageChange(title);
    }

    if (opts.focusMainOnNavigation) {
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(focusMain, 100);
    }
  }, [location, opts.announcePageChanges, opts.focusMainOnNavigation, announcePageChange, focusMain]);

  return {
    focusMain,
    focusNav,
    focusFooter,
    focusSearch,
    openJarvis,
    showHelp,
    shortcuts: KEYBOARD_SHORTCUTS,
  };
}

// Componente de anuncio para leitores de tela
export function A11yAnnouncer() {
  return (
    <div
      id="a11y-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// Skip link para pular para o conteudo principal
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      Pular para o conteudo principal
    </a>
  );
}

export default useAccessibility;
