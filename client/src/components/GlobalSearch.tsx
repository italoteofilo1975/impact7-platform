/**
 * Componente de Busca Global
 * Permite buscar em todo o conteúdo do site
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search, X, FileText, Calculator, Users, BookOpen, MessageSquare, Tag, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: string;
  type: "page" | "case" | "article" | "feature";
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  tags?: string[];
}

const staticContent: SearchResult[] = [
  { id: "home", type: "page", title: "Página Inicial", description: "Conheça o Método IMPACT7", url: "/", icon: <FileText className="h-4 w-4" /> },
  { id: "sobre", type: "page", title: "Sobre", description: "Nossa história e missão", url: "/sobre", icon: <Users className="h-4 w-4" /> },
  { id: "metodo", type: "page", title: "Método IMPACT7", description: "As 7 dimensões do impacto social", url: "/metodo", icon: <BookOpen className="h-4 w-4" /> },
  { id: "calculadora", type: "feature", title: "Calculadora S-ROI", description: "Calcule o retorno social do investimento", url: "/calculadora", icon: <Calculator className="h-4 w-4" /> },
  { id: "cases", type: "page", title: "Cases de Sucesso", description: "Histórias de impacto real", url: "/cases", icon: <FileText className="h-4 w-4" /> },
  { id: "jarvis", type: "feature", title: "Jarvis IA", description: "Assistente inteligente do IMPACT7", url: "/jarvis", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "whitepaper", type: "article", title: "Whitepaper", description: "Documentação técnica completa", url: "/whitepaper", icon: <BookOpen className="h-4 w-4" /> },
  { id: "contato", type: "page", title: "Contato", description: "Fale conosco", url: "/contato", icon: <Users className="h-4 w-4" /> },
  { id: "impacto", type: "page", title: "Dashboard de Impacto", description: "Métricas agregadas em tempo real", url: "/impacto", icon: <Calculator className="h-4 w-4" /> },
  { id: "api-docs", type: "article", title: "Documentação da API", description: "Referência completa da API REST", url: "/api/docs", icon: <BookOpen className="h-4 w-4" /> },
  { id: "api-status", type: "page", title: "Status da API", description: "Monitoramento em tempo real", url: "/api/status", icon: <FileText className="h-4 w-4" /> },
  { id: "profile", type: "page", title: "Meu Perfil", description: "Pontos, badges e conquistas", url: "/profile", icon: <Users className="h-4 w-4" /> },
  { id: "favorites", type: "page", title: "Favoritos", description: "Cases salvos", url: "/favorites", icon: <Tag className="h-4 w-4" /> },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  
  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);
  
  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = staticContent.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    
    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].url);
          setOpen(false);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };
  
  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    setOpen(false);
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "page": return "Página";
      case "case": return "Case";
      case "article": return "Artigo";
      case "feature": return "Funcionalidade";
      default: return type;
    }
  };
  
  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border rounded-lg hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded">
          <span>⌘</span>K
        </kbd>
      </button>
      
      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Busca Global</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar páginas, cases, funcionalidades..."
              className="border-0 focus-visible:ring-0 text-lg"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {query && results.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado encontrado para "{query}"</p>
              </div>
            )}
            
            {results.length > 0 && (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.title}</span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
            
            {!query && (
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">Sugestões</p>
                <div className="grid grid-cols-2 gap-2">
                  {staticContent.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-muted transition-colors"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t text-xs text-muted-foreground flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> para navegar</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Enter</kbd> para selecionar</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> para fechar</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
