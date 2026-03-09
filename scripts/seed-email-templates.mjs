import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const now = Date.now();

const templates = [
  {
    templateName: 'welcome',
    subject: 'Bem-vindo(a) à IMPACT7 — Sua jornada de impacto começa agora!',
    variables: JSON.stringify(['userName', 'loginUrl']),
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Bem-vindo à IMPACT7</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
      <h1 style="color: #00d4ff; margin: 0; font-size: 28px;">IMPACT7</h1>
      <p style="color: #a0a0b0; margin: 8px 0 0;">Plataforma de Inovação Social Exponencial</p>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #1a1a2e;">Olá, {{userName}}!</h2>
      <p style="color: #444; line-height: 1.6;">Seja bem-vindo(a) à IMPACT7 — a plataforma que conecta metodologia, tecnologia e impacto social real.</p>
      <p style="color: #444; line-height: 1.6;">Você agora tem acesso a:</p>
      <ul style="color: #444; line-height: 1.8;">
        <li>Calculadora S-ROI para medir o retorno social dos seus projetos</li>
        <li>Dashboard de Impacto com visualizações em tempo real</li>
        <li>Biblioteca de cases de sucesso nacionais e internacionais</li>
        <li>Comunidade de profissionais de impacto social</li>
        <li>Cursos e trilhas de aprendizado do Método IMPACT7</li>
      </ul>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{loginUrl}}" style="background: #00d4ff; color: #1a1a2e; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Acessar a Plataforma</a>
      </div>
      <p style="color: #888; font-size: 14px;">Se você não criou esta conta, ignore este email.</p>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">© 2025 IMPACT7 — Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Bem-vindo(a) à IMPACT7, {{userName}}!\n\nSua conta foi criada com sucesso. Acesse a plataforma em: {{loginUrl}}\n\nSe você não criou esta conta, ignore este email.\n\n© 2025 IMPACT7`,
  },
  {
    templateName: 'password_reset',
    subject: 'IMPACT7 — Redefinição de senha solicitada',
    variables: JSON.stringify(['userName', 'resetUrl', 'expiresIn']),
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Redefinição de Senha — IMPACT7</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
      <h1 style="color: #00d4ff; margin: 0; font-size: 28px;">IMPACT7</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #1a1a2e;">Redefinição de Senha</h2>
      <p style="color: #444; line-height: 1.6;">Olá, {{userName}}!</p>
      <p style="color: #444; line-height: 1.6;">Recebemos uma solicitação para redefinir a senha da sua conta IMPACT7. Clique no botão abaixo para criar uma nova senha:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{resetUrl}}" style="background: #ff6b35; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Redefinir Minha Senha</a>
      </div>
      <p style="color: #888; font-size: 14px;">Este link expira em {{expiresIn}}. Se você não solicitou a redefinição de senha, ignore este email — sua senha permanece a mesma.</p>
      <p style="color: #888; font-size: 12px; word-break: break-all;">Ou copie e cole este link no seu navegador: {{resetUrl}}</p>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">© 2025 IMPACT7 — Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Redefinição de Senha — IMPACT7\n\nOlá, {{userName}}!\n\nClique no link para redefinir sua senha: {{resetUrl}}\n\nEste link expira em {{expiresIn}}.\n\nSe você não solicitou a redefinição, ignore este email.\n\n© 2025 IMPACT7`,
  },
  {
    templateName: 'lead_confirmation',
    subject: 'IMPACT7 — Recebemos seu contato!',
    variables: JSON.stringify(['leadName', 'organization']),
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Confirmação de Contato — IMPACT7</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
      <h1 style="color: #00d4ff; margin: 0; font-size: 28px;">IMPACT7</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #1a1a2e;">Recebemos seu contato!</h2>
      <p style="color: #444; line-height: 1.6;">Olá, {{leadName}}!</p>
      <p style="color: #444; line-height: 1.6;">Obrigado pelo interesse da <strong>{{organization}}</strong> na IMPACT7. Nossa equipe analisará seu perfil e entrará em contato em até 2 dias úteis.</p>
      <p style="color: #444; line-height: 1.6;">Enquanto isso, explore nossos recursos gratuitos:</p>
      <ul style="color: #444; line-height: 1.8;">
        <li><a href="https://impact7.com.br/calculadora" style="color: #00d4ff;">Calculadora S-ROI gratuita</a></li>
        <li><a href="https://impact7.com.br/recursos" style="color: #00d4ff;">Whitepapers e relatórios</a></li>
        <li><a href="https://impact7.com.br/blog" style="color: #00d4ff;">Blog com artigos sobre impacto social</a></li>
      </ul>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">© 2025 IMPACT7 — Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Recebemos seu contato, {{leadName}}!\n\nObrigado pelo interesse da {{organization}} na IMPACT7. Nossa equipe entrará em contato em até 2 dias úteis.\n\n© 2025 IMPACT7`,
  },
  {
    templateName: 'new_lead_admin',
    subject: 'IMPACT7 Admin — Novo lead: {{leadName}} ({{organization}})',
    variables: JSON.stringify(['leadName', 'organization', 'email', 'phone', 'message', 'adminUrl']),
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Novo Lead — IMPACT7 Admin</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #1a1a2e; padding: 24px; text-align: center;">
      <h1 style="color: #00d4ff; margin: 0; font-size: 20px;">IMPACT7 — Novo Lead</h1>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; color: #888; width: 140px;">Nome:</td><td style="padding: 8px; color: #222; font-weight: bold;">{{leadName}}</td></tr>
        <tr style="background: #f9f9f9;"><td style="padding: 8px; color: #888;">Organização:</td><td style="padding: 8px; color: #222;">{{organization}}</td></tr>
        <tr><td style="padding: 8px; color: #888;">Email:</td><td style="padding: 8px; color: #222;">{{email}}</td></tr>
        <tr style="background: #f9f9f9;"><td style="padding: 8px; color: #888;">Telefone:</td><td style="padding: 8px; color: #222;">{{phone}}</td></tr>
        <tr><td style="padding: 8px; color: #888; vertical-align: top;">Mensagem:</td><td style="padding: 8px; color: #222;">{{message}}</td></tr>
      </table>
      <div style="text-align: center; margin: 24px 0;">
        <a href="{{adminUrl}}" style="background: #00d4ff; color: #1a1a2e; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ver no Admin</a>
      </div>
    </div>
  </div>
</body>
</html>`,
    textContent: `Novo Lead — IMPACT7\n\nNome: {{leadName}}\nOrganização: {{organization}}\nEmail: {{email}}\nTelefone: {{phone}}\nMensagem: {{message}}\n\nVer no admin: {{adminUrl}}`,
  },
  {
    templateName: 'event_registration',
    subject: 'IMPACT7 — Inscrição confirmada: {{eventTitle}}',
    variables: JSON.stringify(['userName', 'eventTitle', 'eventDate', 'eventLocation', 'eventUrl']),
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Inscrição Confirmada — IMPACT7</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
      <h1 style="color: #00d4ff; margin: 0; font-size: 28px;">IMPACT7</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #1a1a2e;">Inscrição Confirmada!</h2>
      <p style="color: #444; line-height: 1.6;">Olá, {{userName}}!</p>
      <p style="color: #444; line-height: 1.6;">Sua inscrição no evento <strong>{{eventTitle}}</strong> foi confirmada.</p>
      <div style="background: #f0f9ff; border-left: 4px solid #00d4ff; padding: 16px; margin: 24px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; color: #1a1a2e;"><strong>Data:</strong> {{eventDate}}</p>
        <p style="margin: 8px 0 0; color: #1a1a2e;"><strong>Local:</strong> {{eventLocation}}</p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{eventUrl}}" style="background: #00d4ff; color: #1a1a2e; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Ver Detalhes do Evento</a>
      </div>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">© 2025 IMPACT7 — Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Inscrição Confirmada — {{eventTitle}}\n\nOlá, {{userName}}!\n\nSua inscrição foi confirmada.\nData: {{eventDate}}\nLocal: {{eventLocation}}\n\nDetalhes: {{eventUrl}}\n\n© 2025 IMPACT7`,
  },
  {
    templateName: 'course_enrollment',
    subject: 'IMPACT7 — Matrícula confirmada: {{courseTitle}}',
    variables: JSON.stringify(['userName', 'courseTitle', 'courseUrl', 'instructor']),
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Matrícula Confirmada — IMPACT7</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; text-align: center;">
      <h1 style="color: #00d4ff; margin: 0; font-size: 28px;">IMPACT7</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #1a1a2e;">Matrícula Confirmada!</h2>
      <p style="color: #444; line-height: 1.6;">Olá, {{userName}}!</p>
      <p style="color: #444; line-height: 1.6;">Você está matriculado(a) no curso <strong>{{courseTitle}}</strong> com o instrutor {{instructor}}. Bons estudos!</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{courseUrl}}" style="background: #00d4ff; color: #1a1a2e; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Começar o Curso</a>
      </div>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">© 2025 IMPACT7 — Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Matrícula Confirmada — {{courseTitle}}\n\nOlá, {{userName}}!\n\nVocê está matriculado(a) no curso {{courseTitle}} com {{instructor}}.\n\nAcesse: {{courseUrl}}\n\n© 2025 IMPACT7`,
  },
];

for (const t of templates) {
  await conn.execute(
    'INSERT INTO emailTemplates (templateName, subject, htmlContent, textContent, variables, isActive, createdAt, updatedAt) VALUES (?,?,?,?,?,1,?,?)',
    [t.templateName, t.subject, t.htmlContent, t.textContent, t.variables, now, now]
  );
}

console.log('✅ ' + templates.length + ' templates de email inseridos');
await conn.end();
