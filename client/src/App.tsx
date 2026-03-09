import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "@/styles/themes.css";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { lazy, Suspense, useEffect } from "react";

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Critical pages - loaded immediately
import Home from "./pages/Home";
import Calculadora from "./pages/Calculadora";
import Cases from "./pages/Cases";
import Contato from "./pages/Contato";

// Secondary pages - lazy loaded
const Ciencia = lazy(() => import("./pages/Ciencia"));
const Matematica = lazy(() => import("./pages/Matematica"));
const Tecnologia = lazy(() => import("./pages/Tecnologia"));
const Favorites = lazy(() => import("./pages/Favorites"));
const CaseSubmit = lazy(() => import("./pages/CaseSubmit"));
const Whitepaper = lazy(() => import("./pages/Whitepaper"));
const CaseCompare = lazy(() => import("./pages/CaseCompare"));
const Profile = lazy(() => import("./pages/Profile"));
const ImpactDashboard = lazy(() => import("./pages/ImpactDashboard"));
const Precos = lazy(() => import("./pages/Precos"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Payments = lazy(() => import("./pages/Payments"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Suporte = lazy(() => import("./pages/Suporte"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Sobre = lazy(() => import("./pages/Sobre"));
const Blog = lazy(() => import("./pages/Blog"));
const Parceiros = lazy(() => import("./pages/Parceiros"));
const Carreiras = lazy(() => import("./pages/Carreiras"));
const Busca = lazy(() => import("./pages/Busca"));
const Status = lazy(() => import("./pages/Status"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Seguranca = lazy(() => import("./pages/Seguranca"));
const Integracoes = lazy(() => import("./pages/Integracoes"));
const Webinars = lazy(() => import("./pages/Webinars"));
const Comunidade = lazy(() => import("./pages/Comunidade"));
const Forum = lazy(() => import("./pages/Forum"));
const Recursos = lazy(() => import("./pages/Recursos"));
const Depoimentos = lazy(() => import("./pages/Depoimentos"));
const Demo = lazy(() => import("./pages/Demo"));
const Comparacao = lazy(() => import("./pages/Comparacao"));
const CasosSucesso = lazy(() => import("./pages/CasosSucesso"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const Metodologia = lazy(() => import("./pages/Metodologia"));
const Glossario = lazy(() => import("./pages/Glossario"));
const Certificacoes = lazy(() => import("./pages/Certificacoes"));
const GuiaInicio = lazy(() => import("./pages/GuiaInicio"));
const FAQInterativo = lazy(() => import("./pages/FAQInterativo"));
const EarlyAdopters = lazy(() => import("./pages/EarlyAdopters"));
const Notificacoes = lazy(() => import("./pages/Notificacoes"));
const NotificationPreferences = lazy(() => import("./pages/NotificationPreferences"));
const ConformidadeSET7 = lazy(() => import("./pages/ConformidadeSET7"));
const Cursos = lazy(() => import("./pages/Cursos"));
const CursoAula = lazy(() => import("./pages/CursoAula"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const Login = lazy(() => import("./pages/Login"));
const LoginLocal = lazy(() => import("./pages/LoginLocal"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MeusCertificados = lazy(() => import("./pages/MeusCertificados"));

// API & Developer pages - lazy loaded
const Security = lazy(() => import("./pages/Security"));
const Verify2FA = lazy(() => import("./pages/Verify2FA"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const Webhooks = lazy(() => import("./pages/Webhooks"));
const OAuthClients = lazy(() => import("./pages/OAuthClients"));
const OAuthAuthorize = lazy(() => import("./pages/OAuthAuthorize"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const ApiPlayground = lazy(() => import("./pages/ApiPlayground"));
const ApiChangelog = lazy(() => import("./pages/ApiChangelog"));
const ApiStatus = lazy(() => import("./pages/ApiStatus"));
const CertificateVerify = lazy(() => import("./pages/CertificateVerify"));

// Jarvis pages - lazy loaded
const JarvisReports = lazy(() => import("./pages/JarvisReports"));
const JarvisMemory = lazy(() => import("./pages/JarvisMemory"));
const ImpactTokens = lazy(() => import("./pages/ImpactTokens"));

// Admin pages - lazy loaded
const Admin = lazy(() => import("./pages/Admin"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminMonitoring = lazy(() => import("./pages/AdminMonitoring"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const AdminCaseReview = lazy(() => import("./pages/AdminCaseReview"));
const AdminTags = lazy(() => import("./pages/AdminTags"));
const AdminApiMetrics = lazy(() => import("./pages/AdminApiMetrics"));
const AdminTokensDashboard = lazy(() => import("./pages/AdminTokensDashboard"));
const AdminAdvanced = lazy(() => import("./pages/AdminAdvanced"));
const AdminSystemMetrics = lazy(() => import("./pages/AdminSystemMetrics"));
const AdminTemplates = lazy(() => import("./pages/AdminTemplates"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));
const AdminDownloads = lazy(() => import("./pages/AdminDownloads"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminContacts = lazy(() => import("./pages/AdminContacts"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const AdminCareers = lazy(() => import("./pages/AdminCareers"));
const AdminPages = lazy(() => import("./pages/AdminPages"));
const AdminErrorLogs = lazy(() => import("./pages/AdminErrorLogs"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminBusinessMetrics = lazy(() => import("./pages/AdminBusinessMetrics"));
const AdminAlerts = lazy(() => import("./pages/AdminAlerts"));
const Set7Dashboard = lazy(() => import("./pages/admin/Set7Dashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));

// Components
import JarvisChat from "./components/JarvisChat";
import AccessibilityWidget from "./components/AccessibilityWidget";
import { useWhiteLabel } from "./hooks/useWhiteLabel";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { SkipLink } from "./components/Accessibility";
import { AdminRoute } from "./components/AdminRoute";

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public Pages - Critical (no lazy) */}
        <Route path="/" component={Home} />
        <Route path="/calculadora" component={Calculadora} />
        <Route path="/cases" component={Cases} />
        <Route path="/contato" component={Contato} />
        
        {/* Public Pages - Secondary (lazy loaded) */}
        <Route path="/ciencia" component={Ciencia} />
        <Route path="/matematica" component={Matematica} />
        <Route path="/tecnologia" component={Tecnologia} />
        <Route path="/cases/submit" component={CaseSubmit} />
        <Route path="/cases/compare" component={CaseCompare} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/profile" component={Profile} />
        <Route path="/impacto" component={ImpactDashboard} />
        <Route path="/security" component={Security} />
        <Route path="/verify-2fa" component={Verify2FA} />
        <Route path="/api-keys" component={ApiKeys} />
        <Route path="/webhooks" component={Webhooks} />
        <Route path="/oauth-clients" component={OAuthClients} />
        <Route path="/oauth/authorize" component={OAuthAuthorize} />
        <Route path="/api/docs" component={ApiDocs} />
        <Route path="/api-docs" component={ApiDocs} />
        <Route path="/api/playground" component={ApiPlayground} />
        <Route path="/api/changelog" component={ApiChangelog} />
        <Route path="/admin/api-metrics">{() => <AdminRoute><AdminApiMetrics /></AdminRoute>}</Route>
        <Route path="/api/status" component={ApiStatus} />
        <Route path="/certificados/verificar" component={CertificateVerify} />
        <Route path="/jarvis/relatorios" component={JarvisReports} />
        <Route path="/jarvis/memorias" component={JarvisMemory} />
        <Route path="/tokens" component={ImpactTokens} />
        <Route path="/admin/tokens">{() => <AdminRoute><AdminTokensDashboard /></AdminRoute>}</Route>
        <Route path="/admin/avancado">{() => <AdminRoute><AdminAdvanced /></AdminRoute>}</Route>
        <Route path="/admin/metricas">{() => <AdminRoute><AdminSystemMetrics /></AdminRoute>}</Route>
        <Route path="/admin/alertas">{() => <AdminRoute><AdminAlerts /></AdminRoute>}</Route>
        <Route path="/admin/templates">{() => <AdminRoute><AdminTemplates /></AdminRoute>}</Route>
        <Route path="/conformidade" component={ConformidadeSET7} />
        <Route path="/notificacoes" component={Notificacoes} />
        <Route path="/notificacoes/preferencias" component={NotificationPreferences} />
        <Route path="/whitepaper" component={Whitepaper} />
        <Route path="/termos" component={TermosDeUso} />
        <Route path="/privacidade" component={PoliticaPrivacidade} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/redefinir-senha" component={ResetPassword} />
        <Route path="/login-admin" component={LoginLocal} />
        <Route path="/precos" component={Precos} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/payments" component={Payments} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/referrals" component={Referrals} />
        <Route path="/suporte" component={Suporte} />
        <Route path="/faq" component={FAQ} />
        <Route path="/sobre" component={Sobre} />
        <Route path="/blog" component={Blog} />
        <Route path="/parceiros" component={Parceiros} />
        <Route path="/carreiras" component={Carreiras} />
        <Route path="/busca" component={Busca} />
        <Route path="/status" component={Status} />
        <Route path="/changelog" component={Changelog} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/seguranca" component={Seguranca} />
        <Route path="/integracoes" component={Integracoes} />
        <Route path="/webinars" component={Webinars} />
        <Route path="/comunidade" component={Comunidade} />
        <Route path="/forum" component={Forum} />
        <Route path="/cursos" component={Cursos} />
        <Route path="/cursos/:courseId/aulas/:lessonId" component={CursoAula} />
        <Route path="/recursos" component={Recursos} />
        <Route path="/depoimentos" component={Depoimentos} />
        <Route path="/demo" component={Demo} />
        <Route path="/comparacao" component={Comparacao} />
        <Route path="/casos-sucesso" component={CasosSucesso} />
        <Route path="/newsletter" component={Newsletter} />
        <Route path="/metodologia" component={Metodologia} />
        <Route path="/glossario" component={Glossario} />
        <Route path="/certificacoes" component={Certificacoes} />
        <Route path="/meus-certificados" component={MeusCertificados} />
        <Route path="/early-adopters" component={EarlyAdopters} />
        <Route path="/guia-inicio" component={GuiaInicio} />
        <Route path="/faq-interativo" component={FAQInterativo} />
        
        {/* Admin Pages - Protected Routes */}
        <Route path="/admin">{() => <AdminRoute><Admin /></AdminRoute>}</Route>
        <Route path="/admin/analytics">{() => <AdminRoute><AdminAnalytics /></AdminRoute>}</Route>
        <Route path="/admin/monitoring">{() => <AdminRoute><AdminMonitoring /></AdminRoute>}</Route>
        <Route path="/admin/notifications">{() => <AdminRoute><NotificationSettings /></AdminRoute>}</Route>
        <Route path="/admin/cases">{() => <AdminRoute><AdminCaseReview /></AdminRoute>}</Route>
        <Route path="/admin/tags">{() => <AdminRoute><AdminTags /></AdminRoute>}</Route>
        <Route path="/admin/leads">{() => <AdminRoute><AdminLeads /></AdminRoute>}</Route>
        <Route path="/admin/downloads">{() => <AdminRoute><AdminDownloads /></AdminRoute>}</Route>
        <Route path="/admin/paginas">{() => <AdminRoute><AdminPages /></AdminRoute>}</Route>
        <Route path="/admin/error-logs">{() => <AdminRoute><AdminErrorLogs /></AdminRoute>}</Route>
        <Route path="/admin/settings">{() => <AdminRoute><AdminSettings /></AdminRoute>}</Route>
        <Route path="/admin/contacts">{() => <AdminRoute><AdminContacts /></AdminRoute>}</Route>
        <Route path="/admin/audit">{() => <AdminRoute><AdminAudit /></AdminRoute>}</Route>
        <Route path="/admin/carreiras">{() => <AdminRoute><AdminCareers /></AdminRoute>}</Route>
        <Route path="/admin/reports">{() => <AdminRoute><AdminReports /></AdminRoute>}</Route>
        <Route path="/admin/business">{() => <AdminRoute><AdminBusinessMetrics /></AdminRoute>}</Route>
        <Route path="/admin/set7">{() => <AdminRoute><Set7Dashboard /></AdminRoute>}</Route>
        <Route path="/admin/blog">{() => <AdminRoute><AdminBlog /></AdminRoute>}</Route>
        <Route path="/admin/users">{() => <AdminRoute><AdminUsers /></AdminRoute>}</Route>
        <Route path="/admin/:rest*">{() => <AdminRoute><Admin /></AdminRoute>}</Route>
        
        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Initialize White Label
  const { config, loading } = useWhiteLabel();
  
  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <GoogleAnalytics />
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <NotificationProvider>
            <SkipLink />
            <Toaster />
            <main id="main-content">
              <Router />
            </main>
            <JarvisChat />
            <AccessibilityWidget />
            <PWAInstallPrompt />
          </NotificationProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
