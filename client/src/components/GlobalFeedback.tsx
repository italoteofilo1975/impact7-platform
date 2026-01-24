/**
 * Componente de Feedback Visual Global
 * Fornece feedback consistente para todas as ações do usuário
 */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2, X } from "lucide-react";

type FeedbackType = "success" | "error" | "warning" | "info" | "loading";

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

interface FeedbackContextType {
  showFeedback: (feedback: Omit<FeedbackMessage, "id">) => string;
  hideFeedback: (id: string) => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  showLoading: (title: string) => string;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  
  const hideFeedback = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);
  
  const showFeedback = useCallback((feedback: Omit<FeedbackMessage, "id">) => {
    const id = `feedback_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newMessage: FeedbackMessage = {
      ...feedback,
      id,
      duration: feedback.duration ?? (feedback.type === "loading" ? 0 : 5000),
      dismissible: feedback.dismissible ?? true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (newMessage.duration && newMessage.duration > 0) {
      setTimeout(() => hideFeedback(id), newMessage.duration);
    }
    
    return id;
  }, [hideFeedback]);
  
  const showSuccess = useCallback((title: string, message?: string) => {
    return showFeedback({ type: "success", title, message });
  }, [showFeedback]);
  
  const showError = useCallback((title: string, message?: string) => {
    return showFeedback({ type: "error", title, message, duration: 8000 });
  }, [showFeedback]);
  
  const showWarning = useCallback((title: string, message?: string) => {
    return showFeedback({ type: "warning", title, message });
  }, [showFeedback]);
  
  const showInfo = useCallback((title: string, message?: string) => {
    return showFeedback({ type: "info", title, message });
  }, [showFeedback]);
  
  const showLoading = useCallback((title: string) => {
    return showFeedback({ type: "loading", title, dismissible: false });
  }, [showFeedback]);
  
  const getIcon = (type: FeedbackType) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error": return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info": return <Info className="h-5 w-5 text-blue-500" />;
      case "loading": return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    }
  };
  
  const getBgColor = (type: FeedbackType) => {
    switch (type) {
      case "success": return "bg-green-500/10 border-green-500/20";
      case "error": return "bg-red-500/10 border-red-500/20";
      case "warning": return "bg-yellow-500/10 border-yellow-500/20";
      case "info": return "bg-blue-500/10 border-blue-500/20";
      case "loading": return "bg-primary/10 border-primary/20";
    }
  };
  
  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback, showSuccess, showError, showWarning, showInfo, showLoading }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right ${getBgColor(msg.type)}`}
          >
            {getIcon(msg.type)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{msg.title}</p>
              {msg.message && (
                <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
              )}
            </div>
            {msg.dismissible && (
              <button
                onClick={() => hideFeedback(msg.id)}
                className="p-1 hover:bg-background/50 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}
