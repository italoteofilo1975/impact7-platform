import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Key,
  Eye,
  Server,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Globe,
  Database,
  Users,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const securityFeatures = [
  {
    icon: Lock,
    title: "Criptografia de Ponta a Ponta",
    description:
      "Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256).",
  },
  {
    icon: Key,
    title: "Autenticação Segura",
    description:
      "OAuth 2.0, autenticação de dois fatores (2FA) e tokens JWT com expiração.",
  },
  {
    icon: Server,
    title: "Infraestrutura Segura",
    description:
      "Hospedagem em data centers certificados SOC 2 e ISO 27001 com redundância.",
  },
  {
    icon: Eye,
    title: "Monitoramento 24/7",
    description:
      "Sistemas de detecção de intrusão e monitoramento contínuo de ameaças.",
  },
  {
    icon: Database,
    title: "Backups Automatizados",
    description:
      "Backups diários com retenção de 30 dias e recuperação point-in-time.",
  },
  {
    icon: Users,
    title: "Controle de Acesso",
    description:
      "RBAC (Role-Based Access Control) com princípio de menor privilégio.",
  },
];

const certifications = [
  { name: "SOC 2 Type II", status: "Em conformidade" },
  { name: "ISO 27001", status: "Em processo" },
  { name: "LGPD", status: "Em conformidade" },
  { name: "GDPR", status: "Em conformidade" },
  { name: "PCI DSS", status: "Via Stripe" },
];

const securityPractices = [
  "Testes de penetração trimestrais por empresas independentes",
  "Revisão de código com análise estática de segurança (SAST)",
  "Programa de bug bounty para pesquisadores de segurança",
  "Treinamento de segurança obrigatório para todos os funcionários",
  "Política de senhas fortes e rotação periódica",
  "Logs de auditoria imutáveis para todas as ações críticas",
  "Segregação de ambientes (desenvolvimento, staging, produção)",
  "Plano de resposta a incidentes documentado e testado",
];

export default function Seguranca() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-500/10">
              <Shield className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <Badge className="mb-4">Segurança</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sua Segurança é Nossa Prioridade
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Protegemos seus dados com as melhores práticas e tecnologias de
            segurança do mercado
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button>
              <FileCheck className="mr-2 h-4 w-4" />
              Ver Certificações
            </Button>
            <Button variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reportar Vulnerabilidade
            </Button>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recursos de Segurança
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Certificações e Conformidade
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{cert.name}</span>
                    </div>
                    <Badge
                      variant={
                        cert.status === "Em conformidade"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        cert.status === "Em conformidade" ? "bg-green-500" : ""
                      }
                    >
                      {cert.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Práticas de Segurança
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {securityPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">
                <Globe className="inline mr-2 h-6 w-6" />
                Proteção de Dados
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Estamos em total conformidade com a Lei Geral de Proteção de
                  Dados (LGPD) e o Regulamento Geral de Proteção de Dados (GDPR).
                </p>
                <p>
                  Seus dados são armazenados em servidores localizados no Brasil
                  e na União Europeia, garantindo conformidade com as
                  regulamentações locais.
                </p>
                <p>
                  Você tem total controle sobre seus dados, podendo solicitar
                  acesso, correção ou exclusão a qualquer momento.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">
                <Fingerprint className="inline mr-2 h-6 w-6" />
                Privacidade por Design
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Coletamos apenas os dados estritamente necessários para
                  fornecer nossos serviços.
                </p>
                <p>
                  Nunca vendemos ou compartilhamos seus dados com terceiros para
                  fins de marketing.
                </p>
                <p>
                  Implementamos anonimização e pseudonimização sempre que
                  possível para proteger sua identidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bug Bounty */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Programa de Bug Bounty</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Valorizamos a comunidade de segurança. Se você encontrar uma
            vulnerabilidade, queremos saber.
          </p>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p>
                  Oferecemos recompensas de <strong>R$ 500 a R$ 10.000</strong>{" "}
                  dependendo da severidade da vulnerabilidade reportada.
                </p>
                <p className="text-muted-foreground">
                  Envie seu relatório para:{" "}
                  <a
                    href="mailto:security@impact7.com.br"
                    className="text-primary hover:underline"
                  >
                    security@impact7.com.br
                  </a>
                </p>
                <Button>Ver Política de Divulgação Responsável</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Dúvidas sobre Segurança?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Nossa equipe de segurança está disponível para responder suas
            perguntas e fornecer informações adicionais.
          </p>
          <Button size="lg" variant="secondary">
            Falar com Equipe de Segurança
          </Button>
        </div>
      </section>
    </div>
  );
}
