/**
 * Auto Notification Service
 * Envia notificações automáticas para eventos importantes do sistema
 */

import { notifyOwner } from '../../_core/notification';

export interface AutoNotificationConfig {
  enabled: boolean;
  notifyOnNewLead: boolean;
  notifyOnNewDownload: boolean;
  notifyOnCaseSubmission: boolean;
  notifyOnContactMessage: boolean;
}

class AutoNotificationService {
  private config: AutoNotificationConfig = {
    enabled: true,
    notifyOnNewLead: true,
    notifyOnNewDownload: true,
    notifyOnCaseSubmission: true,
    notifyOnContactMessage: true,
  };

  /**
   * Configura o serviço de notificações automáticas
   */
  setConfig(config: Partial<AutoNotificationConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Retorna a configuração atual
   */
  getConfig(): AutoNotificationConfig {
    return { ...this.config };
  }

  /**
   * Notifica sobre novo lead
   */
  async notifyNewLead(data: {
    name: string;
    email: string;
    company?: string;
    source?: string;
  }): Promise<boolean> {
    if (!this.config.enabled || !this.config.notifyOnNewLead) {
      return false;
    }

    const content = `
🎯 **Novo Lead Capturado!**

**Nome:** ${data.name}
**Email:** ${data.email}
${data.company ? `**Empresa:** ${data.company}` : ''}
${data.source ? `**Origem:** ${data.source}` : ''}

**Ação recomendada:** Entre em contato nas próximas 24h para maximizar conversão.

---
📊 Acesse o painel admin para ver todos os detalhes e histórico.
    `.trim();

    try {
      return await notifyOwner({
        title: '🎯 Novo Lead Capturado',
        content,
      });
    } catch (error) {
      console.error('[AutoNotification] Erro ao notificar novo lead:', error);
      return false;
    }
  }

  /**
   * Notifica sobre novo download
   */
  async notifyNewDownload(data: {
    type: 'whitepaper' | 'ebook' | 'certificate';
    email: string;
    name?: string;
    title?: string;
  }): Promise<boolean> {
    if (!this.config.enabled || !this.config.notifyOnNewDownload) {
      return false;
    }

    const typeLabels = {
      whitepaper: 'Whitepaper',
      ebook: 'E-book',
      certificate: 'Certificado',
    };

    const content = `
📥 **Novo Download Realizado!**

**Tipo:** ${typeLabels[data.type]}
${data.title ? `**Título:** ${data.title}` : ''}
**Email:** ${data.email}
${data.name ? `**Nome:** ${data.name}` : ''}

**Ação recomendada:** Considere enviar email de follow-up com conteúdo relacionado.

---
📊 Acesse o painel admin para ver estatísticas de downloads.
    `.trim();

    try {
      return await notifyOwner({
        title: `📥 Novo Download: ${typeLabels[data.type]}`,
        content,
      });
    } catch (error) {
      console.error('[AutoNotification] Erro ao notificar novo download:', error);
      return false;
    }
  }

  /**
   * Notifica sobre nova submissão de case
   */
  async notifyCaseSubmission(data: {
    projectTitle: string;
    organization: string;
    submitterEmail: string;
    submitterName?: string;
  }): Promise<boolean> {
    if (!this.config.enabled || !this.config.notifyOnCaseSubmission) {
      return false;
    }

    const content = `
📝 **Nova Submissão de Case!**

**Projeto:** ${data.projectTitle}
**Organização:** ${data.organization}
**Submetido por:** ${data.submitterName || data.submitterEmail}
**Email:** ${data.submitterEmail}

**Ação recomendada:** Revise e aprove o case no painel admin.

---
📊 Acesse o painel admin → Revisão de Cases para avaliar.
    `.trim();

    try {
      return await notifyOwner({
        title: '📝 Nova Submissão de Case',
        content,
      });
    } catch (error) {
      console.error('[AutoNotification] Erro ao notificar submissão de case:', error);
      return false;
    }
  }

  /**
   * Notifica sobre nova mensagem de contato
   */
  async notifyContactMessage(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<boolean> {
    if (!this.config.enabled || !this.config.notifyOnContactMessage) {
      return false;
    }

    const content = `
💬 **Nova Mensagem de Contato!**

**Nome:** ${data.name}
**Email:** ${data.email}
${data.subject ? `**Assunto:** ${data.subject}` : ''}

**Mensagem:**
${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}

**Ação recomendada:** Responda em até 2 horas para melhor experiência do usuário.

---
📊 Acesse o painel admin → Contatos para ver mensagem completa.
    `.trim();

    try {
      return await notifyOwner({
        title: '💬 Nova Mensagem de Contato',
        content,
      });
    } catch (error) {
      console.error('[AutoNotification] Erro ao notificar mensagem de contato:', error);
      return false;
    }
  }

  /**
   * Envia notificação de teste
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      return await notifyOwner({
        title: '🧪 Teste de Notificação Automática',
        content: `
Este é um teste do sistema de notificações automáticas do IMPACT7.

✅ Sistema funcionando corretamente!

Configuração atual:
- Novos Leads: ${this.config.notifyOnNewLead ? 'Ativo' : 'Inativo'}
- Downloads: ${this.config.notifyOnNewDownload ? 'Ativo' : 'Inativo'}
- Submissões de Cases: ${this.config.notifyOnCaseSubmission ? 'Ativo' : 'Inativo'}
- Mensagens de Contato: ${this.config.notifyOnContactMessage ? 'Ativo' : 'Inativo'}

---
Timestamp: ${new Date().toLocaleString('pt-BR')}
        `.trim(),
      });
    } catch (error) {
      console.error('[AutoNotification] Erro ao enviar notificação de teste:', error);
      return false;
    }
  }
}

export const autoNotificationService = new AutoNotificationService();
