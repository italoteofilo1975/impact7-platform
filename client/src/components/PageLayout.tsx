import { ReactNode } from "react";
import NavigationButtons from "./NavigationButtons";

interface PageLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  showHome?: boolean;
  backUrl?: string;
  homeUrl?: string;
  className?: string;
  navigationClassName?: string;
}

export default function PageLayout({
  children,
  showBack = true,
  showHome = true,
  backUrl,
  homeUrl = "/",
  className = "",
  navigationClassName = "",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de navegação no topo */}
      <div className={`bg-white border-b border-gray-200 px-4 py-3 ${navigationClassName}`}>
        <div className="max-w-7xl mx-auto">
          <NavigationButtons
            showBack={showBack}
            showHome={showHome}
            backUrl={backUrl}
            homeUrl={homeUrl}
          />
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className={`flex-1 ${className}`}>
        {children}
      </div>
    </div>
  );
}
