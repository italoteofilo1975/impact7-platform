/**
 * Serviço de Geração de Relatório Consolidado de Cases
 * Gera PDF com múltiplos cases, sumário executivo e métricas agregadas
 */

export interface CaseForReport {
  id: number;
  title: string;
  organization: string;
  location: string;
  region: string;
  sector: string;
  investment: string;
  investmentValue: number;
  beneficiaries: string;
  beneficiariesValue: number;
  duration: string;
  sRoi: string;
  sRoiValue: number;
  year: number;
  metrics: Array<{ label: string; value: string }>;
  sdgs: string[];
}

export interface ReportFilters {
  sectors?: string[];
  regions?: string[];
  years?: number[];
  minSRoi?: number;
  maxSRoi?: number;
}

export interface ConsolidatedReportData {
  title: string;
  generatedAt: Date;
  filters: ReportFilters;
  cases: CaseForReport[];
  summary: {
    totalCases: number;
    totalInvestment: number;
    totalBeneficiaries: number;
    avgSRoi: number;
    maxSRoi: number;
    minSRoi: number;
    costPerBeneficiary: number;
    sectorDistribution: Record<string, number>;
    regionDistribution: Record<string, number>;
    odsDistribution: Record<string, number>;
  };
}

function calculateSummary(cases: CaseForReport[]): ConsolidatedReportData['summary'] {
  const totalInvestment = cases.reduce((sum, c) => sum + c.investmentValue, 0);
  const totalBeneficiaries = cases.reduce((sum, c) => sum + c.beneficiariesValue, 0);
  const sRoiValues = cases.map(c => c.sRoiValue);
  
  const sectorDistribution: Record<string, number> = {};
  const regionDistribution: Record<string, number> = {};
  const odsDistribution: Record<string, number> = {};
  
  cases.forEach(c => {
    sectorDistribution[c.sector] = (sectorDistribution[c.sector] || 0) + 1;
    regionDistribution[c.region] = (regionDistribution[c.region] || 0) + 1;
    c.sdgs.forEach(ods => {
      odsDistribution[ods] = (odsDistribution[ods] || 0) + 1;
    });
  });
  
  return {
    totalCases: cases.length,
    totalInvestment,
    totalBeneficiaries,
    avgSRoi: sRoiValues.reduce((a, b) => a + b, 0) / sRoiValues.length,
    maxSRoi: Math.max(...sRoiValues),
    minSRoi: Math.min(...sRoiValues),
    costPerBeneficiary: totalBeneficiaries > 0 ? totalInvestment / totalBeneficiaries : 0,
    sectorDistribution,
    regionDistribution,
    odsDistribution,
  };
}

const odsLabels: Record<string, string> = {
  "1": "Erradicação da Pobreza",
  "2": "Fome Zero",
  "3": "Saúde e Bem-Estar",
  "4": "Educação de Qualidade",
  "5": "Igualdade de Gênero",
  "6": "Água Potável e Saneamento",
  "7": "Energia Limpa",
  "8": "Trabalho Decente",
  "9": "Indústria e Inovação",
  "10": "Redução das Desigualdades",
  "11": "Cidades Sustentáveis",
  "12": "Consumo Responsável",
  "13": "Ação Climática",
  "14": "Vida na Água",
  "15": "Vida Terrestre",
  "16": "Paz e Justiça",
  "17": "Parcerias",
};

