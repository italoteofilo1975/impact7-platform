/**
 * Case Email Service
 * Serviço de notificações por email para submissões de cases
 * Integrado com Manus Notify para envio de emails
 */

import { notifyOwner } from "../../_core/notification";

export interface CaseSubmissionData {
  projectTitle: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  sector: string;
  location: string;
  investment: string;
  beneficiaries: string;
}

export interface CaseStatusChangeData {
  projectTitle: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  newStatus: 'reviewing' | 'approved' | 'rejected';
  reviewNotes?: string;
}

/**
 * Envia notificação ao owner quando um novo case é submetido
 */
export async function notifyNewCaseSubmission(data: CaseSubmissionData): Promise<boolean> {
  const title = `📋 Novo Case Submetido: ${data.projectTitle}`;
  
  const content = `
## Nova Submissão de Case

**Projeto:** ${data.projectTitle}
**Organização:** ${data.organizationName}
**Setor:** ${data.sector}
**Localização:** ${data.location}

### Dados do Projeto
- **Investimento:** ${data.investment}
- **Beneficiários:** ${data.beneficiaries}

### Contato
- **Nome:** ${data.contactName}
- **Email:** ${data.contactEmail}

---
*Acesse o painel de administração para revisar esta submissão.*
  `.trim();

  try {
    const result = await notifyOwner({ title, content });
    console.log(`[CaseEmail] Notificação de nova submissão enviada: ${data.projectTitle}`);
    return result;
  } catch (error) {
    console.error('[CaseEmail] Erro ao enviar notificação de nova submissão:', error);
    return false;
  }
}

/**
 * Envia notificação ao owner quando o status de um case muda
 */
export async function notifyCaseStatusChange(data: CaseStatusChangeData): Promise<boolean> {
  const statusEmoji = {
    reviewing: '🔍',
    approved: '✅',
    rejected: '❌',
  };

  const statusLabel = {
    reviewing: 'Em Revisão',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
  };

  const title = `${statusEmoji[data.newStatus]} Case ${statusLabel[data.newStatus]}: ${data.projectTitle}`;
  
  let content = `
## Atualização de Status do Case

**Projeto:** ${data.projectTitle}
**Organização:** ${data.organizationName}
**Novo Status:** ${statusLabel[data.newStatus]}
  `.trim();

  if (data.reviewNotes) {
    content += `\n\n### Notas da Revisão\n${data.reviewNotes}`;
  }

  content += `\n\n### Contato\n- **Nome:** ${data.contactName}\n- **Email:** ${data.contactEmail}`;

  try {
    const result = await notifyOwner({ title, content });
    console.log(`[CaseEmail] Notificação de mudança de status enviada: ${data.projectTitle} -> ${data.newStatus}`);
    return result;
  } catch (error) {
    console.error('[CaseEmail] Erro ao enviar notificação de mudança de status:', error);
    return false;
  }
}

/**
 * Gera template de email de confirmação para o submissor
 * (Para uso futuro com serviço de email externo)
 */
