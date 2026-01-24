import { getDb } from '../../db';
import { notificationTemplates } from '../../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

export interface NotificationTemplateInput {
  code: string;
  name: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'case_pending' | 'case_approved' | 'case_rejected' | 'certificate_issued' | 'token_earned' | 'system';
  titleTemplate: string;
  messageTemplate: string;
  availableVariables?: string[];
  isActive?: boolean;
}

/**
 * Notification Template Service
 * Manages customizable notification templates with variable substitution
 */
class NotificationTemplateService {
  /**
   * Get all templates
   */
  async getAll(): Promise<Array<typeof notificationTemplates.$inferSelect>> {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(notificationTemplates)
      .orderBy(desc(notificationTemplates.createdAt));
  }

  /**
   * Get active templates only
   */
  async getActive(): Promise<Array<typeof notificationTemplates.$inferSelect>> {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.isActive, true))
      .orderBy(notificationTemplates.code);
  }

  /**
   * Get template by code
   */
  async getByCode(code: string): Promise<typeof notificationTemplates.$inferSelect | null> {
    const db = await getDb();
    if (!db) return null;

    const [template] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.code, code))
      .limit(1);

    return template || null;
  }

  /**
   * Get template by ID
   */
  async getById(id: number): Promise<typeof notificationTemplates.$inferSelect | null> {
    const db = await getDb();
    if (!db) return null;

    const [template] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.id, id))
      .limit(1);

    return template || null;
  }

  /**
   * Create a new template
   */
  async create(input: NotificationTemplateInput, createdBy?: number): Promise<{ success: boolean; id?: number; error?: string }> {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    try {
      // Check if code already exists
      const existing = await this.getByCode(input.code);
      if (existing) {
        return { success: false, error: 'Template code already exists' };
      }

      const result = await db.insert(notificationTemplates).values({
        code: input.code,
        name: input.name,
        description: input.description,
        type: input.type,
        titleTemplate: input.titleTemplate,
        messageTemplate: input.messageTemplate,
        availableVariables: input.availableVariables ? JSON.stringify(input.availableVariables) : null,
        isActive: input.isActive ?? true,
        isSystem: false,
        createdBy,
      });

      return { success: true, id: result[0].insertId };
    } catch (error) {
      console.error('[NotificationTemplate] Create error:', error);
      return { success: false, error: 'Failed to create template' };
    }
  }

  /**
   * Update an existing template
   */
  async update(id: number, input: Partial<NotificationTemplateInput>): Promise<{ success: boolean; error?: string }> {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    try {
      const template = await this.getById(id);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.titleTemplate !== undefined) updateData.titleTemplate = input.titleTemplate;
      if (input.messageTemplate !== undefined) updateData.messageTemplate = input.messageTemplate;
      if (input.availableVariables !== undefined) {
        updateData.availableVariables = JSON.stringify(input.availableVariables);
      }
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await db
        .update(notificationTemplates)
        .set(updateData)
        .where(eq(notificationTemplates.id, id));

      return { success: true };
    } catch (error) {
      console.error('[NotificationTemplate] Update error:', error);
      return { success: false, error: 'Failed to update template' };
    }
  }

  /**
   * Delete a template (only non-system templates)
   */
  async delete(id: number): Promise<{ success: boolean; error?: string }> {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    try {
      const template = await this.getById(id);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      if (template.isSystem) {
        return { success: false, error: 'Cannot delete system templates' };
      }

      await db
        .delete(notificationTemplates)
        .where(eq(notificationTemplates.id, id));

      return { success: true };
    } catch (error) {
      console.error('[NotificationTemplate] Delete error:', error);
      return { success: false, error: 'Failed to delete template' };
    }
  }

  /**
   * Render a template with variables
   */
  renderTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  /**
   * Render a notification from a template code
   */
  async renderNotification(code: string, variables: Record<string, string>): Promise<{
    success: boolean;
    title?: string;
    message?: string;
    type?: string;
    error?: string;
  }> {
    const template = await this.getByCode(code);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    if (!template.isActive) {
      return { success: false, error: 'Template is inactive' };
    }

    const title = this.renderTemplate(template.titleTemplate, variables);
    const message = this.renderTemplate(template.messageTemplate, variables);

    return {
      success: true,
      title,
      message,
      type: template.type,
    };
  }

  /**
   * Get predefined template variables for each type
   */
  getVariablesForType(type: string): TemplateVariable[] {
    const commonVars: TemplateVariable[] = [
      { name: 'userName', description: 'Nome do usuário', example: 'João Silva' },
      { name: 'userEmail', description: 'Email do usuário', example: 'joao@email.com' },
      { name: 'date', description: 'Data atual', example: '14/01/2026' },
      { name: 'time', description: 'Hora atual', example: '14:30' },
    ];

    const typeVars: Record<string, TemplateVariable[]> = {
      case_approved: [
        { name: 'caseName', description: 'Nome do case', example: 'Projeto Educação Rural' },
        { name: 'caseId', description: 'ID do case', example: '12345' },
        { name: 'reviewerName', description: 'Nome do revisor', example: 'Admin' },
        { name: 'approvalDate', description: 'Data de aprovação', example: '14/01/2026' },
      ],
      case_rejected: [
        { name: 'caseName', description: 'Nome do case', example: 'Projeto Educação Rural' },
        { name: 'caseId', description: 'ID do case', example: '12345' },
        { name: 'rejectionReason', description: 'Motivo da rejeição', example: 'Documentação incompleta' },
      ],
      case_pending: [
        { name: 'caseName', description: 'Nome do case', example: 'Projeto Educação Rural' },
        { name: 'caseId', description: 'ID do case', example: '12345' },
        { name: 'submitterName', description: 'Nome do submissor', example: 'Maria Santos' },
      ],
      certificate_issued: [
        { name: 'certificateId', description: 'ID do certificado', example: 'CERT-2026-001' },
        { name: 'certificateHash', description: 'Hash do certificado', example: 'abc123...' },
        { name: 'projectName', description: 'Nome do projeto', example: 'Projeto Saúde Comunitária' },
        { name: 'impactScore', description: 'Pontuação de impacto', example: '85.5' },
      ],
      token_earned: [
        { name: 'tokenAmount', description: 'Quantidade de tokens', example: '100' },
        { name: 'tokenType', description: 'Tipo do token', example: 'impact_credit' },
        { name: 'reason', description: 'Motivo do ganho', example: 'Contribuição aprovada' },
      ],
    };

    return [...commonVars, ...(typeVars[type] || [])];
  }

  /**
   * Seed default system templates
   */
  async seedDefaultTemplates(): Promise<void> {
    const db = await getDb();
    if (!db) return;

    const defaultTemplates: Array<{
      code: string;
      name: string;
      description: string;
      type: 'info' | 'success' | 'warning' | 'error' | 'case_pending' | 'case_approved' | 'case_rejected' | 'certificate_issued' | 'token_earned' | 'system';
      titleTemplate: string;
      messageTemplate: string;
      availableVariables: string[];
    }> = [
      {
        code: 'case_approved_default',
        name: 'Case Aprovado (Padrão)',
        description: 'Notificação enviada quando um case é aprovado',
        type: 'case_approved',
        titleTemplate: '🎉 Case "{{caseName}}" Aprovado!',
        messageTemplate: 'Parabéns, {{userName}}! Seu case "{{caseName}}" foi aprovado em {{approvalDate}}. Agora ele está visível para toda a comunidade IMPACT7.',
        availableVariables: ['userName', 'caseName', 'caseId', 'approvalDate', 'reviewerName'],
      },
      {
        code: 'case_rejected_default',
        name: 'Case Rejeitado (Padrão)',
        description: 'Notificação enviada quando um case é rejeitado',
        type: 'case_rejected',
        titleTemplate: '❌ Case "{{caseName}}" Necessita Revisão',
        messageTemplate: 'Olá {{userName}}, seu case "{{caseName}}" precisa de ajustes. Motivo: {{rejectionReason}}. Por favor, revise e reenvie.',
        availableVariables: ['userName', 'caseName', 'caseId', 'rejectionReason'],
      },
      {
        code: 'certificate_issued_default',
        name: 'Certificado Emitido (Padrão)',
        description: 'Notificação enviada quando um certificado blockchain é emitido',
        type: 'certificate_issued',
        titleTemplate: '📜 Certificado de Impacto Emitido',
        messageTemplate: 'Seu certificado de impacto para "{{projectName}}" foi emitido com sucesso! ID: {{certificateId}}. Pontuação de impacto: {{impactScore}}.',
        availableVariables: ['userName', 'projectName', 'certificateId', 'certificateHash', 'impactScore'],
      },
      {
        code: 'token_earned_default',
        name: 'Token Ganho (Padrão)',
        description: 'Notificação enviada quando o usuário ganha tokens',
        type: 'token_earned',
        titleTemplate: '🪙 Você ganhou {{tokenAmount}} tokens!',
        messageTemplate: 'Parabéns, {{userName}}! Você ganhou {{tokenAmount}} tokens do tipo {{tokenType}}. Motivo: {{reason}}.',
        availableVariables: ['userName', 'tokenAmount', 'tokenType', 'reason'],
      },
    ];

    for (const template of defaultTemplates) {
      const existing = await this.getByCode(template.code);
      if (!existing) {
        await db.insert(notificationTemplates).values({
          ...template,
          availableVariables: JSON.stringify(template.availableVariables),
          isSystem: true,
          isActive: true,
        });
        console.log(`[NotificationTemplate] Seeded: ${template.code}`);
      }
    }
  }
}

// Singleton instance
export const notificationTemplateService = new NotificationTemplateService();
