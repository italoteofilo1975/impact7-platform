/**
 * Templates de Email para Notificacoes
 * Templates HTML responsivos para todas as notificacoes da plataforma IMPACT7
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface TemplateVariables {
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// ESTILOS BASE
// ============================================================================

const BASE_STYLES = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
  .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center; }
  .header img { height: 40px; }
  .header h1 { color: #ffffff; margin: 16px 0 0 0; font-size: 24px; }
  .content { padding: 32px; }
  .content h2 { color: #18181b; margin: 0 0 16px 0; font-size: 20px; }
  .content p { color: #52525b; line-height: 1.6; margin: 0 0 16px 0; }
  .button { display: inline-block; background: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
  .button:hover { background: #ea580c; }
  .footer { background-color: #f4f4f5; padding: 24px; text-align: center; }
  .footer p { color: #71717a; font-size: 12px; margin: 0 0 8px 0; }
  .footer a { color: #f97316; text-decoration: none; }
  .highlight { background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px; margin: 16px 0; }
  .stats { display: flex; justify-content: space-around; margin: 24px 0; }
  .stat { text-align: center; }
  .stat-value { font-size: 32px; font-weight: bold; color: #f97316; }
  .stat-label { font-size: 12px; color: #71717a; text-transform: uppercase; }
`;

// ============================================================================
// FUNCAO DE RENDERIZACAO
// ============================================================================

function renderTemplate(template: string, variables: TemplateVariables): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  return result;
}

// ============================================================================
// TEMPLATES
// ============================================================================

export const EMAIL_TEMPLATES = {
  /**
   * Email de boas-vindas para novos usuarios
   */
  welcome: (vars: { userName: string; loginUrl: string }): EmailTemplate => ({
    subject: 'Bem-vindo ao IMPACT7! Sua jornada de impacto comeca agora',
    html: renderTemplate(`
      <!DOCTYPE html>
      <html>
      <head><style>${BASE_STYLES}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IMPACT7</h1>
          </div>
          <div class="content">
            <h2>Ola, {{userName}}!</h2>
            <p>Seja bem-vindo a plataforma IMPACT7! Estamos muito felizes em te-lo conosco nessa jornada de transformacao social.</p>
            <div class="highlight">
              <p><strong>O que voce pode fazer agora:</strong></p>
              <ul>
                <li>Calcular o S-ROI dos seus projetos</li>
                <li>Explorar cases de sucesso</li>
                <li>Conversar com o Jarvis AI</li>
                <li>Acessar a metodologia IMPACT7</li>
              </ul>
            </div>
            <p style="text-align: center; margin-top: 24px;">
              <a href="{{loginUrl}}" class="button">Acessar Plataforma</a>
            </p>
          </div>
          <div class="footer">
            <p>IMPACT7 - Transformando Impacto Social com Ciencia</p>
            <p><a href="https://impact7.com.br">impact7.com.br</a></p>
          </div>
        </div>
      </body>
      </html>
    `, vars),
    text: `Ola, ${vars.userName}! Bem-vindo ao IMPACT7. Acesse: ${vars.loginUrl}`,
  }),

  /**
   * Email de calculo S-ROI concluido
   */
  calculationComplete: (vars: { 
    userName: string; 
    projectName: string; 
    sRoi: number; 
    impactScore: number;
    dashboardUrl: string;
  }): EmailTemplate => ({
    subject: `Calculo S-ROI Concluido: ${vars.projectName}`,
    html: renderTemplate(`
      <!DOCTYPE html>
      <html>
      <head><style>${BASE_STYLES}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IMPACT7</h1>
          </div>
          <div class="content">
            <h2>Calculo Concluido!</h2>
            <p>Ola, {{userName}}! O calculo S-ROI do projeto <strong>{{projectName}}</strong> foi concluido.</p>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">{{sRoi}}x</div>
                <div class="stat-label">S-ROI</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{impactScore}}</div>
                <div class="stat-label">Indice de Impacto</div>
              </div>
            </div>
            <div class="highlight">
              <p>O S-ROI (Social Return on Investment) indica quantas vezes o valor social gerado supera o investimento inicial.</p>
            </div>
            <p style="text-align: center; margin-top: 24px;">
              <a href="{{dashboardUrl}}" class="button">Ver Detalhes</a>
            </p>
          </div>
          <div class="footer">
            <p>IMPACT7 - Transformando Impacto Social com Ciencia</p>
          </div>
        </div>
      </body>
      </html>
    `, vars),
    text: `Calculo S-ROI concluido para ${vars.projectName}. S-ROI: ${vars.sRoi}x. Ver em: ${vars.dashboardUrl}`,
  }),

  /**
   * Email de trial expirando
   */
  trialEnding: (vars: { 
    userName: string; 
    daysLeft: number; 
    upgradeUrl: string;
  }): EmailTemplate => ({
    subject: `Seu trial IMPACT7 expira em ${vars.daysLeft} dias`,
    html: renderTemplate(`
      <!DOCTYPE html>
      <html>
      <head><style>${BASE_STYLES}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IMPACT7</h1>
          </div>
          <div class="content">
            <h2>Seu trial esta acabando</h2>
            <p>Ola, {{userName}}! Seu periodo de teste gratuito expira em <strong>{{daysLeft}} dias</strong>.</p>
            <div class="highlight">
              <p><strong>Nao perca acesso a:</strong></p>
              <ul>
                <li>Calculadora S-ROI ilimitada</li>
                <li>Jarvis AI para mentoria</li>
                <li>Cases de sucesso exclusivos</li>
                <li>Certificados de impacto</li>
              </ul>
            </div>
            <p style="text-align: center; margin-top: 24px;">
              <a href="{{upgradeUrl}}" class="button">Fazer Upgrade Agora</a>
            </p>
            <p style="text-align: center; color: #71717a; font-size: 14px;">
              Use o codigo <strong>IMPACT20</strong> para 20% de desconto
            </p>
          </div>
          <div class="footer">
            <p>IMPACT7 - Transformando Impacto Social com Ciencia</p>
          </div>
        </div>
      </body>
      </html>
    `, vars),
    text: `Ola ${vars.userName}, seu trial expira em ${vars.daysLeft} dias. Faca upgrade: ${vars.upgradeUrl}`,
  }),

  /**
   * Email de novo case submetido (para admin)
   */
  newCaseSubmission: (vars: { 
    organizationName: string; 
    sector: string; 
    submitterEmail: string;
    adminUrl: string;
  }): EmailTemplate => ({
    subject: `Novo Case Submetido: ${vars.organizationName}`,
    html: renderTemplate(`
      <!DOCTYPE html>
      <html>
      <head><style>${BASE_STYLES}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IMPACT7 Admin</h1>
          </div>
          <div class="content">
            <h2>Novo Case para Revisao</h2>
            <p>Um novo case de sucesso foi submetido e aguarda aprovacao.</p>
            <div class="highlight">
              <p><strong>Organizacao:</strong> {{organizationName}}</p>
              <p><strong>Setor:</strong> {{sector}}</p>
              <p><strong>Submetido por:</strong> {{submitterEmail}}</p>
            </div>
            <p style="text-align: center; margin-top: 24px;">
              <a href="{{adminUrl}}" class="button">Revisar Case</a>
            </p>
          </div>
          <div class="footer">
            <p>IMPACT7 Admin - Notificacao Automatica</p>
          </div>
        </div>
      </body>
      </html>
    `, vars),
    text: `Novo case submetido: ${vars.organizationName} (${vars.sector}). Revisar em: ${vars.adminUrl}`,
  }),

  /**
   * Email de pagamento confirmado
   */
  paymentConfirmed: (vars: { 
    userName: string; 
    planName: string; 
    amount: string;
    nextBillingDate: string;
    invoiceUrl: string;
  }): EmailTemplate => ({
    subject: `Pagamento Confirmado - Plano ${vars.planName}`,
    html: renderTemplate(`
      <!DOCTYPE html>
      <html>
      <head><style>${BASE_STYLES}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IMPACT7</h1>
          </div>
          <div class="content">
            <h2>Pagamento Confirmado!</h2>
            <p>Ola, {{userName}}! Seu pagamento foi processado com sucesso.</p>
            <div class="highlight">
              <p><strong>Plano:</strong> {{planName}}</p>
              <p><strong>Valor:</strong> {{amount}}</p>
              <p><strong>Proxima cobranca:</strong> {{nextBillingDate}}</p>
            </div>
            <p style="text-align: center; margin-top: 24px;">
              <a href="{{invoiceUrl}}" class="button">Ver Fatura</a>
            </p>
          </div>
          <div class="footer">
            <p>IMPACT7 - Transformando Impacto Social com Ciencia</p>
          </div>
        </div>
      </body>
      </html>
    `, vars),
    text: `Pagamento confirmado: ${vars.planName} - ${vars.amount}. Proxima cobranca: ${vars.nextBillingDate}`,
  }),

  /**
   * Email de digest semanal
   */
  weeklyDigest: (vars: { 
    userName: string; 
    calculationsCount: number;
    casesViewed: number;
    jarvisChats: number;
    dashboardUrl: string;
  }): EmailTemplate => ({
    subject: 'Seu Resumo Semanal IMPACT7',
    html: renderTemplate(`
      <!DOCTYPE html>
      <html>
      <head><style>${BASE_STYLES}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IMPACT7</h1>
          </div>
          <div class="content">
            <h2>Seu Resumo Semanal</h2>
            <p>Ola, {{userName}}! Veja o que voce conquistou esta semana:</p>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">{{calculationsCount}}</div>
                <div class="stat-label">Calculos</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{casesViewed}}</div>
                <div class="stat-label">Cases</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{jarvisChats}}</div>
                <div class="stat-label">Chats Jarvis</div>
              </div>
            </div>
            <div class="highlight">
              <p><strong>Dica da semana:</strong> Use a equacao I = (E x C^7) / R para maximizar seu impacto. Quanto maior o contexto preservado (C), maior o resultado exponencial!</p>
            </div>
            <p style="text-align: center; margin-top: 24px;">
              <a href="{{dashboardUrl}}" class="button">Ver Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>IMPACT7 - Transformando Impacto Social com Ciencia</p>
            <p><a href="#">Gerenciar preferencias de email</a></p>
          </div>
        </div>
      </body>
      </html>
    `, vars),
    text: `Resumo semanal: ${vars.calculationsCount} calculos, ${vars.casesViewed} cases, ${vars.jarvisChats} chats. Ver: ${vars.dashboardUrl}`,
  }),

  /**
   * Email de alerta de seguranca
   */
  securityAlert: (vars: { 
    userName: string; 
    alertType: string;
    ipAddress: string;
    location: string;
    timestamp: string;
    securityUrl: string;
  }): EmailTemplate => ({
    subject: 'Alerta de Seguranca - IMPACT7',
    html: renderTemplate(`
      <!DOCTYPE html>
      <html>
      <head><style>${BASE_STYLES}</style></head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
            <h1>Alerta de Seguranca</h1>
          </div>
          <div class="content">
            <h2>Atividade Suspeita Detectada</h2>
            <p>Ola, {{userName}}! Detectamos uma atividade incomum na sua conta:</p>
            <div class="highlight" style="border-left-color: #dc2626; background-color: #fef2f2;">
              <p><strong>Tipo:</strong> {{alertType}}</p>
              <p><strong>IP:</strong> {{ipAddress}}</p>
              <p><strong>Localizacao:</strong> {{location}}</p>
              <p><strong>Data/Hora:</strong> {{timestamp}}</p>
            </div>
            <p>Se voce reconhece esta atividade, pode ignorar este email. Caso contrario, recomendamos alterar sua senha imediatamente.</p>
            <p style="text-align: center; margin-top: 24px;">
              <a href="{{securityUrl}}" class="button" style="background: #dc2626;">Verificar Seguranca</a>
            </p>
          </div>
          <div class="footer">
            <p>IMPACT7 - Seguranca e sua prioridade</p>
          </div>
        </div>
      </body>
      </html>
    `, vars),
    text: `ALERTA: ${vars.alertType} detectado de ${vars.ipAddress} (${vars.location}) em ${vars.timestamp}. Verificar: ${vars.securityUrl}`,
  }),

  /**
   * Email de convite para referral
   */
  referralInvite: (vars: { 
    referrerName: string; 
    inviteCode: string;
    signupUrl: string;
  }): EmailTemplate => ({
    subject: `${vars.referrerName} te convidou para o IMPACT7`,
    html: renderTemplate(`
      <!DOCTYPE html>
      <html>
      <head><style>${BASE_STYLES}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IMPACT7</h1>
          </div>
          <div class="content">
            <h2>Voce foi convidado!</h2>
            <p><strong>{{referrerName}}</strong> acredita que voce vai adorar o IMPACT7 - a plataforma que transforma impacto social com ciencia.</p>
            <div class="highlight">
              <p><strong>Beneficios exclusivos do convite:</strong></p>
              <ul>
                <li>14 dias de trial gratuito</li>
                <li>20% de desconto no primeiro mes</li>
                <li>Acesso a calculadora S-ROI</li>
                <li>Mentoria com Jarvis AI</li>
              </ul>
            </div>
            <p style="text-align: center; margin-top: 24px;">
              <a href="{{signupUrl}}?ref={{inviteCode}}" class="button">Aceitar Convite</a>
            </p>
            <p style="text-align: center; color: #71717a; font-size: 14px;">
              Codigo: <strong>{{inviteCode}}</strong>
            </p>
          </div>
          <div class="footer">
            <p>IMPACT7 - Transformando Impacto Social com Ciencia</p>
          </div>
        </div>
      </body>
      </html>
    `, vars),
    text: `${vars.referrerName} te convidou para o IMPACT7! Use o codigo ${vars.inviteCode}. Cadastre-se: ${vars.signupUrl}`,
  }),
};

