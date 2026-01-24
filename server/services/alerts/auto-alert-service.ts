import { getDb } from '../../db';
import { caseSubmissions, leads } from '../../../drizzle/schema';
import { sql, and, lt, eq } from 'drizzle-orm';
import { notifyOwner } from '../../_core/notification';

interface AlertConfig {
  pendingCasesThresholdHours: number;
  leadsWithoutFollowupDays: number;
  criticalMetricsThresholds: {
    maxPendingCases: number;
    minDailyLeads: number;
  };
}

const defaultConfig: AlertConfig = {
  pendingCasesThresholdHours: 48,
  leadsWithoutFollowupDays: 7,
  criticalMetricsThresholds: {
    maxPendingCases: 10,
    minDailyLeads: 0,
  },
};

export const autoAlertService = {
  config: { ...defaultConfig },

  /**
   * Configura os limites de alerta
   */
  setConfig(config: Partial<AlertConfig>) {
    this.config = { ...this.config, ...config };
  },

  /**
   * Verifica cases pendentes há mais de X horas
   */
  async checkPendingCases(): Promise<{ count: number; cases: { id: number; projectName: string | null; createdAt: Date | null }[] }> {
    const db = await getDb();
    if (!db) return { count: 0, cases: [] };

    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - this.config.pendingCasesThresholdHours);

    const pendingCases = await db
      .select({
        id: caseSubmissions.id,
        projectName: caseSubmissions.projectTitle,
        createdAt: caseSubmissions.createdAt,
      })
      .from(caseSubmissions)
      .where(
        and(
          eq(caseSubmissions.status, 'pending'),
          lt(caseSubmissions.createdAt, thresholdDate)
        )
      );

    return { count: pendingCases.length, cases: pendingCases };
  },

  /**
   * Verifica métricas críticas
   */
  async checkCriticalMetrics(): Promise<{
    alerts: string[];
    pendingCasesCount: number;
    todayLeadsCount: number;
  }> {
    const db = await getDb();
    if (!db) return { alerts: [], pendingCasesCount: 0, todayLeadsCount: 0 };

    const alerts: string[] = [];

    // Contar cases pendentes
    const pendingResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(caseSubmissions)
      .where(eq(caseSubmissions.status, 'pending'));
    const pendingCasesCount = Number(pendingResult[0]?.count || 0);

    if (pendingCasesCount > this.config.criticalMetricsThresholds.maxPendingCases) {
      alerts.push(`Alerta: ${pendingCasesCount} cases pendentes (limite: ${this.config.criticalMetricsThresholds.maxPendingCases})`);
    }

    // Contar leads de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const leadsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(sql`${leads.createdAt} >= ${today}`);
    const todayLeadsCount = Number(leadsResult[0]?.count || 0);

    return { alerts, pendingCasesCount, todayLeadsCount };
  },

  /**
   * Envia alerta para o owner sobre cases pendentes
   */
  async sendPendingCasesAlert(): Promise<boolean> {
    const { count, cases } = await this.checkPendingCases();
    
    if (count === 0) {
      console.log('[AutoAlert] Nenhum case pendente há mais de 48h');
      return false;
    }

    const casesList = cases
      .slice(0, 5)
      .map(c => `- ${c.projectName} (ID: ${c.id})`)
      .join('\n');

    const content = `
Existem ${count} case(s) pendente(s) há mais de ${this.config.pendingCasesThresholdHours} horas:

${casesList}
${count > 5 ? `\n... e mais ${count - 5} outros` : ''}

Acesse o painel de revisão de cases para analisar.
    `.trim();

    const success = await notifyOwner({
      title: `⚠️ ${count} Case(s) Pendente(s) Aguardando Revisão`,
      content,
    });

    if (success) {
      console.log(`[AutoAlert] Alerta enviado: ${count} cases pendentes`);
    }

    return success;
  },

  /**
   * Envia alerta sobre métricas críticas
   */
  async sendCriticalMetricsAlert(): Promise<boolean> {
    const { alerts, pendingCasesCount, todayLeadsCount } = await this.checkCriticalMetrics();

    if (alerts.length === 0) {
      console.log('[AutoAlert] Nenhuma métrica crítica detectada');
      return false;
    }

    const content = `
Métricas que requerem atenção:

${alerts.join('\n')}

Resumo:
- Cases pendentes: ${pendingCasesCount}
- Leads hoje: ${todayLeadsCount}

Acesse o painel administrativo para mais detalhes.
    `.trim();

    const success = await notifyOwner({
      title: '🚨 Alerta de Métricas Críticas',
      content,
    });

    if (success) {
      console.log(`[AutoAlert] Alerta de métricas críticas enviado`);
    }

    return success;
  },

  /**
   * Executa todas as verificações de alerta
   */
  async runAllChecks(): Promise<{
    pendingCasesAlertSent: boolean;
    criticalMetricsAlertSent: boolean;
    summary: string;
  }> {
    console.log('[AutoAlert] Executando verificações de alerta...');

    const pendingCasesAlertSent = await this.sendPendingCasesAlert();
    const criticalMetricsAlertSent = await this.sendCriticalMetricsAlert();

    const summary = [
      pendingCasesAlertSent ? 'Alerta de cases pendentes enviado' : 'Nenhum alerta de cases',
      criticalMetricsAlertSent ? 'Alerta de métricas críticas enviado' : 'Métricas dentro do normal',
    ].join('; ');

    console.log(`[AutoAlert] Verificações concluídas: ${summary}`);

    return {
      pendingCasesAlertSent,
      criticalMetricsAlertSent,
      summary,
    };
  },
};
