/**
 * Componente de Tour Guiado
 * Onboarding interativo para novos usuarios da plataforma IMPACT7
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Check, Sparkles, Calculator, FileText, MessageSquare, Settings, BarChart3 } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector do elemento alvo
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  icon: React.ReactNode;
  route?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao IMPACT7!',
    description: 'Vamos fazer um tour rapido pela plataforma para voce conhecer as principais funcionalidades. Este tour leva cerca de 2 minutos.',
    position: 'center',
    icon: <Sparkles className="h-8 w-8 text-primary" />,
  },
  {
    id: 'calculator',
    title: 'Calculadora S-ROI',
    description: 'Calcule o S-ROI honesto dos seus projetos: gatilhos e transformacoes, descontados por atribuicao, deadweight e drop-off.',
    position: 'bottom',
    target: '[data-tour="calculator"]',
    icon: <Calculator className="h-8 w-8 text-blue-500" />,
    route: '/calculadora',
  },
  {
    id: 'cases',
    title: 'Cases de Sucesso',
    description: 'Explore casos reais de organizacoes que transformaram seu impacto social usando o Metodo IMPACT7.',
    position: 'bottom',
    target: '[data-tour="cases"]',
    icon: <FileText className="h-8 w-8 text-green-500" />,
    route: '/cases',
  },
  {
    id: 'jarvis',
    title: 'Jarvis AI',
    description: 'Nosso assistente inteligente esta disponivel 24/7 para tirar duvidas sobre o Metodo IMPACT7 e ajudar com seus projetos.',
    position: 'left',
    target: '[data-jarvis-trigger]',
    icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
  },
  {
    id: 'dashboard',
    title: 'Seu Dashboard',
    description: 'Acompanhe suas metricas, calculos salvos e progresso na plataforma em um so lugar.',
    position: 'right',
    target: '[data-tour="dashboard"]',
    icon: <BarChart3 className="h-8 w-8 text-orange-500" />,
    route: '/dashboard',
  },
  {
    id: 'settings',
    title: 'Configuracoes',
    description: 'Personalize sua experiencia, gerencie notificacoes e configure preferencias de idioma.',
    position: 'left',
    target: '[data-tour="settings"]',
    icon: <Settings className="h-8 w-8 text-gray-500" />,
    route: '/configuracoes',
  },
  {
    id: 'complete',
    title: 'Tour Completo!',
    description: 'Voce esta pronto para comecar! Explore a plataforma e transforme seu impacto social. Se precisar de ajuda, o Jarvis esta sempre disponivel.',
    position: 'center',
    icon: <Check className="h-8 w-8 text-green-500" />,
  },
];

interface GuidedTourProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export function GuidedTour({ onComplete, autoStart = false }: GuidedTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();

  // Verificar se o tour ja foi completado
  useEffect(() => {
    const tourCompleted = localStorage.getItem('impact7-tour-completed');
    const tourDismissed = localStorage.getItem('impact7-tour-dismissed');
    
    if (autoStart && !tourCompleted && !tourDismissed) {
      // Delay para garantir que a pagina carregou
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = TOUR_STEPS[currentStep + 1];
      if (nextStep.route) {
        setLocation(nextStep.route);
      }
      setCurrentStep(prev => prev + 1);
    } else {
      // Tour completo
      localStorage.setItem('impact7-tour-completed', 'true');
      setIsActive(false);
      onComplete?.();
    }
  }, [currentStep, setLocation, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = TOUR_STEPS[currentStep - 1];
      if (prevStep.route) {
        setLocation(prevStep.route);
      }
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, setLocation]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('impact7-tour-dismissed', 'true');
    setIsActive(false);
  }, []);

  const handleRestart = useCallback(() => {
    localStorage.removeItem('impact7-tour-completed');
    localStorage.removeItem('impact7-tour-dismissed');
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  // Funcao publica para iniciar o tour
  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  // Expor funcao de inicio via window para acesso global
  useEffect(() => {
    (window as any).startGuidedTour = startTour;
    (window as any).restartGuidedTour = handleRestart;
    return () => {
      delete (window as any).startGuidedTour;
      delete (window as any).restartGuidedTour;
    };
  }, [startTour, handleRestart]);

  if (!isActive) {
    return null;
  }

  // Posicao do card baseada no step
  const getPositionClasses = () => {
    switch (step.position) {
      case 'center':
        return 'fixed inset-0 flex items-center justify-center';
      case 'top':
        return 'fixed top-20 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'fixed bottom-20 left-1/2 -translate-x-1/2';
      case 'left':
        return 'fixed top-1/2 left-20 -translate-y-1/2';
      case 'right':
        return 'fixed top-1/2 right-20 -translate-y-1/2';
      default:
        return 'fixed inset-0 flex items-center justify-center';
    }
  };

  return (
    <>
      {/* Overlay escuro */}
      <div 
        className="fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300"
        onClick={handleSkip}
      />
      
      {/* Card do tour */}
      <div className={`${getPositionClasses()} z-[101]`}>
        <Card className="w-full max-w-md mx-4 shadow-2xl border-2 border-primary/20 animate-in fade-in zoom-in duration-300">
          <CardHeader className="relative pb-2">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                {step.icon}
              </div>
              <div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <CardDescription className="text-sm">
                  Passo {currentStep + 1} de {TOUR_STEPS.length}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2">
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
            
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Pular tour
              </Button>
              
              <Button
                onClick={handleNext}
                className="gap-1"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>
                    Concluir
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Proximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

// Hook para controlar o tour programaticamente
export function useTour() {
  const startTour = useCallback(() => {
    (window as any).startGuidedTour?.();
  }, []);

  const restartTour = useCallback(() => {
    (window as any).restartGuidedTour?.();
  }, []);

  const isTourCompleted = useCallback(() => {
    return localStorage.getItem('impact7-tour-completed') === 'true';
  }, []);

  return { startTour, restartTour, isTourCompleted };
}

export default GuidedTour;