// ============================================================================
// FUNCOES AUXILIARES
// ============================================================================

/**
 * Obter template por nome
 */
export function getEmailTemplate(
  templateName: keyof typeof EMAIL_TEMPLATES,
  variables: any
): EmailTemplate {
  const templateFn = EMAIL_TEMPLATES[templateName];
  if (!templateFn) {
    throw new Error(`Template de email nao encontrado: ${templateName}`);
  }
  return templateFn(variables);
}

/**
 * Validar variaveis de template
 */
export function validateTemplateVariables(
  templateName: string,
  variables: TemplateVariables
): { valid: boolean; missing: string[] } {
  const requiredVars: Record<string, string[]> = {
    welcome: ['userName', 'loginUrl'],
    calculationComplete: ['userName', 'projectName', 'sRoi', 'impactScore', 'dashboardUrl'],
    trialEnding: ['userName', 'daysLeft', 'upgradeUrl'],
    newCaseSubmission: ['organizationName', 'sector', 'submitterEmail', 'adminUrl'],
    paymentConfirmed: ['userName', 'planName', 'amount', 'nextBillingDate', 'invoiceUrl'],
    weeklyDigest: ['userName', 'calculationsCount', 'casesViewed', 'jarvisChats', 'dashboardUrl'],
    securityAlert: ['userName', 'alertType', 'ipAddress', 'location', 'timestamp', 'securityUrl'],
    referralInvite: ['referrerName', 'inviteCode', 'signupUrl'],
  };

  const required = requiredVars[templateName] || [];
  const missing = required.filter(key => !(key in variables));

  return {
    valid: missing.length === 0,
    missing,
  };
}

export default EMAIL_TEMPLATES;
