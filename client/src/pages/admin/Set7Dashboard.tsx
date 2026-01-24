/**
 * SET7 Dashboard - Painel de Administração SET7 V3.0
 * 
 * Visão geral de todos os módulos SET7:
 * - TASKLOG (Ledger de microatividades)
 * - Integration Identity (Hash/QR Code)
 * - TokensOps (Disciplina de tokens)
 * - Agentes (Arquitetura de agentes)
 * - Gates (Condições de avanço)
 * - ROI Tracking (Rastreamento de ROI)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Bot, 
  CheckCircle2, 
  Coins, 
  FileText, 
  Link2, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Download,
  Settings,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Componente de Card de Métrica
function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  trendValue,
  loading 
}: { 
  title: string; 
  value: string | number; 
  description?: string; 
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && trendValue && (
          <div className={`flex items-center text-xs mt-1 ${
            trend === "up" ? "text-green-500" : 
            trend === "down" ? "text-red-500" : 
            "text-muted-foreground"
          }`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : 
             trend === "down" ? <TrendingUp className="h-3 w-3 mr-1 rotate-180" /> : null}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Tab: TASKLOG
function TasklogTab() {
  const { data: metrics, isLoading: metricsLoading } = trpc.set7.tasklog.metrics.useQuery();
  const { data: tasks, isLoading: tasksLoading } = trpc.set7.tasklog.list.useQuery({ limit: 10 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Tasks"
          value={metrics?.totalTasks || 0}
          icon={Activity}
          loading={metricsLoading}
        />
        <MetricCard
          title="Tasks Completadas"
          value={metrics?.completedTasks || 0}
          description={`${metrics?.successRate?.toFixed(1) || 0}% taxa de sucesso`}
          icon={CheckCircle2}
          loading={metricsLoading}
        />
        <MetricCard
          title="Tokens Consumidos"
          value={metrics?.totalTokens?.toLocaleString() || 0}
          icon={Coins}
          loading={metricsLoading}
        />
        <MetricCard
          title="Custo Total (USD)"
          value={`$${metrics?.totalCostUsd?.toFixed(2) || "0.00"}`}
          icon={TrendingUp}
          loading={metricsLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks Recentes</CardTitle>
          <CardDescription>Últimas 10 tasks executadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <div 
                  key={task.taskId} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      task.status === "completed" ? "default" :
                      task.status === "failed" ? "destructive" :
                      task.status === "running" ? "secondary" :
                      "outline"
                    }>
                      {task.status}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{task.taskName}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.phase} • {task.agentName || task.agentId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p>{task.tokensTotal?.toLocaleString() || 0} tokens</p>
                    <p className="text-xs text-muted-foreground">
                      ${task.costUsd?.toFixed(4) || "0.0000"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma task registrada ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tab: Integrações
function IntegrationsTab() {
  const { data: stats, isLoading: statsLoading } = trpc.set7.integrations.stats.useQuery();
  const { data: integrations, isLoading: integrationsLoading } = trpc.set7.integrations.list.useQuery({});

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Integrações"
          value={stats?.total || 0}
          icon={Link2}
          loading={statsLoading}
        />
        <MetricCard
          title="Integrações Ativas"
          value={stats?.active || 0}
          icon={CheckCircle2}
          loading={statsLoading}
        />
        <MetricCard
          title="Verificadas"
          value={stats?.verified || 0}
          icon={Shield}
          loading={statsLoading}
        />
        <MetricCard
          title="Taxa de Sucesso"
          value={`${stats?.successRate || 0}%`}
          description={`${stats?.totalCalls?.toLocaleString() || 0} chamadas`}
          icon={TrendingUp}
          loading={statsLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integrações Registradas</CardTitle>
          <CardDescription>Todas as integrações com Identity Hash</CardDescription>
        </CardHeader>
        <CardContent>
          {integrationsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : integrations && integrations.length > 0 ? (
            <div className="space-y-2">
              {integrations.map((integration: any) => (
                <div 
                  key={integration.integrationId} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      integration.status === "active" ? "bg-green-100 text-green-600" :
                      integration.status === "deprecated" ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      <Link2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.integrationType} • v{integration.contractVersion}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground truncate max-w-xs">
                        {integration.identityHash?.substring(0, 16)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      integration.verificationStatus === "verified" ? "default" :
                      integration.verificationStatus === "failed" ? "destructive" :
                      "secondary"
                    }>
                      {integration.verificationStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma integração registrada ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tab: Tokens
function TokensTab() {
  const { data: stats, isLoading: statsLoading } = trpc.set7.tokens.stats.useQuery();
  const { data: budgets, isLoading: budgetsLoading } = trpc.set7.tokens.list.useQuery({});

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Budgets Ativos"
          value={stats?.activeBudgets || 0}
          icon={Coins}
          loading={statsLoading}
        />
        <MetricCard
          title="Tokens Totais"
          value={stats?.totalBudgetTokens?.toLocaleString() || 0}
          description={`${stats?.totalUsedTokens?.toLocaleString() || 0} utilizados`}
          icon={Activity}
          loading={statsLoading}
        />
        <MetricCard
          title="Uso Global"
          value={`${stats?.globalUsagePercentage || 0}%`}
          icon={TrendingUp}
          loading={statsLoading}
        />
        <MetricCard
          title="Em Alerta"
          value={(stats?.warningBudgets || 0) + (stats?.criticalBudgets || 0)}
          description={`${stats?.criticalBudgets || 0} críticos`}
          icon={AlertTriangle}
          loading={statsLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budgets de Tokens</CardTitle>
          <CardDescription>Controle de consumo por fase/projeto</CardDescription>
        </CardHeader>
        <CardContent>
          {budgetsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : budgets && budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((budget: any) => (
                <div 
                  key={budget.budgetId} 
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{budget.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {budget.scope} • {budget.phase || "Global"}
                      </p>
                    </div>
                    <Badge variant={
                      budget.status === "active" ? "default" :
                      budget.status === "warning" ? "secondary" :
                      budget.status === "critical" ? "destructive" :
                      "outline"
                    }>
                      {budget.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Tokens: {budget.usedTokens?.toLocaleString()} / {budget.budgetTokens?.toLocaleString()}</span>
                      <span>{budget.usagePercentage}%</span>
                    </div>
                    <Progress value={budget.usagePercentage} className={
                      budget.usagePercentage >= 90 ? "[&>div]:bg-red-500" :
                      budget.usagePercentage >= 70 ? "[&>div]:bg-yellow-500" :
                      ""
                    } />
                  </div>
                  {budget.circuitBreakerTriggered && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <XCircle className="h-4 w-4" />
                      Circuit Breaker Ativo
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum budget configurado ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tab: Agentes
function AgentsTab() {
  const { data: stats, isLoading: statsLoading } = trpc.set7.agents.stats.useQuery();
  const { data: agents, isLoading: agentsLoading } = trpc.set7.agents.list.useQuery({});
  const initAgents = trpc.set7.agents.initializeDefaults.useMutation();

  const handleInitialize = async () => {
    await initAgents.mutateAsync();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Agentes"
          value={stats?.totalAgents || 0}
          icon={Bot}
          loading={statsLoading}
        />
        <MetricCard
          title="Agentes Ativos"
          value={stats?.activeAgents || 0}
          icon={Play}
          loading={statsLoading}
        />
        <MetricCard
          title="Tasks Executadas"
          value={stats?.totalTasksExecuted?.toLocaleString() || 0}
          icon={Activity}
          loading={statsLoading}
        />
        <MetricCard
          title="Taxa de Sucesso"
          value={`${stats?.avgSuccessRate || 0}%`}
          icon={TrendingUp}
          loading={statsLoading}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Agentes SET7</CardTitle>
            <CardDescription>Agentes verticais e horizontais do sistema</CardDescription>
          </div>
          {(!agents || agents.length === 0) && (
            <Button onClick={handleInitialize} disabled={initAgents.isPending}>
              <Zap className="h-4 w-4 mr-2" />
              Inicializar Agentes
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : agents && agents.length > 0 ? (
            <div className="space-y-2">
              {agents.map((agent: any) => (
                <div 
                  key={agent.agentId} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      agent.status === "active" ? "bg-green-100 text-green-600" :
                      agent.status === "paused" ? "bg-yellow-100 text-yellow-600" :
                      agent.status === "killed" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.agentType} • {agent.phase || agent.hookType || "Global"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      agent.status === "active" ? "default" :
                      agent.status === "paused" ? "secondary" :
                      agent.status === "killed" ? "destructive" :
                      "outline"
                    }>
                      {agent.status}
                    </Badge>
                    {agent.killSwitchTriggered && (
                      <Badge variant="destructive">
                        Kill Switch
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum agente configurado. Clique em "Inicializar Agentes" para criar os agentes padrão.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tab: Gates
function GatesTab() {
  const { data: stats, isLoading: statsLoading } = trpc.set7.gates.stats.useQuery();
  const { data: gates, isLoading: gatesLoading } = trpc.set7.gates.list.useQuery({});
  const initGates = trpc.set7.gates.initializeProject.useMutation();

  const handleInitialize = async () => {
    await initGates.mutateAsync({ mode: "standard" });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Gates"
          value={stats?.totalGates || 0}
          icon={Shield}
          loading={statsLoading}
        />
        <MetricCard
          title="Gates Aprovados"
          value={stats?.passedGates || 0}
          icon={CheckCircle2}
          loading={statsLoading}
        />
        <MetricCard
          title="Pendentes"
          value={stats?.pendingGates || 0}
          icon={Activity}
          loading={statsLoading}
        />
        <MetricCard
          title="Progresso Geral"
          value={`${stats?.overallProgress || 0}%`}
          icon={TrendingUp}
          loading={statsLoading}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gates de Fase</CardTitle>
            <CardDescription>Condições de avanço entre fases SET7</CardDescription>
          </div>
          {(!gates || gates.length === 0) && (
            <Button onClick={handleInitialize} disabled={initGates.isPending}>
              <Zap className="h-4 w-4 mr-2" />
              Inicializar Gates
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {gatesLoading ? (
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : gates && gates.length > 0 ? (
            <div className="space-y-2">
              {gates.map((gate: any) => (
                <div 
                  key={gate.gateId} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      gate.status === "pass" ? "bg-green-100 text-green-600" :
                      gate.status === "fail" ? "bg-red-100 text-red-600" :
                      gate.status === "mitigation" ? "bg-yellow-100 text-yellow-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{gate.gateName}</p>
                      <p className="text-xs text-muted-foreground">
                        {gate.phase} • Modo: {gate.mode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      gate.status === "pass" ? "default" :
                      gate.status === "fail" ? "destructive" :
                      gate.status === "mitigation" ? "secondary" :
                      "outline"
                    }>
                      {gate.status}
                    </Badge>
                    {gate.humanApprovalRequired && (
                      <Badge variant="outline">
                        Aprovação Humana
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum gate configurado. Clique em "Inicializar Gates" para criar os gates padrão.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tab: ROI
function RoiTab() {
  const { data: summary, isLoading: summaryLoading } = trpc.set7.roi.stats.useQuery();
  const { data: rois, isLoading: roisLoading } = trpc.set7.roi.list.useQuery({});

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="ROI Médio"
          value={summary?.avgRoiPercentage ? `${summary.avgRoiPercentage.toFixed(1)}%` : "N/A"}
          icon={TrendingUp}
          loading={summaryLoading}
        />
        <MetricCard
          title="Valor Planejado"
          value={`$${summary?.totalPlannedValue?.toLocaleString() || 0}`}
          icon={Coins}
          loading={summaryLoading}
        />
        <MetricCard
          title="Custo Real"
          value={`$${summary?.totalActualCost?.toLocaleString() || 0}`}
          icon={Activity}
          loading={summaryLoading}
        />
        <MetricCard
          title="Registros"
          value={summary?.totalRois || 0}
          icon={FileText}
          loading={summaryLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de ROI</CardTitle>
          <CardDescription>Registros de ROI por fase (Baseline, Partial, Real, Final)</CardDescription>
        </CardHeader>
        <CardContent>
          {roisLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rois && rois.length > 0 ? (
            <div className="space-y-2">
              {rois.map((roi: any) => (
                <div 
                  key={roi.trackingId} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      roi.roiType === "final" ? "bg-green-100 text-green-600" :
                      roi.roiType === "real" ? "bg-blue-100 text-blue-600" :
                      roi.roiType === "partial" ? "bg-yellow-100 text-yellow-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">ROI {roi.roiType}</p>
                      <p className="text-xs text-muted-foreground">
                        {roi.phase || "Global"} • {roi.roiRatio || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{roi.roiPercentage}%</p>
                    <p className="text-xs text-muted-foreground">
                      ${roi.actualCostUsd?.toFixed(2) || "0.00"} / ${roi.plannedValueUsd?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum registro de ROI ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tab: Configuração
function ConfigTab() {
  const { data: config, isLoading: configLoading } = trpc.set7.config.getActive.useQuery();
  const initConfig = trpc.set7.config.initializeDefault.useMutation();

  const handleInitialize = async (mode: "mvp" | "standard" | "enterprise" | "regulated") => {
    await initConfig.mutateAsync({ mode });
  };

  return (
    <div className="space-y-6">
      {configLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : config ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Configuração Ativa</CardTitle>
              <CardDescription>Modo de execução e hooks habilitados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Modo</span>
                <Badge variant="default" className="text-lg px-4 py-1">
                  {config.mode?.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <TrendingUp className={`h-6 w-6 ${config.hookRoiEnabled ? "text-green-500" : "text-gray-300"}`} />
                  <span className="text-xs mt-1">Hook ROI</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Coins className={`h-6 w-6 ${config.hookTokensEnabled ? "text-green-500" : "text-gray-300"}`} />
                  <span className="text-xs mt-1">Hook Tokens</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <CheckCircle2 className={`h-6 w-6 ${config.hookQualityEnabled ? "text-green-500" : "text-gray-300"}`} />
                  <span className="text-xs mt-1">Hook Quality</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Shield className={`h-6 w-6 ${config.hookSecurityEnabled ? "text-green-500" : "text-gray-300"}`} />
                  <span className="text-xs mt-1">Hook Security</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Zap className={`h-6 w-6 ${config.hookGtlEnabled ? "text-green-500" : "text-gray-300"}`} />
                  <span className="text-xs mt-1">Hook GTL</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <span className="text-sm text-muted-foreground">Frequência dos Hooks</span>
                  <p className="font-medium">{config.hookFrequency}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Budget Padrão</span>
                  <p className="font-medium">{config.defaultTokenBudget?.toLocaleString()} tokens</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tipo GTL</span>
                  <p className="font-medium">{config.gtlType || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Model Routing</span>
                  <p className="font-medium">{config.modelRouting || "default"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil de Gates</CardTitle>
              <CardDescription>Configurações de rigor para gates de fase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Rigor</span>
                  <p className="font-medium">{config.gateProfile?.strictness || "standard"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Requer Evidência</span>
                  <p className="font-medium">{config.gateProfile?.requireEvidence ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Requer Aprovação</span>
                  <p className="font-medium">{config.gateProfile?.requireApproval ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Mitigação Permitida</span>
                  <p className="font-medium">{config.gateProfile?.mitigationAllowed ? "Sim" : "Não"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Inicializar Configuração</CardTitle>
            <CardDescription>Selecione o modo de execução para inicializar o SET7</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col"
                onClick={() => handleInitialize("mvp")}
                disabled={initConfig.isPending}
              >
                <Zap className="h-6 w-6 mb-2" />
                <span>MVP</span>
                <span className="text-xs text-muted-foreground">Rápido e simples</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col"
                onClick={() => handleInitialize("standard")}
                disabled={initConfig.isPending}
              >
                <Settings className="h-6 w-6 mb-2" />
                <span>Standard</span>
                <span className="text-xs text-muted-foreground">Balanceado</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col"
                onClick={() => handleInitialize("enterprise")}
                disabled={initConfig.isPending}
              >
                <Shield className="h-6 w-6 mb-2" />
                <span>Enterprise</span>
                <span className="text-xs text-muted-foreground">Completo</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col"
                onClick={() => handleInitialize("regulated")}
                disabled={initConfig.isPending}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span>Regulated</span>
                <span className="text-xs text-muted-foreground">Auditável</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente Principal
export default function Set7Dashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("tasklog");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SET7 Dashboard</h1>
        <p className="text-muted-foreground">
          Painel de controle do Método SET7 V3.0 - Gestão de Tasks, Integrações, Tokens, Agentes, Gates e ROI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="tasklog" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">TASKLOG</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden md:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden md:inline">Tokens</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden md:inline">Agentes</span>
          </TabsTrigger>
          <TabsTrigger value="gates" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Gates</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasklog">
          <TasklogTab />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="tokens">
          <TokensTab />
        </TabsContent>
        <TabsContent value="agents">
          <AgentsTab />
        </TabsContent>
        <TabsContent value="gates">
          <GatesTab />
        </TabsContent>
        <TabsContent value="roi">
          <RoiTab />
        </TabsContent>
        <TabsContent value="config">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
