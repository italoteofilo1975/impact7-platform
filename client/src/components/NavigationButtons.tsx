import { ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";

interface NavigationButtonsProps {
  showBack?: boolean;
  showHome?: boolean;
  backUrl?: string;
  homeUrl?: string;
  className?: string;
}

export default function NavigationButtons({
  showBack = true,
  showHome = true,
  backUrl,
  homeUrl = "/",
  className = "",
}: NavigationButtonsProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (backUrl) {
      setLocation(backUrl);
    } else {
      window.history.back();
    }
  };

  const handleHome = () => {
    setLocation(homeUrl);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showBack && (
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      )}
      
      {showHome && (
        <button
          onClick={handleHome}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          aria-label="Ir para o Site Principal"
        >
          <Home className="w-4 h-4" />
          Site Principal
        </button>
      )}
    </div>
  );
}