export function generateSubmissionConfirmationEmail(data: CaseSubmissionData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Confirmação de Submissão - ${data.projectTitle}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #FF6B35; font-size: 18px; margin-top: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Case Submetido com Sucesso!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.contactName}</strong>,</p>
      
      <p>Recebemos sua submissão de case de sucesso e estamos muito felizes em conhecer o impacto do seu projeto!</p>
      
      <div class="highlight">
        <h2>${data.projectTitle}</h2>
        <p><strong>Organização:</strong> ${data.organizationName}</p>
        <p><strong>Setor:</strong> ${data.sector}</p>
        <p><strong>Localização:</strong> ${data.location}</p>
      </div>
      
      <h3>Próximos Passos</h3>
      <ol>
        <li>Nossa equipe irá analisar sua submissão em até 5 dias úteis</li>
        <li>Você receberá um email quando o status for atualizado</li>
        <li>Se aprovado, seu case será publicado na plataforma IMPACT7</li>
      </ol>
      
      <p>Se tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
      
      <p>Atenciosamente,<br><strong>Equipe IMPACT7</strong></p>
    </div>
    <div class="footer">
      <p>© 2024 Método IMPACT7. Todos os direitos reservados.</p>
      <p>Este é um email automático, por favor não responda diretamente.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Case Submetido com Sucesso!

Olá ${data.contactName},

Recebemos sua submissão de case de sucesso e estamos muito felizes em conhecer o impacto do seu projeto!

DETALHES DA SUBMISSÃO
- Projeto: ${data.projectTitle}
- Organização: ${data.organizationName}
- Setor: ${data.sector}
- Localização: ${data.location}

PRÓXIMOS PASSOS
1. Nossa equipe irá analisar sua submissão em até 5 dias úteis
2. Você receberá um email quando o status for atualizado
3. Se aprovado, seu case será publicado na plataforma IMPACT7

Se tiver alguma dúvida, não hesite em entrar em contato conosco.

Atenciosamente,
Equipe IMPACT7
  `.trim();

  return { subject, html, text };
}

/**
 * Gera template de email de atualização de status
 * (Para uso futuro com serviço de email externo)
 */
export function generateStatusUpdateEmail(data: CaseStatusChangeData): {
  subject: string;
  html: string;
  text: string;
} {
  const statusConfig = {
    reviewing: {
      emoji: '🔍',
      title: 'Seu Case Está em Revisão',
      message: 'Nossa equipe está analisando sua submissão. Você receberá uma atualização em breve.',
      color: '#3B82F6',
    },
    approved: {
      emoji: '✅',
      title: 'Parabéns! Seu Case Foi Aprovado',
      message: 'Seu case de sucesso foi aprovado e será publicado na plataforma IMPACT7!',
      color: '#22C55E',
    },
    rejected: {
      emoji: '❌',
      title: 'Atualização Sobre Seu Case',
      message: 'Após análise, não foi possível aprovar sua submissão neste momento.',
      color: '#EF4444',
    },
  };

  const config = statusConfig[data.newStatus];
  const subject = `${config.emoji} ${config.title} - ${data.projectTitle}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .highlight { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color}; }
    .notes { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: ${config.color}; font-size: 18px; margin-top: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.emoji} ${config.title}</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${data.contactName}</strong>,</p>
      
      <p>${config.message}</p>
      
      <div class="highlight">
        <h2>${data.projectTitle}</h2>
        <p><strong>Organização:</strong> ${data.organizationName}</p>
      </div>
      
      ${data.reviewNotes ? `
      <div class="notes">
        <h3>📝 Notas da Revisão</h3>
        <p>${data.reviewNotes}</p>
      </div>
      ` : ''}
      
      ${data.newStatus === 'approved' ? `
      <h3>O Que Acontece Agora?</h3>
      <ul>
        <li>Seu case será publicado na página de Cases de Sucesso</li>
        <li>Ele poderá ser baixado em PDF por outros usuários</li>
        <li>Sua história de impacto inspirará outras organizações</li>
      </ul>
      ` : ''}
      
      ${data.newStatus === 'rejected' ? `
      <h3>Próximos Passos</h3>
      <p>Você pode revisar sua submissão com base no feedback acima e submeter novamente quando estiver pronto.</p>
      ` : ''}
      
      <p>Se tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
      
      <p>Atenciosamente,<br><strong>Equipe IMPACT7</strong></p>
    </div>
    <div class="footer">
      <p>© 2024 Método IMPACT7. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
${config.title}

Olá ${data.contactName},

${config.message}

DETALHES
- Projeto: ${data.projectTitle}
- Organização: ${data.organizationName}

${data.reviewNotes ? `NOTAS DA REVISÃO\n${data.reviewNotes}\n` : ''}

Se tiver alguma dúvida, não hesite em entrar em contato conosco.

Atenciosamente,
Equipe IMPACT7
  `.trim();

  return { subject, html, text };
}

export const CaseEmailService = {
  notifyNewCaseSubmission,
  notifyCaseStatusChange,
  generateSubmissionConfirmationEmail,
  generateStatusUpdateEmail,
};
