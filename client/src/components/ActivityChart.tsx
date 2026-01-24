/**
 * Componente de Gráfico de Atividade
 * Exibe gráfico de atividades dos últimos 7 dias com dados reais do banco
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/LoadingSkeleton";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ActivityChartProps {
  className?: string;
}

export function ActivityChart({ className }: ActivityChartProps) {
  const { data, isLoading, error } = trpc.leads.activityMetrics.useQuery();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Não foi possível carregar os dados de atividade.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { days, leads, downloads } = data;
  
  // Calcular máximo para escala do gráfico
  const maxValue = Math.max(...leads, ...downloads, 1);
  
  // Calcular tendência (comparar últimos 3 dias com 3 anteriores)
  const recentLeads = leads.slice(-3).reduce((a, b) => a + b, 0);
  const previousLeads = leads.slice(0, 4).reduce((a, b) => a + b, 0);
  const trend = recentLeads - previousLeads;
  
  // Totais
  const totalLeads = leads.reduce((a, b) => a + b, 0);
  const totalDownloads = downloads.reduce((a, b) => a + b, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {trend > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+{trend}</span>
              </>
            ) : trend < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-red-500">{trend}</span>
              </>
            ) : (
              <>
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">0</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Gráfico de barras */}
        <div className="h-48 flex items-end gap-2">
          {days.map((day, index) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              {/* Barras empilhadas */}
              <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '160px' }}>
                {/* Barra de leads */}
                <div 
                  className="w-full bg-primary rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ 
                    height: `${(leads[index] / maxValue) * 100}%`,
                    minHeight: leads[index] > 0 ? '4px' : '0'
                  }}
                  title={`Leads: ${leads[index]}`}
                />
                {/* Barra de downloads */}
                <div 
                  className="w-full bg-primary/40 rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ 
                    height: `${(downloads[index] / maxValue) * 100}%`,
                    minHeight: downloads[index] > 0 ? '4px' : '0'
                  }}
                  title={`Downloads: ${downloads[index]}`}
                />
              </div>
              {/* Label do dia */}
              <span className="text-xs text-muted-foreground truncate w-full text-center">
                {day}
              </span>
            </div>
          ))}
        </div>
        
        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-sm text-muted-foreground">Leads ({totalLeads})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/40" />
            <span className="text-sm text-muted-foreground">Downloads ({totalDownloads})</span>
          </div>
        </div>
        
        {/* Resumo */}
        {totalLeads === 0 && totalDownloads === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Nenhuma atividade registrada nos últimos 7 dias.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityChart;
