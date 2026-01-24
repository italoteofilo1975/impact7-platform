import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  period: string;
  generatedAt: Date;
  metrics: {
    totalLeads: number;
    totalDownloads: number;
    totalCases: number;
    approvedCases: number;
    pendingCases: number;
    totalCertificates: number;
    conversionRate: number;
    caseApprovalRate: number;
  };
  leadSources: Record<string, number>;
  caseSectors: Record<string, number>;
  activityData?: {
    days: string[];
    leads: number[];
    downloads: number[];
  };
}

export const pdfReportService = {
  /**
   * Gera um relatório PDF consolidado
   */
  generateConsolidatedReport(data: ReportData): Buffer {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('RELATÓRIO CONSOLIDADO', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text('Plataforma IMPACT7', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Período: ${data.period}`, pageWidth / 2, 35, { align: 'center' });
    doc.text(`Gerado em: ${data.generatedAt.toLocaleString('pt-BR')}`, pageWidth / 2, 40, { align: 'center' });
    
    // Linha separadora
    doc.setDrawColor(189, 195, 199);
    doc.line(20, 45, pageWidth - 20, 45);
    
    // Resumo Executivo
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Resumo Executivo', 20, 55);
    
    // Tabela de métricas principais
    autoTable(doc, {
      startY: 60,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Leads', String(data.metrics.totalLeads)],
        ['Total de Downloads', String(data.metrics.totalDownloads)],
        ['Taxa de Conversão', `${data.metrics.conversionRate}%`],
        ['Cases Submetidos', String(data.metrics.totalCases)],
        ['Cases Aprovados', String(data.metrics.approvedCases)],
        ['Cases Pendentes', String(data.metrics.pendingCases)],
        ['Taxa de Aprovação', `${data.metrics.caseApprovalRate}%`],
        ['Certificados Emitidos', String(data.metrics.totalCertificates)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 },
    });
    
    // Leads por Fonte
    const leadSourcesY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Leads por Fonte', 20, leadSourcesY);
    
    const leadSourcesData = Object.entries(data.leadSources)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => {
        const percentage = data.metrics.totalLeads > 0 
          ? Math.round((count / data.metrics.totalLeads) * 100) 
          : 0;
        return [source, String(count), `${percentage}%`];
      });
    
    if (leadSourcesData.length > 0) {
      autoTable(doc, {
        startY: leadSourcesY + 5,
        head: [['Fonte', 'Quantidade', 'Percentual']],
        body: leadSourcesData,
        theme: 'striped',
        headStyles: { fillColor: [46, 204, 113] },
        margin: { left: 20, right: 20 },
      });
    }
    
    // Cases por Setor (nova página se necessário)
    const caseSectorsY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY + 15 || leadSourcesY + 20;
    
    if (caseSectorsY > 240) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Cases por Setor', 20, 20);
    } else {
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Cases por Setor', 20, caseSectorsY);
    }
    
    const caseSectorsData = Object.entries(data.caseSectors)
      .sort(([, a], [, b]) => b - a)
      .map(([sector, count]) => {
        const percentage = data.metrics.totalCases > 0 
          ? Math.round((count / data.metrics.totalCases) * 100) 
          : 0;
        return [sector, String(count), `${percentage}%`];
      });
    
    if (caseSectorsData.length > 0) {
      autoTable(doc, {
        startY: caseSectorsY > 240 ? 25 : caseSectorsY + 5,
        head: [['Setor', 'Quantidade', 'Percentual']],
        body: caseSectorsData,
        theme: 'striped',
        headStyles: { fillColor: [155, 89, 182] },
        margin: { left: 20, right: 20 },
      });
    }
    
    // Atividade Semanal
    if (data.activityData && data.activityData.days.length > 0) {
      const activityY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY + 15 || 20;
      
      if (activityY > 240) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Atividade dos Últimos 7 Dias', 20, 20);
      } else {
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Atividade dos Últimos 7 Dias', 20, activityY);
      }
      
      const activityTableData = data.activityData.days.map((day, i) => [
        day,
        String(data.activityData!.leads[i]),
        String(data.activityData!.downloads[i]),
      ]);
      
      autoTable(doc, {
        startY: activityY > 240 ? 25 : activityY + 5,
        head: [['Dia', 'Leads', 'Downloads']],
        body: activityTableData,
        theme: 'striped',
        headStyles: { fillColor: [230, 126, 34] },
        margin: { left: 20, right: 20 },
      });
    }
    
    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.text(
        `Página ${i} de ${pageCount} - Relatório gerado automaticamente pela Plataforma IMPACT7`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Retornar como Buffer
    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  },
  
  /**
   * Gera relatório e retorna como base64
   */
  generateConsolidatedReportBase64(data: ReportData): string {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header simplificado
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text('RELATÓRIO CONSOLIDADO - IMPACT7', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Período: ${data.period} | Gerado: ${data.generatedAt.toLocaleString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });
    
    // Métricas
    autoTable(doc, {
      startY: 35,
      head: [['Métrica', 'Valor']],
      body: [
        ['Leads', String(data.metrics.totalLeads)],
        ['Downloads', String(data.metrics.totalDownloads)],
        ['Conversão', `${data.metrics.conversionRate}%`],
        ['Cases', String(data.metrics.totalCases)],
        ['Aprovados', String(data.metrics.approvedCases)],
        ['Certificados', String(data.metrics.totalCertificates)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    return doc.output('datauristring');
  },
};

export type { ReportData };
