/**
 * Jarvis PDF Export Service
 * 
 * Generates PDF exports for Jarvis reports with professional formatting.
 */

import { generateCertificateQRCode } from '../qrcode/qrcode-service';

export interface JarvisReportPDFData {
  title: string;
  reportType: string;
  content: string;
  executiveSummary?: string;
  metrics?: {
    totalInvestment: number;
    totalBeneficiaries: number;
    averageSroi: number;
    projectCount: number;
    impactScore: number;
  };
  generatedAt: Date;
  userId: number;
  userName?: string;
}

/**
 * Generates HTML template for Jarvis report PDF
 */
export function generateReportHTML(data: JarvisReportPDFData): string {
  const formattedDate = data.generatedAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const reportTypeLabels: Record<string, string> = {
    impact: 'Relatório de Impacto',
    executive_summary: 'Resumo Executivo',
    progress: 'Relatório de Progresso',
    comparison: 'Análise Comparativa',
    forecast: 'Projeção de Impacto',
    custom: 'Relatório Personalizado',
  };

  const reportTypeLabel = reportTypeLabels[data.reportType] || 'Relatório';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - IMPACT7</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #ffffff;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #f97316;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #f97316;
    }
    
    .report-meta {
      text-align: right;
      font-size: 12px;
      color: #666;
    }
    
    .report-type {
      display: inline-block;
      background: #f97316;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 24px;
    }
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .executive-summary {
      background: linear-gradient(135deg, #fef3e2 0%, #fff7ed 100%);
      border-left: 4px solid #f97316;
      padding: 24px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .executive-summary h3 {
      font-size: 16px;
      font-weight: 600;
      color: #f97316;
      margin-bottom: 12px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #f97316;
    }
    
    .metric-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    
    .content {
      font-size: 14px;
      line-height: 1.8;
    }
    
    .content p {
      margin-bottom: 16px;
    }
    
    .content ul, .content ol {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    .content li {
      margin-bottom: 8px;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 11px;
      color: #888;
    }
    
    .footer-logo {
      font-weight: 600;
      color: #f97316;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="logo">IMPACT7</div>
      <div class="report-meta">
        <div class="report-type">${reportTypeLabel}</div>
        <div>Gerado em ${formattedDate}</div>
        ${data.userName ? `<div>Por: ${data.userName}</div>` : ''}
      </div>
    </header>
    
    <h1>${data.title}</h1>
    
    ${data.executiveSummary ? `
    <div class="executive-summary">
      <h3>Resumo Executivo</h3>
      <p>${data.executiveSummary}</p>
    </div>
    ` : ''}
    
    ${data.metrics ? `
    <h2>Métricas de Impacto</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">R$ ${(data.metrics.totalInvestment / 1000).toFixed(0)}k</div>
        <div class="metric-label">Investimento Total</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.metrics.totalBeneficiaries.toLocaleString('pt-BR')}</div>
        <div class="metric-label">Beneficiários</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.metrics.averageSroi.toFixed(1)}x</div>
        <div class="metric-label">S-ROI Médio</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.metrics.projectCount}</div>
        <div class="metric-label">Projetos</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.metrics.impactScore}</div>
        <div class="metric-label">Score de Impacto</div>
      </div>
    </div>
    ` : ''}
    
    <h2>Análise Detalhada</h2>
    <div class="content">
      ${data.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
    </div>
    
    <footer class="footer">
      <p>Relatório gerado automaticamente pela plataforma <span class="footer-logo">IMPACT7</span></p>
      <p>Método SET7 - Engenharia de Impacto Social</p>
      <p>© ${new Date().getFullYear()} IMPACT7. Todos os direitos reservados.</p>
    </footer>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates HTML template for impact certificate
 */
export async function generateCertificateHTML(data: {
  certificateId: string;
  projectName: string;
  organizationName: string;
  sRoi: number;
  beneficiaries: number;
  impactScore: number;
  sector: string;
  sdgs: number[];
  issuedAt: Date;
  dataHash: string;
}): Promise<string> {
  // Generate QR Code
  const { dataURL: qrCodeDataURL } = await generateCertificateQRCode(data.certificateId);

  const formattedDate = data.issuedAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const sdgNames: Record<number, string> = {
    1: 'Erradicação da Pobreza',
    2: 'Fome Zero',
    3: 'Saúde e Bem-Estar',
    4: 'Educação de Qualidade',
    5: 'Igualdade de Gênero',
    6: 'Água Potável',
    7: 'Energia Limpa',
    8: 'Trabalho Decente',
    9: 'Indústria e Inovação',
    10: 'Redução das Desigualdades',
    11: 'Cidades Sustentáveis',
    12: 'Consumo Responsável',
    13: 'Ação Climática',
    14: 'Vida na Água',
    15: 'Vida Terrestre',
    16: 'Paz e Justiça',
    17: 'Parcerias',
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Certificado de Impacto Social - ${data.projectName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
    }
    
    .certificate {
      background: white;
      max-width: 800px;
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .certificate-header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .certificate-header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .certificate-header p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .certificate-body {
      padding: 40px;
    }
    
    .project-info {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .project-name {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
    }
    
    .organization {
      font-size: 18px;
      color: #666;
    }
    
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 32px 0;
    }
    
    .metric {
      text-align: center;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #f97316;
    }
    
    .metric-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    
    .sdgs {
      margin: 24px 0;
    }
    
    .sdgs-title {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      margin-bottom: 12px;
    }
    
    .sdg-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .sdg-badge {
      background: #e0f2fe;
      color: #0369a1;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .verification {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    
    .verification-info {
      flex: 1;
    }
    
    .verification-info p {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .hash {
      font-family: monospace;
      font-size: 10px;
      color: #999;
      word-break: break-all;
    }
    
    .qr-code {
      width: 120px;
      height: 120px;
    }
    
    .qr-code img {
      width: 100%;
      height: 100%;
    }
    
    .certificate-footer {
      background: #f8fafc;
      padding: 20px 40px;
      text-align: center;
      font-size: 11px;
      color: #888;
    }
    
    @media print {
      body { background: white; padding: 0; }
      .certificate { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="certificate-header">
      <h1>Certificado de Impacto Social</h1>
      <p>Emitido pela Plataforma IMPACT7 - Método SET7</p>
    </div>
    
    <div class="certificate-body">
      <div class="project-info">
        <div class="project-name">${data.projectName}</div>
        <div class="organization">${data.organizationName}</div>
      </div>
      
      <div class="metrics">
        <div class="metric">
          <div class="metric-value">${data.sRoi.toFixed(1)}x</div>
          <div class="metric-label">S-ROI</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.beneficiaries.toLocaleString('pt-BR')}</div>
          <div class="metric-label">Beneficiários</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.impactScore}</div>
          <div class="metric-label">Score</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.sector}</div>
          <div class="metric-label">Setor</div>
        </div>
      </div>
      
      <div class="sdgs">
        <div class="sdgs-title">Objetivos de Desenvolvimento Sustentável (ODS)</div>
        <div class="sdg-badges">
          ${data.sdgs.map(sdg => `<span class="sdg-badge">ODS ${sdg}: ${sdgNames[sdg] || 'Objetivo'}</span>`).join('')}
        </div>
      </div>
      
      <div class="verification">
        <div class="verification-info">
          <p><strong>ID do Certificado:</strong> ${data.certificateId}</p>
          <p><strong>Data de Emissão:</strong> ${formattedDate}</p>
          <p class="hash"><strong>Hash:</strong> ${data.dataHash}</p>
        </div>
        <div class="qr-code">
          <img src="${qrCodeDataURL}" alt="QR Code de Verificação" />
        </div>
      </div>
    </div>
    
    <div class="certificate-footer">
      <p>Este certificado pode ser verificado em impact7.com.br/certificados/verificar</p>
      <p>© ${new Date().getFullYear()} IMPACT7 - Engenharia de Impacto Social</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
