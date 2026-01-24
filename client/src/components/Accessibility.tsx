/**
 * Accessibility Components
 * SET7.05 - Construção Performática
 * 
 * Componentes para melhorar acessibilidade WCAG 2.2 AA
 */

import React from 'react';

/**
 * Skip Link - Permite usuários de teclado pular para o conteúdo principal
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      tabIndex={0}
    >
      Pular para o conteúdo principal
    </a>
  );
}

/**
 * Visually Hidden - Esconde visualmente mas mantém acessível para screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

/**
 * Live Region - Anuncia mudanças para screen readers
 */
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive';
  atomic?: boolean;
}

export function LiveRegion({ 
  children, 
  politeness = 'polite',
  atomic = true 
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * Focus Trap - Mantém foco dentro de um elemento (útil para modais)
 */
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}

/**
 * Heading Level Context - Garante hierarquia correta de headings
 */
const HeadingLevelContext = React.createContext(1);

export function HeadingLevelProvider({ 
  children,
  level = 1 
}: { 
  children: React.ReactNode;
  level?: number;
}) {
  return (
    <HeadingLevelContext.Provider value={level}>
      {children}
    </HeadingLevelContext.Provider>
  );
}

export function useHeadingLevel() {
  return React.useContext(HeadingLevelContext);
}

/**
 * Semantic Heading - Renderiza heading com nível correto
 */
interface SemanticHeadingProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SemanticHeading({ children, className, id }: SemanticHeadingProps) {
  const level = useHeadingLevel();
  const headingLevel = Math.min(Math.max(level, 1), 6);
  
  const HeadingTag = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  }[headingLevel] as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  return React.createElement(HeadingTag, { className, id }, children);
}

/**
 * Accessible Icon Button - Botão de ícone com label acessível
 */
interface AccessibleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
}

export function AccessibleIconButton({ 
  icon, 
  label, 
  className,
  ...props 
}: AccessibleIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={className}
      {...props}
    >
      {icon}
      <VisuallyHidden>{label}</VisuallyHidden>
    </button>
  );
}

/**
 * Accessible Loading - Indicador de carregamento acessível
 */
interface AccessibleLoadingProps {
  message?: string;
}

export function AccessibleLoading({ message = 'Carregando...' }: AccessibleLoadingProps) {
  return (
    <div role="status" aria-busy="true" className="flex items-center gap-2">
      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
      <span className="sr-only">{message}</span>
    </div>
  );
}

/**
 * Accessible Error Message - Mensagem de erro acessível
 */
interface AccessibleErrorProps {
  id: string;
  message: string;
}

export function AccessibleError({ id, message }: AccessibleErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className="text-destructive text-sm mt-1"
    >
      {message}
    </p>
  );
}

/**
 * Hook para anunciar mensagens para screen readers
 */
export function useAnnounce() {
  const [message, setMessage] = React.useState('');

  const announce = React.useCallback((text: string, delay = 100) => {
    // Limpar e definir nova mensagem para garantir que seja anunciada
    setMessage('');
    setTimeout(() => setMessage(text), delay);
  }, []);

  const Announcer = React.useCallback(() => (
    <LiveRegion politeness="polite">
      {message}
    </LiveRegion>
  ), [message]);

  return { announce, Announcer };
}

/**
 * Hook para detectar preferência de movimento reduzido
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook para detectar preferência de alto contraste
 */
export function usePrefersHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersHighContrast;
}
