/**
 * Jarvis Report Generation Service
 * 
 * Generates automated impact reports with executive summaries,
 * metrics consolidation, and export capabilities.
 */

import { getDb } from '../db';
import { jarvisReports, type JarvisReport, type InsertJarvisReport } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { invokeLLM } from '../_core/llm';

export type ReportType = 'impact' | 'executive_summary' | 'progress' | 'comparison' | 'forecast' | 'custom';

export interface ReportMetrics {
  totalInvestment: number;
  totalBeneficiaries: number;
  averageSroi: number;
  projectCount: number;
  impactScore: number;
  sectors: string[];
  sdgs: number[];
}

export interface ReportGenerationOptions {
  userId: number;
  title: string;
  reportType: ReportType;
  metrics?: ReportMetrics;
  customPrompt?: string;
  includeRecommendations?: boolean;
  language?: 'pt' | 'en' | 'es';
}

/**
 * Generate an impact report using AI
 */
export async function generateReport(options: ReportGenerationOptions): Promise<JarvisReport> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { userId, title, reportType, metrics, customPrompt, includeRecommendations = true, language = 'pt' } = options;

  // Create report entry with generating status
  const insertResult = await db.insert(jarvisReports).values({
    userId,
    title,
    reportType,
    content: '',
    status: 'generating',
  
          createdAt: Date.now(),
        });

  const reportId = Number(insertResult[0].insertId);

  try {
    // Build prompt based on report type
    const prompt = buildReportPrompt(reportType, metrics, customPrompt, includeRecommendations, language);

    // Generate report content using LLM
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(language),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : '';

    // Generate executive summary
    const summaryResponse = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em resumos executivos. Crie um resumo conciso de no máximo 200 palavras.`,
        },
        {
          role: 'user',
          content: `Resuma o seguinte relatório:\n\n${content}`,
        },
      ],
    });

    const rawSummary = summaryResponse.choices[0]?.message?.content;
    const summary = typeof rawSummary === 'string' ? rawSummary : '';

    // Update report with generated content
    await db
      .update(jarvisReports)
      .set({
        content,
        summary,
        metrics: metrics ? JSON.stringify(metrics) : null,
        status: 'completed',
        generatedAt: Date.now(),
      })
      .where(eq(jarvisReports.id, reportId));

    // Fetch and return the updated report
    const reports = await db
      .select()
      .from(jarvisReports)
      .where(eq(jarvisReports.id, reportId))
      .limit(1);

    return reports[0];
  } catch (error) {
    // Mark report as failed
    await db
      .update(jarvisReports)
      .set({
        status: 'failed',
        content: `Erro ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      })
      .where(eq(jarvisReports.id, reportId));

    throw error;
  }
}

/**
 * Get user's reports
 */
export async function getUserReports(
  userId: number,
  limit: number = 20
): Promise<JarvisReport[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(jarvisReports)
    .where(eq(jarvisReports.userId, userId))
    .orderBy(desc(jarvisReports.createdAt))
    .limit(limit);
}

/**
 * Get a specific report
 */
export async function getReport(
  userId: number,
  reportId: number
): Promise<JarvisReport | null> {
  const db = await getDb();
  if (!db) return null;

  const reports = await db
    .select()
    .from(jarvisReports)
    .where(
      and(
        eq(jarvisReports.id, reportId),
        eq(jarvisReports.userId, userId)
      )
    )
    .limit(1);

  return reports[0] || null;
}

/**
 * Delete a report
 */
export async function deleteReport(
  userId: number,
  reportId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .delete(jarvisReports)
    .where(
      and(
        eq(jarvisReports.id, reportId),
        eq(jarvisReports.userId, userId)
      )
    );

  return true;
}

/**
 * Build report prompt based on type
 */
function buildReportPrompt(
  reportType: ReportType,
  metrics?: ReportMetrics,
  customPrompt?: string,
  includeRecommendations: boolean = true,
  language: string = 'pt'
): string {
  const metricsSection = metrics
    ? `
## Métricas Disponíveis:
- Investimento Total: R$ ${metrics.totalInvestment.toLocaleString('pt-BR')}
- Beneficiários: ${metrics.totalBeneficiaries.toLocaleString('pt-BR')}
- S-ROI Médio: ${metrics.averageSroi}%
- Número de Projetos: ${metrics.projectCount}
- Score de Impacto: ${metrics.impactScore}
- Setores: ${metrics.sectors.join(', ')}
- ODS Relacionados: ${metrics.sdgs.join(', ')}
`
    : '';

  const recommendationsSection = includeRecommendations
    ? '\n\nInclua uma seção de recomendações estratégicas baseadas nos dados.'
    : '';

  switch (reportType) {
    case 'impact':
      return `Gere um relatório completo de impacto social com as seguintes seções:
1. Resumo Executivo
2. Visão Geral do Impacto
3. Análise de Métricas
4. Alinhamento com ODS
5. Análise Setorial
6. Conclusões
${metricsSection}${recommendationsSection}`;

    case 'executive_summary':
      return `Gere um resumo executivo conciso e impactante para stakeholders de alto nível.
O resumo deve destacar:
- Principais conquistas
- Métricas-chave de impacto
- ROI social
- Próximos passos recomendados
${metricsSection}`;

    case 'progress':
      return `Gere um relatório de progresso que mostre:
1. Status Atual do Projeto
2. Marcos Alcançados
3. Métricas de Desempenho
4. Desafios e Soluções
5. Próximas Etapas
${metricsSection}${recommendationsSection}`;

    case 'comparison':
      return `Gere um relatório comparativo que analise:
1. Comparação entre Projetos/Períodos
2. Análise de Benchmarks
3. Pontos Fortes e Fracos
4. Oportunidades de Melhoria
5. Melhores Práticas Identificadas
${metricsSection}${recommendationsSection}`;

    case 'forecast':
      return `Gere um relatório de projeção que inclua:
1. Análise de Tendências
2. Projeções de Impacto
3. Cenários (Otimista, Realista, Conservador)
4. Fatores de Risco
5. Recomendações Estratégicas
${metricsSection}`;

    case 'custom':
      return customPrompt || 'Gere um relatório personalizado de impacto social.';

    default:
      return `Gere um relatório de impacto social.${metricsSection}${recommendationsSection}`;
  }
}

/**
 * Get system prompt for report generation
 */
function getSystemPrompt(language: string): string {
  const prompts: Record<string, string> = {
    pt: `Você é um especialista em relatórios de impacto social do Método IMPACT7.
Gere relatórios profissionais, bem estruturados e baseados em dados.
Use a equação I = (E × C⁷) / R como referência para análises.
Formate o relatório em Markdown com seções claras, tabelas quando apropriado, e insights acionáveis.
Mantenha um tom profissional mas acessível.`,

    en: `You are a social impact reporting expert from the IMPACT7 Method.
Generate professional, well-structured, data-driven reports.
Use the equation I = (E × C⁷) / R as reference for analyses.
Format the report in Markdown with clear sections, tables when appropriate, and actionable insights.
Maintain a professional yet accessible tone.`,

    es: `Eres un experto en informes de impacto social del Método IMPACT7.
Genera informes profesionales, bien estructurados y basados en datos.
Usa la ecuación I = (E × C⁷) / R como referencia para análisis.
Formatea el informe en Markdown con secciones claras, tablas cuando sea apropiado, e insights accionables.
Mantén un tono profesional pero accesible.`,
  };

  return prompts[language] || prompts.pt;
}

export default {
  generateReport,
  getUserReports,
  getReport,
  deleteReport,
};
