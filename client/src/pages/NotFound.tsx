import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center px-4 max-w-lg mx-auto">
        {/* Large 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-black leading-none text-orange-500/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-black text-orange-500">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          A página que você está procurando não existe ou foi movida.
          <br />
          Verifique o endereço ou navegue de volta ao início.
        </p>

        <div
          id="not-found-button-group"
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button
            onClick={() => setLocation("/")}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Home className="w-4 h-4" />
            Página Inicial
          </Button>
          <Button
            onClick={() => setLocation("/busca")}
            variant="outline"
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
}
