/**
 * Jarvis Chat Component
 * Interface de chat flutuante para o assistente IA do IMPACT7
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageCircle,
  Calculator,
  BookOpen,
  Lightbulb,
  Loader2,
  Brain,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  skill?: string;
}

export default function JarvisChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const chatMutation = trpc.jarvis.chat.useMutation();
  const { data: suggestions } = trpc.jarvis.suggestions.useQuery();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }));

      const response = await chatMutation.mutateAsync({
        message: text,
        history
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        sources: response.sources,
        skill: response.skill
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("[Jarvis] Erro completo:", error);
      console.error("[Jarvis] Mensagem de erro:", error instanceof Error ? error.message : String(error));
      console.error("[Jarvis] Stack:", error instanceof Error ? error.stack : 'N/A');
      
      // Extrair mensagem de erro mais específica
      let errorMessage = "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes.";
      if (error instanceof Error) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMessage
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${isOpen ? 'scale-0' : 'scale-100'}`}
        aria-label="Abrir chat com Jarvis"
      >
        <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] sm:max-w-[calc(100vw-48px)] h-[85vh] sm:h-[600px] sm:max-h-[calc(100vh-100px)] bg-slate-900 sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Jarvis</h3>
              <p className="text-xs text-slate-400">Assistente IMPACT7</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/jarvis/memorias" onClick={() => setIsOpen(false)}>
              <button
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Ver memórias"
                title="Memórias do Jarvis"
              >
                <Brain className="w-5 h-5 text-slate-400 hover:text-orange-400" />
              </button>
            </Link>
            <Link href="/jarvis/relatorios" onClick={() => setIsOpen(false)}>
              <button
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Ver relatórios"
                title="Relatórios do Jarvis"
              >
                <FileText className="w-5 h-5 text-slate-400 hover:text-orange-400" />
              </button>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Olá! Sou o Jarvis
                </h4>
                <p className="text-sm text-slate-400">
                  Seu assistente especialista no Método IMPACT7.
                  Como posso ajudar?
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSuggestionClick("O que é o Método IMPACT7?")}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors group"
                >
                  <BookOpen className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-slate-300">Sobre o Método</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick("Como calcular o S-ROI do meu projeto?")}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors group"
                >
                  <Calculator className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-slate-300">Calcular S-ROI</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick("Quais são os 7 pilares do IMPACT7?")}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors group"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-slate-300">Os 7 Pilares</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick("Explique a equação I = (E × C⁷) / R")}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-slate-300">A Equação</span>
                </button>
              </div>

              {/* Suggestions */}
              {suggestions && suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2">Sugestões:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <Streamdown>{message.content}</Streamdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-500">Fontes:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {message.sources.map((source, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                      <span className="text-sm text-slate-400">Jarvis está pensando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Powered by IMPACT7 Knowledge Base
          </p>
        </form>
      </div>
    </>
  );
}
