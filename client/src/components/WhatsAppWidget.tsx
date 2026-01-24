import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "5511999999999";
const DEFAULT_MESSAGE = "Olá! Gostaria de saber mais sobre o Método IMPACT7.";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="whatsapp-widget">
      {isOpen && (
        <div className="mb-4 bg-card border border-border rounded-xl shadow-lg p-4 w-72 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">IMPACT7</p>
                <p className="text-xs text-muted-foreground">Online agora</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Olá! 👋 Como podemos ajudar você a maximizar seu impacto social?
          </p>
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Iniciar Conversa
          </Button>
        </div>
      )}
      
      <Button
        size="lg"
        className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}

export default WhatsAppWidget;
