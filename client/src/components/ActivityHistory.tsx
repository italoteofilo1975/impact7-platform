/**
 * Componente de Histórico de Atividades
 * Exibe atividades recentes do usuário
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, MessageSquare, FileText, Star, Download, Clock } from "lucide-react";
import { Skeleton } from "@/components/LoadingSkeleton";

interface Activity {
  id: string;
  type: "calculation" | "chat" | "case_view" | "favorite" | "download";
  title: string;
  description: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export function ActivityHistory() {
  const [filter, setFilter] = useState<string>("all");
  
  // Buscar atividades do localStorage (persistência local)
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar atividades do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('impact7-activities');
      if (saved) {
        const parsed = JSON.parse(saved);
        setActivities(parsed.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        })));
      }
    } catch (e) {
      console.error('Erro ao carregar atividades:', e);
    }
    setIsLoading(false);
  }, []);
  
  const getIcon = (type: string) => {
    switch (type) {
      case "calculation": return <Calculator className="h-4 w-4 text-blue-500" />;
      case "chat": return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "case_view": return <FileText className="h-4 w-4 text-green-500" />;
      case "favorite": return <Star className="h-4 w-4 text-yellow-500" />;
      case "download": return <Download className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "calculation": return "Cálculo";
      case "chat": return "Chat";
      case "case_view": return "Visualização";
      case "favorite": return "Favorito";
      case "download": return "Download";
      default: return type;
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "agora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    return `${Math.floor(seconds / 86400)}d atrás`;
  };
  
  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(a => a.type === filter);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Seu histórico de interações</CardDescription>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5"
          >
            <option value="all">Todas</option>
            <option value="calculation">Cálculos</option>
            <option value="chat">Chats</option>
            <option value="case_view">Visualizações</option>
            <option value="favorite">Favoritos</option>
            <option value="download">Downloads</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma atividade encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-muted">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(activity.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimeAgo(new Date(activity.timestamp))}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
