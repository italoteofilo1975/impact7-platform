/**
 * Página de Conformidade SET7
 * Checklist interativo das 7 partes do método com auto-avaliação
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, Circle, Download, FileText, 
  Target, Layers, Link2, Shield, Wrench, 
  Eye, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

interface SET7Part {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: ChecklistItem[];
}

const SET7_PARTS: SET7Part[] = [
  {
    id: 0,
    code: 'SET7.START',
    title: 'Fundamentos e Protocolo de Entrada',
    description: 'Declaração de objetivo, intenção e contexto inicial do projeto.',
    icon: <Target className="h-5 w-5" />,
    color: 'bg-violet-500',
    items: [
      { id: 'p0-1', label: 'Objetivo declarado', description: 'Definição clara do objetivo principal do projeto', required: true },
      { id: 'p0-2', label: 'Intenção formalizada', description: 'Declaração de intenção estratégica', required: true },
      { id: 'p0-3', label: 'Interesse identificado', description: 'Stakeholders e interesses mapeados', required: true },
      { id: 'p0-4', label: 'Contexto amplo definido', description: 'Contexto de negócio, tecnológico, regulatório', required: true },
      { id: 'p0-5', label: 'Bases de conhecimento listadas', description: 'Documentação de referência identificada', required: false },
      { id: 'p0-6', label: 'Restrições iniciais', description: 'Orçamento, prazo, recursos definidos', required: true },
      { id: 'p0-7', label: 'ROI baseline estabelecido', description: 'Métricas de retorno esperado', required: false },
    ],
  },
  {
    id: 1,
    code: 'SET7.01',
    title: 'Direção Estratégica e Escopo',
    description: 'Formalização da direção estratégica, escopo governado e matriz de intenção.',
    icon: <Target className="h-5 w-5" />,
    color: 'bg-blue-500',
    items: [
      { id: 'p1-1', label: 'Direção estratégica formalizada', description: 'Visão e missão do projeto documentadas', required: true },
      { id: 'p1-2', label: 'Escopo incluído definido', description: 'O que está dentro do escopo', required: true },
      { id: 'p1-3', label: 'Escopo excluído definido', description: 'O que está fora do escopo', required: true },
      { id: 'p1-4', label: 'Limites estabelecidos', description: 'Fronteiras do projeto', required: true },
      { id: 'p1-5', label: 'Matriz de intenção', description: 'NFRs e qualidades esperadas', required: true },
      { id: 'p1-6', label: 'Critérios de sucesso', description: 'KPIs e métricas de sucesso', required: true },
      { id: 'p1-7', label: 'Critérios de fracasso', description: 'Condições de falha identificadas', required: false },
    ],
  },
  {
    id: 2,
    code: 'SET7.02',
    title: 'Domínio e Arquitetura',
    description: 'Mapeamento de domínios, bounded contexts e arquitetura base.',
    icon: <Layers className="h-5 w-5" />,
    color: 'bg-green-500',
    items: [
      { id: 'p2-1', label: 'Domínios Core mapeados', description: 'Domínios principais do negócio', required: true },
      { id: 'p2-2', label: 'Domínios de Suporte', description: 'Domínios auxiliares identificados', required: true },
      { id: 'p2-3', label: 'Domínios Genéricos', description: 'Componentes reutilizáveis', required: false },
      { id: 'p2-4', label: 'Bounded Contexts definidos', description: 'Limites de contexto estabelecidos', required: true },
      { id: 'p2-5', label: 'Arquitetura base', description: 'Padrão arquitetural escolhido', required: true },
      { id: 'p2-6', label: 'Ownership por domínio', description: 'Responsáveis por cada área', required: true },
      { id: 'p2-7', label: 'ADRs registrados', description: 'Decisões arquiteturais documentadas', required: true },
    ],
  },
  {
    id: 3,
    code: 'SET7.03',
    title: 'Contratos e Integrações',
    description: 'Formalização de contratos, APIs e rastreabilidade.',
    icon: <Link2 className="h-5 w-5" />,
    color: 'bg-yellow-500',
    items: [
      { id: 'p3-1', label: 'Contratos de domínio', description: 'Interfaces entre domínios definidas', required: true },
      { id: 'p3-2', label: 'APIs documentadas', description: 'Documentação OpenAPI/Swagger', required: true },
      { id: 'p3-3', label: 'Versionamento de API', description: 'Estratégia de versões', required: true },
      { id: 'p3-4', label: 'Hash/QR Code rastreabilidade', description: 'Identificadores únicos implementados', required: false },
      { id: 'p3-5', label: 'Integrações mapeadas', description: 'Sistemas externos identificados', required: true },
      { id: 'p3-6', label: 'Webhooks configurados', description: 'Eventos de integração', required: false },
      { id: 'p3-7', label: 'SDK disponível', description: 'Kit de desenvolvimento para integradores', required: false },
    ],
  },
  {
    id: 4,
    code: 'SET7.04',
    title: 'Segurança e Governança',
    description: 'Implementação de Zero Trust, governança e conformidade.',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-red-500',
    items: [
      { id: 'p4-1', label: 'Zero Trust implementado', description: 'Arquitetura de confiança zero', required: true },
      { id: 'p4-2', label: 'Autenticação robusta', description: 'MFA/2FA implementado', required: true },
      { id: 'p4-3', label: 'Autorização granular', description: 'RBAC/ABAC configurado', required: true },
      { id: 'p4-4', label: 'Criptografia de dados', description: 'Dados em repouso e trânsito', required: true },
      { id: 'p4-5', label: 'Auditoria implementada', description: 'Logs de auditoria imutáveis', required: true },
      { id: 'p4-6', label: 'LGPD/GDPR compliance', description: 'Conformidade com privacidade', required: true },
      { id: 'p4-7', label: 'Modelo de ameaças', description: 'STRIDE/DREAD documentado', required: false },
    ],
  },
  {
    id: 5,
    code: 'SET7.05',
    title: 'Construção Performática',
    description: 'Validação de código, UX/Acessibilidade e performance.',
    icon: <Wrench className="h-5 w-5" />,
    color: 'bg-orange-500',
    items: [
      { id: 'p5-1', label: 'Código aderente aos contratos', description: 'Implementação conforme especificação', required: true },
      { id: 'p5-2', label: 'Testes unitários', description: 'Cobertura mínima de 80%', required: true },
      { id: 'p5-3', label: 'Testes de integração', description: 'Fluxos críticos testados', required: true },
      { id: 'p5-4', label: 'UX validada', description: 'Usabilidade testada', required: true },
      { id: 'p5-5', label: 'Acessibilidade WCAG', description: 'Conformidade com WCAG 2.1', required: true },
      { id: 'p5-6', label: 'Performance otimizada', description: 'Core Web Vitals adequados', required: true },
      { id: 'p5-7', label: 'Mobile responsivo', description: 'Layout adaptativo', required: true },
    ],
  },
  {
    id: 6,
    code: 'SET7.06',
    title: 'Operação e Observabilidade',
    description: 'Monitoramento, SLOs, alertas e controle de custos.',
    icon: <Eye className="h-5 w-5" />,
    color: 'bg-cyan-500',
    items: [
      { id: 'p6-1', label: 'Observabilidade completa', description: 'Logs, métricas, traces', required: true },
      { id: 'p6-2', label: 'SLOs definidos', description: 'Objetivos de nível de serviço', required: true },
      { id: 'p6-3', label: 'Alertas configurados', description: 'Notificações proativas', required: true },
      { id: 'p6-4', label: 'Dashboards operacionais', description: 'Visibilidade em tempo real', required: true },
      { id: 'p6-5', label: 'Controle de custos', description: 'Monitoramento de gastos', required: false },
      { id: 'p6-6', label: 'Runbooks documentados', description: 'Procedimentos operacionais', required: true },
      { id: 'p6-7', label: 'Health checks', description: 'Verificações de saúde automatizadas', required: true },
    ],
  },
  {
    id: 7,
    code: 'SET7.07',
    title: 'Resiliência e Evolução',
    description: 'Planos de resiliência, continuidade, DR e evolução.',
    icon: <RefreshCw className="h-5 w-5" />,
    color: 'bg-purple-500',
    items: [
      { id: 'p7-1', label: 'Plano de resiliência', description: 'Estratégia de recuperação', required: true },
      { id: 'p7-2', label: 'BCP documentado', description: 'Plano de continuidade de negócios', required: true },
      { id: 'p7-3', label: 'DR testado', description: 'Disaster recovery validado', required: true },
      { id: 'p7-4', label: 'Backup automatizado', description: 'Backups regulares configurados', required: true },
      { id: 'p7-5', label: 'ROI final validado', description: 'Retorno sobre investimento calculado', required: false },
      { id: 'p7-6', label: 'Go-To-Live aprovado', description: 'Checklist de lançamento completo', required: true },
      { id: 'p7-7', label: 'Plano de evolução', description: 'Roadmap de melhorias', required: false },
    ],
  },
];

export default function Conformidade() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedParts, setExpandedParts] = useState<Record<number, boolean>>({});
  

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('set7-conformidade');
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('set7-conformidade', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const togglePart = (partId: number) => {
    setExpandedParts(prev => ({
      ...prev,
      [partId]: !prev[partId],
    }));
  };

  const calculatePartProgress = (part: SET7Part) => {
    const total = part.items.length;
    const checked = part.items.filter(item => checkedItems[item.id]).length;
    return { checked, total, percentage: Math.round((checked / total) * 100) };
  };

  const calculateTotalProgress = () => {
    const allItems = SET7_PARTS.flatMap(p => p.items);
    const total = allItems.length;
    const checked = allItems.filter(item => checkedItems[item.id]).length;
    return { checked, total, percentage: Math.round((checked / total) * 100) };
  };

  const calculateRequiredProgress = () => {
    const requiredItems = SET7_PARTS.flatMap(p => p.items.filter(i => i.required));
    const total = requiredItems.length;
    const checked = requiredItems.filter(item => checkedItems[item.id]).length;
    return { checked, total, percentage: Math.round((checked / total) * 100) };
  };

  const exportReport = () => {
    const totalProgress = calculateTotalProgress();
    const requiredProgress = calculateRequiredProgress();
    
    let report = `# Relatório de Conformidade SET7\n\n`;
    report += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    report += `## Resumo\n\n`;
    report += `- **Progresso Total:** ${totalProgress.checked}/${totalProgress.total} (${totalProgress.percentage}%)\n`;
    report += `- **Itens Obrigatórios:** ${requiredProgress.checked}/${requiredProgress.total} (${requiredProgress.percentage}%)\n\n`;
    
    SET7_PARTS.forEach(part => {
      const progress = calculatePartProgress(part);
      report += `## ${part.code} - ${part.title}\n\n`;
      report += `Progresso: ${progress.checked}/${progress.total} (${progress.percentage}%)\n\n`;
      
      part.items.forEach(item => {
        const status = checkedItems[item.id] ? '✅' : '⬜';
        const required = item.required ? '(Obrigatório)' : '(Opcional)';
        report += `- ${status} ${item.label} ${required}\n`;
      });
      report += '\n';
    });
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conformidade-set7-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado!', { description: 'O arquivo foi baixado com sucesso.' });
  };

  const totalProgress = calculateTotalProgress();
  const requiredProgress = calculateRequiredProgress();

  return (
    <>
      <SEO
        title="Conformidade SET7"
        description="Checklist interativo de conformidade com o método SET7 para projetos de impacto social."
        keywords="SET7, conformidade, checklist, metodologia, impacto social"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Conformidade SET7</h1>
            <p className="text-muted-foreground text-lg">
              Avalie a conformidade do seu projeto com as 7 partes do método SET7.
            </p>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Progresso Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalProgress.percentage}%</div>
                <Progress value={totalProgress.percentage} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {totalProgress.checked} de {totalProgress.total} itens
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Itens Obrigatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{requiredProgress.percentage}%</div>
                <Progress value={requiredProgress.percentage} className="mt-2 [&>div]:bg-red-500" />
                <p className="text-sm text-muted-foreground mt-1">
                  {requiredProgress.checked} de {requiredProgress.total} obrigatórios
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {requiredProgress.percentage === 100 ? (
                    <span className="text-green-500">Aprovado</span>
                  ) : requiredProgress.percentage >= 80 ? (
                    <span className="text-yellow-500">Quase lá</span>
                  ) : (
                    <span className="text-red-500">Em progresso</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {requiredProgress.percentage === 100 
                    ? 'Todos os itens obrigatórios completos!'
                    : `Faltam ${requiredProgress.total - requiredProgress.checked} itens obrigatórios`
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Export Button */}
          <div className="flex justify-end mb-4">
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>

          {/* Checklist by Parts */}
          <div className="space-y-4">
            {SET7_PARTS.map(part => {
              const progress = calculatePartProgress(part);
              const isExpanded = expandedParts[part.id] ?? true;
              
              return (
                <Card key={part.id}>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => togglePart(part.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${part.color} text-white`}>
                          {part.icon}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {part.code}
                            <Badge variant={progress.percentage === 100 ? 'default' : 'secondary'}>
                              {progress.percentage}%
                            </Badge>
                          </CardTitle>
                          <CardDescription>{part.title}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {progress.checked}/{progress.total}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <Progress value={progress.percentage} className="mt-2" />
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{part.description}</p>
                      <div className="space-y-3">
                        {part.items.map(item => (
                          <div 
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={item.id}
                              checked={checkedItems[item.id] || false}
                              onCheckedChange={() => toggleItem(item.id)}
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={item.id}
                                className="font-medium cursor-pointer flex items-center gap-2"
                              >
                                {item.label}
                                {item.required && (
                                  <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                                )}
                              </label>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            {checkedItems[item.id] ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
