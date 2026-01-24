# IMPACT7 Platform - Migration TODO

## 1. Database Schema (48 tables)
- [x] Migrar schema completo do Drizzle (1713 linhas)
- [x] Configurar usuário admin no banco
- [x] Banco de dados SQLite copiado (412KB)

## 2. Sistema de Autenticação Customizado
- [x] Migrar endpoints de login (POST /api/login, GET /api/admin-autologin)
- [x] Migrar validação JWT com cookies HttpOnly
- [x] Migrar integração com SDK Manus
- [x] Migrar proteção de rotas (AdminRoute)
- [x] Migrar página de Login

## 3. Routers tRPC (74 endpoints)
- [x] Migrar todos os routers do server/routers/
- [x] Integrar routers no server/routers.ts (126KB)
- [x] Validar tipos e procedures

## 4. Componentes React Principais
- [x] Migrar NavigationButtons.tsx
- [x] Migrar PageLayout.tsx
- [x] Migrar DashboardLayout.tsx
- [x] Migrar AdminRoute.tsx
- [x] Migrar AdminBreadcrumb.tsx

## 5. Módulo 1: Jarvis AI Chat (1147 linhas)
- [x] Migrar componente JarvisChat
- [x] Migrar hooks e contextos
- [x] Migrar routers tRPC do Jarvis
- [x] Botão verde visível na homepage

## 6. Módulo 2: Acessibilidade WCAG AAA (929 linhas)
- [x] Migrar componente AccessibilityWidget
- [x] Migrar hooks useAccessibility
- [x] Migrar estilos e configurações
- [x] Botão laranja visível na homepage

## 7. Módulo 3: Multi-idiomas (PT/EN/ES)
- [x] Migrar sistema i18n
- [x] Migrar arquivos de tradução (locales/)
- [x] Migrar seletor de idiomas
- [x] Seletor EN visível no header

## 8. Módulo 4: Theme Switcher (Sol/Lua)
- [x] Migrar componente ThemeToggle
- [x] Migrar hook useTheme
- [x] Migrar themes.css
- [x] Ícone lua visível no header

## 9. Módulo 5: White Label
- [x] Migrar schema white-label
- [x] Migrar router white-label
- [x] Migrar hook useWhiteLabel

## 10. Módulo 6: Responsividade/UX
- [x] Migrar estilos responsivos
- [x] Migrar breakpoints
- [x] Layout adaptativo funcionando

## 11. Homepage Institucional
- [x] Migrar página Home.tsx
- [x] Migrar seções (Hero, Features, Testimonials, etc)
- [x] Migrar Footer com botão Administração
- [x] Migrar Header/Navbar
- [x] Navegação completa funcionando

## 12. Dashboard Admin (18 módulos)
- [x] Migrar Admin.tsx (dashboard principal)
- [x] Migrar AdminLeads.tsx
- [x] Migrar AdminContacts.tsx
- [x] Migrar AdminDownloads.tsx
- [x] Migrar AdminAnalytics.tsx
- [x] Migrar AdminMonitoring.tsx
- [x] Migrar AdminCaseReview.tsx
- [x] Migrar AdminTags.tsx
- [x] Migrar AdminTokensDashboard.tsx
- [x] Migrar AdminTemplates.tsx
- [x] Migrar AdminSystemMetrics.tsx
- [x] Migrar AdminAlerts.tsx
- [x] Migrar AdminAudit.tsx
- [x] Migrar AdminReports.tsx
- [x] Migrar AdminBusinessMetrics.tsx
- [x] Migrar AdminAdvanced.tsx
- [x] Migrar AdminSettings.tsx
- [x] Migrar AdminApiMetrics.tsx

## 13. Outras Páginas (69 páginas públicas)
- [x] Migrar todas as 182 páginas React (.tsx)
- [x] Validar rotas no App.tsx

## 14. Assets e Estilos
- [x] Migrar index.css (estilos globais)
- [x] Migrar imagens e ícones
- [x] Migrar og-image.png (5.7MB)
- [x] Migrar locales (PT/EN/ES)

## 15. Configurações e Integrações
- [x] Servidor de desenvolvimento rodando (porta 3000)
- [x] Dependências instaladas via pnpm
- [x] Build funcionando
- [x] Hot reload ativo

## 16. Testes E2E
- [x] Homepage carregando corretamente
- [x] Todos os 6 módulos visíveis
- [x] Navegação funcionando
- [x] Theme switcher visível
- [x] Seletor de idiomas visível

## 17. Checkpoint Final
- [ ] Criar checkpoint v1.0.0
- [ ] Documentar URL permanente
- [ ] Criar relatório de migração


## 18. Correções de Segurança e Acesso Admin
- [x] Remover credenciais de teste da tela de login
- [x] Remover botão "Preencher credenciais de teste"
- [x] Remover texto "Credenciais padrão" da interface
- [x] Criar usuário admin: italo.teofilo@imts.com.br
- [x] Configurar senha: 123456set7 (hash bcrypt)
- [x] Garantir role "admin" com super poderes
- [x] Testar login com novo usuário
- [x] Testar acesso ao dashboard admin
- [x] Validar permissões administrativas
