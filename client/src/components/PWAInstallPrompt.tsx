/**
 * PWA Install Prompt Component
 * Exibe prompt inteligente para instalação do app
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime();
      const now = Date.now();
      const daysSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds on page
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error("[PWA] Install error:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString());
  };

  // Don't show if installed, dismissed, or no prompt available
  if (isInstalled || dismissed || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[380px] z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="relative p-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Instalar IMPACT7</h3>
              <p className="text-xs text-slate-400">Acesse mais rápido</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-slate-300 mb-4">
            Instale o app IMPACT7 para acesso rápido, notificações e uso offline.
          </p>

          {/* Benefits */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Check className="w-4 h-4 text-green-500" />
              <span>Acesso direto da tela inicial</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Check className="w-4 h-4 text-green-500" />
              <span>Funciona offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Check className="w-4 h-4 text-green-500" />
              <span>Notificações em tempo real</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
