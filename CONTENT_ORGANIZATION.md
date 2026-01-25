# Reorganização de Conteúdos: Público vs Administração

## ✅ CONTEÚDOS PÚBLICOS (Acesso sem login)

### Marketing & Institucional
- `/` - Homepage
- `/sobre` - Sobre a empresa
- `/metodologia` - Metodologia IMPACT7
- `/ciencia` - Base científica
- `/matematica` - Modelagem matemática
- `/tecnologia` - Tecnologia SET7
- `/depoimentos` - Depoimentos de clientes
- `/cases` - Casos de sucesso (visualização)
- `/casos-sucesso` - Galeria de casos
- `/parceiros` - Parceiros e certificações
- `/certificacoes` - Certificações

### Recursos & Conteúdo
- `/whitepaper` - Download de whitepaper
- `/blog` - Blog/artigos
- `/recursos` - Centro de recursos
- `/glossario` - Glossário de termos
- `/faq` - FAQ público
- `/faq-interativo` - FAQ interativo
- `/guia-inicio` - Guia de início rápido

### Comercial
- `/precos` - Planos e preços
- `/demo` - Solicitar demonstração
- `/comparacao` - Comparação com concorrentes
- `/early-adopters` - Programa early adopters
- `/webinars` - Webinars públicos

### Ferramentas Públicas
- `/calculadora` - Calculadora de impacto (acesso público)
- `/contato` - Formulário de contato
- `/newsletter` - Inscrição newsletter

### Institucional/Legal
- `/termos-de-uso` - Termos de uso
- `/politica-privacidade` - Política de privacidade
- `/seguranca` - Segurança e conformidade
- `/status` - Status dos serviços
- `/changelog` - Histórico de mudanças
- `/roadmap` - Roadmap público
- `/carreiras` - Vagas e carreiras

### Autenticação
- `/login` - Login
- `/register` - Registro
- `/forgot-password` - Recuperar senha

---

## 🔒 ÁREA ADMINISTRATIVA (Requer login + permissões)

### Gerenciamento de Usuários (admin only)
- `/admin/users` - **NOVO** Gerenciamento RBAC de usuários
- `/admin/audit` - Auditoria de ações

### Analytics & Métricas (admin/manager)
- `/admin/analytics` - Analytics geral
- `/admin/monitoring` - Monitoramento do sistema
- `/admin/business` - Métricas de negócio
- `/admin/system-metrics` - Métricas de sistema
- `/admin/api-metrics` - Métricas de API

### Conteúdo & Leads (manager)
- `/admin/cases` - Revisão de casos submetidos
- `/admin/leads` - Gerenciamento de leads
- `/admin/downloads` - Downloads de materiais
- `/admin/contacts` - Contatos recebidos
- `/admin/tags` - Gerenciamento de tags

### Sistema (admin only)
- `/admin/settings` - Configurações do sistema
- `/admin/notifications` - Configurações de notificações
- `/admin/templates` - Templates de email/docs
- `/admin/alerts` - Alertas do sistema
- `/admin/advanced` - Configurações avançadas
- `/admin/reports` - Relatórios gerenciais
- `/admin/set7` - Dashboard SET7

---

## 👤 ÁREA DO USUÁRIO (Requer login)

### Perfil & Configurações
- `/profile` - Perfil do usuário
- `/security` - Segurança da conta
- `/notification-preferences` - Preferências de notificação
- `/notificacoes` - Central de notificações

### Ferramentas do Usuário
- `/dashboard` - Dashboard pessoal
- `/impact-dashboard` - Dashboard de impacto
- `/calculadora` - Calculadora (com histórico para logados)
- `/favorites` - Favoritos salvos
- `/case-submit` - Submeter caso de sucesso
- `/case-compare` - Comparar casos
- `/meus-certificados` - Certificados do usuário
- `/certificate-verify` - Verificar certificado

### Jarvis (Assistente IA)
- `/jarvis` - Chat com Jarvis
- `/jarvis-reports` - Relatórios Jarvis
- `/jarvis-memory` - Memória do Jarvis

### API & Integrações (developers)
- `/api-keys` - Gerenciar API keys
- `/webhooks` - Configurar webhooks
- `/oauth-clients` - OAuth clients
- `/api-docs` - Documentação da API
- `/api-playground` - Playground da API
- `/api-changelog` - Changelog da API
- `/api-status` - Status da API

### Pagamentos & Assinaturas
- `/payments` - Histórico de pagamentos
- `/checkout-success` - Confirmação de compra
- `/impact-tokens` - Tokens de impacto
- `/referrals` - Programa de indicações

### Onboarding & Suporte
- `/onboarding` - Onboarding inicial
- `/suporte` - Central de suporte
- `/comunidade` - Comunidade de usuários
- `/integracoes` - Integrações disponíveis

---

## 📊 RESUMO DE REORGANIZAÇÃO

### Páginas que devem ser PÚBLICAS (atualmente podem estar protegidas):
- ✅ Homepage, About, Metodologia, Ciência, Matemática, Tecnologia
- ✅ Whitepaper, Blog, Recursos, Glossário, FAQ
- ✅ Preços, Demo, Comparação, Webinars
- ✅ Calculadora (versão básica sem histórico)
- ✅ Contato, Newsletter
- ✅ Termos, Privacidade, Segurança, Status

### Páginas que devem ser PROTEGIDAS (requerem login):
- 🔒 Dashboard, Profile, Security, Notifications
- 🔒 Jarvis (todas as páginas)
- 🔒 API Keys, Webhooks, OAuth
- 🔒 Payments, Tokens, Referrals
- 🔒 Case Submit, Favorites, Meus Certificados

### Páginas que devem ser ADMIN-ONLY:
- 🔐 /admin/users (gerenciamento RBAC)
- 🔐 /admin/settings, /admin/advanced
- 🔐 /admin/audit, /admin/system-metrics
- 🔐 /admin/set7

### Páginas que devem ser MANAGER+:
- 📊 /admin/analytics, /admin/monitoring
- 📊 /admin/cases, /admin/leads
- 📊 /admin/contacts, /admin/downloads

---

## 🎯 AÇÕES RECOMENDADAS

1. **Remover proteção de autenticação** das páginas públicas
2. **Adicionar middleware RBAC** nas rotas admin
3. **Criar página de "Acesso Negado"** para usuários sem permissão
4. **Adicionar indicadores visuais** de conteúdo protegido
5. **Implementar preview limitado** para usuários não logados (ex: calculadora básica)