export function generateConsolidatedReportHTML(data: ConsolidatedReportData): string {
  const { title, generatedAt, filters, cases, summary } = data;
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };
  
  const formatNumber = (value: number) => value.toLocaleString('pt-BR');
  
  const activeFilters = [];
  if (filters.sectors?.length) activeFilters.push(`Setores: ${filters.sectors.join(', ')}`);
  if (filters.regions?.length) activeFilters.push(`Regiões: ${filters.regions.join(', ')}`);
  if (filters.years?.length) activeFilters.push(`Anos: ${filters.years.join(', ')}`);
  if (filters.minSRoi) activeFilters.push(`S-ROI mínimo: ${filters.minSRoi}x`);
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #1a1a2e;
      background: #fff;
    }
    .container { max-width: 1000px; margin: 0 auto; padding: 40px; }
    
    /* Cover Page */
    .cover { 
      min-height: 100vh; 
      display: flex; 
      flex-direction: column; 
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      text-align: center;
      padding: 60px;
      page-break-after: always;
    }
    .cover h1 { font-size: 3rem; margin-bottom: 20px; }
    .cover .subtitle { font-size: 1.5rem; opacity: 0.8; margin-bottom: 40px; }
    .cover .meta { font-size: 1rem; opacity: 0.6; }
    .cover .logo { font-size: 2rem; font-weight: bold; margin-bottom: 60px; color: #f97316; }
    
    /* Summary Section */
    .summary { 
      background: #f8fafc; 
      padding: 40px; 
      border-radius: 12px; 
      margin-bottom: 40px;
      page-break-after: always;
    }
    .summary h2 { 
      color: #1a1a2e; 
      border-bottom: 3px solid #f97316; 
      padding-bottom: 10px; 
      margin-bottom: 30px;
    }
    .metrics-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 20px; 
      margin-bottom: 30px;
    }
    .metric-card { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .metric-value { font-size: 2rem; font-weight: bold; color: #f97316; }
    .metric-label { font-size: 0.875rem; color: #64748b; margin-top: 5px; }
    
    /* Distribution Charts */
    .distribution { margin-top: 30px; }
    .distribution h3 { margin-bottom: 15px; color: #334155; }
    .bar-chart { margin-bottom: 20px; }
    .bar-item { 
      display: flex; 
      align-items: center; 
      margin-bottom: 8px;
    }
    .bar-label { width: 150px; font-size: 0.875rem; }
    .bar-container { flex: 1; height: 24px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: #f97316; border-radius: 4px; }
    .bar-value { width: 50px; text-align: right; font-size: 0.875rem; font-weight: 600; }
    
    /* Cases List */
    .cases-section { page-break-before: always; }
    .cases-section h2 { 
      color: #1a1a2e; 
      border-bottom: 3px solid #f97316; 
      padding-bottom: 10px; 
      margin-bottom: 30px;
    }
    .case-card { 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      padding: 24px; 
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .case-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .case-title { font-size: 1.25rem; font-weight: 600; color: #1a1a2e; }
    .case-org { font-size: 0.875rem; color: #64748b; }
    .case-sroi { 
      background: #f97316; 
      color: white; 
      padding: 8px 16px; 
      border-radius: 20px; 
      font-weight: 600;
    }
    .case-badges { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .badge { 
      padding: 4px 12px; 
      border-radius: 20px; 
      font-size: 0.75rem; 
      background: #f1f5f9;
      color: #475569;
    }
    .case-metrics { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 16px; 
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .case-metric { text-align: center; }
    .case-metric-value { font-size: 1.125rem; font-weight: 600; color: #1a1a2e; }
    .case-metric-label { font-size: 0.75rem; color: #64748b; }
    
    /* Footer */
    .footer { 
      text-align: center; 
      padding: 40px; 
      color: #64748b; 
      font-size: 0.875rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 40px;
    }
    
    /* Print styles */
    @media print {
      .container { padding: 20px; }
      .case-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <div class="logo">IMPACT7</div>
    <h1>${title}</h1>
    <p class="subtitle">Relatório Consolidado de Cases de Impacto Social</p>
    <p class="meta">
      Gerado em ${generatedAt.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })}<br>
      ${summary.totalCases} cases analisados
    </p>
    ${activeFilters.length > 0 ? `
    <p class="meta" style="margin-top: 20px;">
      Filtros aplicados: ${activeFilters.join(' | ')}
    </p>
    ` : ''}
  </div>
  
  <div class="container">
    <!-- Executive Summary -->
    <section class="summary">
      <h2>Sumário Executivo</h2>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${summary.totalCases}</div>
          <div class="metric-label">Cases Analisados</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(summary.totalInvestment)}</div>
          <div class="metric-label">Investimento Total</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatNumber(summary.totalBeneficiaries)}</div>
          <div class="metric-label">Beneficiários Totais</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${summary.avgSRoi.toFixed(1)}x</div>
          <div class="metric-label">S-ROI Médio</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${summary.maxSRoi.toFixed(1)}x</div>
          <div class="metric-label">Maior S-ROI</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${formatCurrency(summary.costPerBeneficiary)}</div>
          <div class="metric-label">Custo por Beneficiário</div>
        </div>
      </div>
      
      <div class="distribution">
        <h3>Distribuição por Setor</h3>
        <div class="bar-chart">
          ${Object.entries(summary.sectorDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([sector, count]) => {
              const percentage = (count / summary.totalCases) * 100;
              return `
              <div class="bar-item">
                <span class="bar-label">${sector}</span>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="bar-value">${count}</span>
              </div>
              `;
            }).join('')}
        </div>
        
        <h3>Distribuição por Região</h3>
        <div class="bar-chart">
          ${Object.entries(summary.regionDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([region, count]) => {
              const percentage = (count / summary.totalCases) * 100;
              return `
              <div class="bar-item">
                <span class="bar-label">${region}</span>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="bar-value">${count}</span>
              </div>
              `;
            }).join('')}
        </div>
        
        <h3>ODS Mais Frequentes</h3>
        <div class="bar-chart">
          ${Object.entries(summary.odsDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([ods, count]) => {
              const percentage = (count / summary.totalCases) * 100;
              return `
              <div class="bar-item">
                <span class="bar-label">ODS ${ods} - ${odsLabels[ods] || ''}</span>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="bar-value">${count}</span>
              </div>
              `;
            }).join('')}
        </div>
      </div>
    </section>
    
    <!-- Cases Detail -->
    <section class="cases-section">
      <h2>Detalhamento dos Cases</h2>
      
      ${cases.map((caseStudy, index) => `
      <div class="case-card">
        <div class="case-header">
          <div>
            <div class="case-title">${index + 1}. ${caseStudy.title}</div>
            <div class="case-org">${caseStudy.organization}</div>
          </div>
          <div class="case-sroi">S-ROI: ${caseStudy.sRoi}</div>
        </div>
        
        <div class="case-badges">
          <span class="badge">${caseStudy.sector}</span>
          <span class="badge">${caseStudy.region}</span>
          <span class="badge">${caseStudy.location}</span>
          <span class="badge">${caseStudy.year}</span>
          ${caseStudy.sdgs.map(ods => `<span class="badge">ODS ${ods}</span>`).join('')}
        </div>
        
        <div class="case-metrics">
          <div class="case-metric">
            <div class="case-metric-value">${caseStudy.investment}</div>
            <div class="case-metric-label">Investimento</div>
          </div>
          <div class="case-metric">
            <div class="case-metric-value">${caseStudy.beneficiaries}</div>
            <div class="case-metric-label">Beneficiários</div>
          </div>
          <div class="case-metric">
            <div class="case-metric-value">${caseStudy.duration}</div>
            <div class="case-metric-label">Duração</div>
          </div>
          <div class="case-metric">
            <div class="case-metric-value">${formatCurrency(caseStudy.investmentValue / caseStudy.beneficiariesValue)}</div>
            <div class="case-metric-label">Custo/Beneficiário</div>
          </div>
        </div>
        
        ${caseStudy.metrics.length > 0 ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <strong style="font-size: 0.875rem; color: #475569;">Métricas de Impacto:</strong>
          <div style="display: flex; gap: 24px; margin-top: 8px; flex-wrap: wrap;">
            ${caseStudy.metrics.map(m => `
            <div style="font-size: 0.875rem;">
              <span style="color: #64748b;">${m.label}:</span>
              <strong style="color: #1a1a2e;">${m.value}</strong>
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
      `).join('')}
    </section>
    
    <footer class="footer">
      <p>Relatório gerado automaticamente pela plataforma IMPACT7</p>
      <p>© ${new Date().getFullYear()} Método IMPACT7 - Todos os direitos reservados</p>
    </footer>
  </div>
</body>
</html>`;
}

export function prepareConsolidatedReport(
  cases: CaseForReport[],
  filters: ReportFilters = {},
  customTitle?: string
): ConsolidatedReportData {
  return {
    title: customTitle || 'Relatório de Cases IMPACT7',
    generatedAt: new Date(),
    filters,
    cases,
    summary: calculateSummary(cases),
  };
}
