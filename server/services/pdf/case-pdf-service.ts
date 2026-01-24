/**
 * Serviço de Geração de PDF para Cases IMPACT7
 * Gera documentos PDF profissionais com métricas de impacto
 */

export interface CaseStudy {
  id: number;
  title: string;
  organization: string;
  location: string;
  region: string;
  sector: string;
  investment: string;
  beneficiaries: string;
  duration: string;
  sRoi: string;
  year: number;
  metrics: Array<{
    label: string;
    value: string;
    change: 'up' | 'down';
  }>;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  sdgs: string[];
}

// Gera HTML formatado para conversão em PDF
export function generateCasePDFContent(caseStudy: CaseStudy): string {
  const sdgNames: Record<string, string> = {
    '1': 'Erradicação da Pobreza',
    '2': 'Fome Zero',
    '3': 'Saúde e Bem-Estar',
    '4': 'Educação de Qualidade',
    '5': 'Igualdade de Gênero',
    '6': 'Água Potável e Saneamento',
    '7': 'Energia Limpa',
    '8': 'Trabalho Decente',
    '9': 'Indústria e Inovação',
    '10': 'Redução das Desigualdades',
    '11': 'Cidades Sustentáveis',
    '12': 'Consumo Responsável',
    '13': 'Ação Climática',
    '14': 'Vida na Água',
    '15': 'Vida Terrestre',
    '16': 'Paz e Justiça',
    '17': 'Parcerias',
  };

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${caseStudy.title} - Case IMPACT7</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #f97316;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #f97316;
      margin-bottom: 10px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .badge-sector {
      background: #e5e7eb;
      color: #374151;
    }
    .badge-region {
      background: #dbeafe;
      color: #1e40af;
    }
    .badge-sroi {
      background: #fef3c7;
      color: #d97706;
    }
    h1 {
      font-size: 28px;
      color: #1a1a2e;
      margin: 15px 0;
    }
    .meta {
      color: #6b7280;
      font-size: 14px;
    }
    .meta span {
      margin-right: 20px;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    .section-title.challenge { color: #dc2626; }
    .section-title.solution { color: #2563eb; }
    .section-title.results { color: #16a34a; }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .metric-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
    }
    .metric-value.up { color: #16a34a; }
    .metric-value.down { color: #2563eb; }
    .testimonial {
      background: #fef3c7;
      border-left: 4px solid #f97316;
      padding: 20px;
      margin: 25px 0;
      border-radius: 0 8px 8px 0;
    }
    .testimonial-quote {
      font-style: italic;
      font-size: 15px;
      color: #374151;
      margin-bottom: 10px;
    }
    .testimonial-author {
      font-weight: 600;
      color: #1a1a2e;
    }
    .testimonial-role {
      font-size: 13px;
      color: #6b7280;
    }
    .sdgs {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .sdg {
      background: #f97316;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .summary-box {
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
    }
    .summary-box .sroi {
      font-size: 48px;
      font-weight: bold;
      color: #f97316;
    }
    .summary-box .label {
      font-size: 14px;
      opacity: 0.8;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .summary-box { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">IMPACT7</div>
    <div>
      <span class="badge badge-sector">${caseStudy.sector}</span>
      <span class="badge badge-region">${caseStudy.region}</span>
      <span class="badge badge-sroi">S-ROI: ${caseStudy.sRoi}</span>
    </div>
    <h1>${caseStudy.title}</h1>
    <div class="meta">
      <span>🏢 ${caseStudy.organization}</span>
      <span>📍 ${caseStudy.location}</span>
      <span>📅 ${caseStudy.duration}</span>
      <span>🗓️ ${caseStudy.year}</span>
    </div>
  </div>

  <div class="section">
    <p>${caseStudy.description}</p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">Investimento Total</div>
      <div class="metric-value">${caseStudy.investment}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Beneficiários Diretos</div>
      <div class="metric-value">${caseStudy.beneficiaries}</div>
    </div>
    ${caseStudy.metrics.map(m => `
    <div class="metric-card">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value ${m.change}">${m.value}</div>
    </div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title challenge">Desafio</div>
    <p>${caseStudy.challenge}</p>
  </div>

  <div class="section">
    <div class="section-title solution">Solução IMPACT7</div>
    <p>${caseStudy.solution}</p>
  </div>

  <div class="section">
    <div class="section-title results">Resultados Alcançados</div>
    <p>${caseStudy.results}</p>
  </div>

  <div class="testimonial">
    <div class="testimonial-quote">"${caseStudy.testimonial.quote}"</div>
    <div class="testimonial-author">${caseStudy.testimonial.author}</div>
    <div class="testimonial-role">${caseStudy.testimonial.role}</div>
  </div>

  <div class="summary-box">
    <div class="sroi">${caseStudy.sRoi}</div>
    <div class="label">Retorno Social sobre Investimento</div>
  </div>

  <div class="section">
    <div class="section-title">ODS Relacionados</div>
    <div class="sdgs">
      ${caseStudy.sdgs.map(sdg => `
        <span class="sdg">ODS ${sdg}: ${sdgNames[sdg] || 'ODS ' + sdg}</span>
      `).join('')}
    </div>
  </div>

  <div class="footer">
    <p>Documento gerado pela Plataforma IMPACT7 | ${new Date().toLocaleDateString('pt-BR')}</p>
    <p>Este case foi auditado e validado conforme metodologia SET7™</p>
  </div>
</body>
</html>
  `;

  return html;
}

// Gera dados estruturados do case para API
export function getCaseDataForPDF(caseId: number, cases: CaseStudy[]): CaseStudy | null {
  return cases.find(c => c.id === caseId) || null;
}
