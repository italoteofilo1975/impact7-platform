/**
 * User Email Service — IMPACT7
 *
 * Envia emails transacionais ao usuário usando o canal disponível:
 * 1. Forge API SendEmail (quando disponível)
 * 2. Fallback: notifyOwner com link para o admin repassar ao usuário
 *
 * Quando E4 (Resend.com) for configurado, substituir sendEmailToUser
 * por chamada direta à API Resend.
 */
import { ENV } from '../../_core/env';
import { notifyOwner } from '../../_core/notification';

export interface EmailPayload {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Tenta enviar email ao usuário via Forge API SendEmail.
 * Se não disponível, usa notifyOwner como fallback (owner recebe e repassa).
 */
export async function sendEmailToUser(payload: EmailPayload): Promise<boolean> {
  const { to, toName, subject, html, text } = payload;

  // Tentar Forge API SendEmail
  if (ENV.forgeApiUrl && ENV.forgeApiKey) {
    try {
      const baseUrl = ENV.forgeApiUrl.endsWith('/') ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
      const endpoint = new URL('webdevtoken.v1.WebDevService/SendEmail', baseUrl).toString();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'connect-protocol-version': '1',
          authorization: `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({ to, toName, subject, html, text }),
      });

      if (response.ok) {
        console.log(`[UserEmail] Email enviado para ${to}: ${subject}`);
        return true;
      }
    } catch (err) {
      console.warn('[UserEmail] Forge SendEmail falhou, usando fallback:', err);
    }
  }

  // Fallback: notifyOwner com o conteúdo para o admin repassar
  try {
    const plainText = text || html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    await notifyOwner({
      title: `📧 Email para usuário: ${subject}`,
      content: `Destinatário: ${toName ? `${toName} <${to}>` : to}\n\nAssunto: ${subject}\n\n${plainText.slice(0, 2000)}`,
    });
    console.log(`[UserEmail] Fallback notifyOwner enviado para ${to}: ${subject}`);
    return true;
  } catch (fallbackErr) {
    console.error('[UserEmail] Fallback também falhou:', fallbackErr);
    return false;
  }
}

/**
 * Email de recuperação de senha
 */
export async function sendPasswordResetEmail(
  to: string,
  toName: string | null,
  resetUrl: string
): Promise<boolean> {
  const displayName = toName || to.split('@')[0];
  return sendEmailToUser({
    to,
    toName: toName || undefined,
    subject: 'Recuperação de senha — IMPACT7',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #111; border-radius: 12px; overflow: hidden; border: 1px solid #222;">
    <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 24px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
        <span style="font-size: 28px; font-weight: 900; color: white;">7</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">IMPACT7</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #f5f5f5; margin: 0 0 12px; font-size: 20px;">Recuperação de senha</h2>
      <p style="color: #a3a3a3; margin: 0 0 24px; line-height: 1.6;">
        Olá, <strong style="color: #e5e5e5;">${displayName}</strong>!<br><br>
        Recebemos uma solicitação para redefinir a senha da sua conta IMPACT7.
        Clique no botão abaixo para criar uma nova senha:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
          Redefinir minha senha
        </a>
      </div>
      <p style="color: #737373; font-size: 13px; margin: 24px 0 0; line-height: 1.6;">
        Este link é válido por <strong>1 hora</strong>. Se você não solicitou a recuperação de senha, ignore este email — sua senha permanece a mesma.<br><br>
        Ou copie e cole este link no navegador:<br>
        <a href="${resetUrl}" style="color: #f97316; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
    <div style="padding: 16px 24px; border-top: 1px solid #222; text-align: center;">
      <p style="color: #525252; font-size: 12px; margin: 0;">© 2026 IMPACT7 · Plataforma de Inovação Social Exponencial</p>
    </div>
  </div>
</body>
</html>`,
    text: `Recuperação de senha — IMPACT7\n\nOlá, ${displayName}!\n\nClique no link abaixo para redefinir sua senha (válido por 1 hora):\n${resetUrl}\n\nSe não foi você, ignore este email.`,
  });
}

/**
 * Email de boas-vindas após registro
 */
export async function sendWelcomeEmail(
  to: string,
  toName: string | null
): Promise<boolean> {
  const displayName = toName || to.split('@')[0];
  return sendEmailToUser({
    to,
    toName: toName || undefined,
    subject: 'Bem-vindo à plataforma IMPACT7!',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; margin: 0; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #111; border-radius: 12px; overflow: hidden; border: 1px solid #222;">
    <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 24px; text-align: center;">
      <span style="font-size: 28px; font-weight: 900; color: white;">IMPACT7</span>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #f5f5f5; margin: 0 0 12px;">Bem-vindo, ${displayName}! 🎉</h2>
      <p style="color: #a3a3a3; line-height: 1.6;">
        Sua conta foi criada com sucesso na plataforma IMPACT7 — a plataforma de Inovação Social Exponencial baseada no Método SET7.<br><br>
        Explore a calculadora de S-ROI, os cases de impacto, os cursos e a comunidade.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://impact7plat-5ljsracn.manus.space" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; display: inline-block;">
          Acessar a plataforma
        </a>
      </div>
    </div>
    <div style="padding: 16px 24px; border-top: 1px solid #222; text-align: center;">
      <p style="color: #525252; font-size: 12px; margin: 0;">© 2026 IMPACT7 · Plataforma de Inovação Social Exponencial</p>
    </div>
  </div>
</body>
</html>`,
    text: `Bem-vindo à IMPACT7, ${displayName}! Sua conta foi criada com sucesso. Acesse: https://impact7plat-5ljsracn.manus.space`,
  });
}
