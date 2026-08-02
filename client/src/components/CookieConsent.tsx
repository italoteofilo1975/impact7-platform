import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "impact7_cookie_consent";

type ConsentValue = "accepted" | "rejected";

/**
 * Banner de consentimento de cookies (LGPD).
 * Exibe-se apenas quando o usuário ainda não registrou uma escolha.
 * A escolha é persistida em localStorage. Mantém-se minimalista e
 * acessível; não carrega scripts de terceiros por conta própria.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored !== "accepted" && stored !== "rejected") {
        setVisible(true);
      }
    } catch {
      // localStorage indisponível — mostra o banner por segurança
      setVisible(true);
    }
  }, []);

  const decide = (value: ConsentValue) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignora falha de persistência
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-[60] p-4"
    >
      <div className="mx-auto max-w-4xl rounded-lg border bg-background shadow-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-5 h-5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Usamos cookies para melhorar sua experiência, analisar o tráfego e
            personalizar conteúdo, em conformidade com a LGPD. Saiba mais na{" "}
            <a href="/privacidade" className="underline text-foreground hover:text-primary">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => decide("rejected")}>
            Rejeitar
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
