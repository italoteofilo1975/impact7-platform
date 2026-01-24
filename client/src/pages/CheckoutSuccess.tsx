import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";

export default function CheckoutSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session_id");

  useEffect(() => {
    // Trigger confetti animation on successful checkout
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />

      <section className="py-20">
        <div className="container max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>

              <h1 className="text-3xl font-bold mb-4">
                Pagamento Confirmado!
              </h1>

              <p className="text-xl text-muted-foreground mb-8">
                Bem-vindo ao IMPACT7 Pro! Sua assinatura foi ativada com sucesso.
              </p>

              <div className="bg-muted/50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-2 text-primary mb-4">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Recursos Desbloqueados</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ 10 projetos ativos</li>
                  <li>✓ Calculadora SROI completa</li>
                  <li>✓ Certificação digital</li>
                  <li>✓ Tokens de impacto</li>
                  <li>✓ Assistente Jarvis</li>
                  <li>✓ Relatórios avançados</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg">
                    Ir para o Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/calculadora">
                  <Button size="lg" variant="outline">
                    Começar a Calcular
                  </Button>
                </Link>
              </div>

              {sessionId && (
                <p className="text-xs text-muted-foreground mt-8">
                  ID da transação: {sessionId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
