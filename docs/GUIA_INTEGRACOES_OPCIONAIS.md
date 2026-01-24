# Guia de Configuração de Integrações Opcionais

Este guia explica como configurar integrações opcionais no sistema IMPACT7.

---

## 🔐 Stripe (Pagamentos)

O sistema já está preparado para integração com Stripe. Para ativar:

### 1. Obter Chave Secreta do Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Developers → API keys**
3. Copie a **Secret key** (começa com `sk_`)

### 2. Configurar no Sistema

1. Abra o **Management UI** (painel direito)
2. Vá em **Settings → Secrets**
3. Clique em **Add Secret**
4. Adicione:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_...` (sua chave secreta)
5. Clique em **Save**

### 3. Verificar Integração

O sistema detectará automaticamente a chave e ativará:
- ✅ Checkout de planos (Pro, Enterprise)
- ✅ Portal de gerenciamento de assinaturas
- ✅ Webhooks para eventos de pagamento

**Código já implementado em:** `server/stripe/stripe-service.ts`

---

## 📧 SMTP (Emails Transacionais)

O sistema pode enviar emails transacionais (notificações, alertas, etc). Para ativar:

### 1. Escolher Provedor SMTP

Recomendações:
- **SendGrid** (gratuito até 100 emails/dia)
- **Mailgun** (gratuito até 5.000 emails/mês)
- **Amazon SES** (US$ 0.10 por 1.000 emails)
- **Gmail SMTP** (gratuito, limite de 500 emails/dia)

### 2. Obter Credenciais SMTP

Exemplo com SendGrid:
1. Acesse [SendGrid](https://sendgrid.com/)
2. Vá em **Settings → API Keys**
3. Crie uma nova API key
4. Copie a chave

### 3. Configurar no Sistema

1. Abra o **Management UI** (painel direito)
2. Vá em **Settings → Secrets**
3. Adicione as seguintes secrets:
   - `SMTP_HOST`: `smtp.sendgrid.net`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `apikey`
   - `SMTP_PASS`: `SG.xxxxx` (sua API key)
   - `SMTP_FROM`: `noreply@seudominio.com`

### 4. Verificar Integração

O sistema detectará automaticamente as credenciais e ativará:
- ✅ Notificações por email
- ✅ Alertas de sistema
- ✅ Emails de boas-vindas
- ✅ Relatórios automáticos

**Código já implementado em:** `server/services/email/`

---

## 🔔 Notificações Push (Opcional)

Para ativar notificações push no navegador:

1. Nenhuma configuração adicional necessária
2. O sistema já está preparado para solicitar permissão ao usuário
3. Notificações funcionam via SSE (Server-Sent Events)

**Código já implementado em:** `server/services/notifications/push-notification-service.ts`

---

## ✅ Status das Integrações

Você pode verificar o status das integrações em:
- **Admin Dashboard → System Health**
- Logs do servidor em `.manus-logs/devserver.log`

---

## 📚 Documentação Adicional

- [Stripe API Docs](https://stripe.com/docs/api)
- [SendGrid SMTP Docs](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun SMTP Docs](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
