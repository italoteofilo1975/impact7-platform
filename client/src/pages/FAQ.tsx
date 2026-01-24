import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  HelpCircle,
  Calculator,
  Shield,
  CreditCard,
  Users,
  Zap,
  FileText,
  MessageSquare,
} from "lucide-react";

const faqCategories = [
  {
    id: "geral",
    name: "Geral",
    icon: HelpCircle,
    questions: [
      {
        q: "O que é o Método IMPACT7?",
        a: "O Método IMPACT7 é uma metodologia científica para mensuração e maximização de impacto social. Baseado na equação I = (E × C⁷) / R, permite quantificar o retorno social sobre investimento (S-ROI) de projetos e iniciativas de impacto.",
      },
      {
        q: "Quem pode usar a plataforma?",
        a: "A plataforma é destinada a organizações do terceiro setor, empresas com programas de responsabilidade social, investidores de impacto, governos e qualquer entidade interessada em mensurar e maximizar seu impacto social.",
      },
      {
        q: "Qual a diferença entre IMPACT7 e outras metodologias?",
        a: "O IMPACT7 se diferencia por sua base científica rigorosa, equação matemática validada, e foco nos 7 Capitais (Humano, Social, Intelectual, Financeiro, Manufaturado, Natural e Cultural) que compõem o impacto holístico.",
      },
    ],
  },
  {
    id: "calculadora",
    name: "Calculadora",
    icon: Calculator,
    questions: [
      {
        q: "Como funciona a Calculadora de Impacto?",
        a: "A calculadora utiliza a equação I = (E × C⁷) / R onde E é a Eficiência, C⁷ representa os 7 Capitais, e R é o Risco. Você insere os valores de cada componente e a calculadora retorna o índice de impacto e o S-ROI estimado.",
      },
      {
        q: "Os resultados da calculadora são precisos?",
        a: "Os resultados são estimativas baseadas nos dados fornecidos. Para uma análise mais precisa, recomendamos a consultoria especializada que considera fatores contextuais específicos do seu projeto.",
      },
      {
        q: "Posso salvar e comparar diferentes cenários?",
        a: "Sim! Usuários registrados podem salvar múltiplos cenários, comparar resultados lado a lado e acompanhar a evolução do impacto ao longo do tempo.",
      },
    ],
  },
  {
    id: "planos",
    name: "Planos e Preços",
    icon: CreditCard,
    questions: [
      {
        q: "Quais planos estão disponíveis?",
        a: "Oferecemos 4 planos: Free (acesso básico à calculadora), Starter (R$25/mês), Professional (R$125/mês) e Enterprise (personalizado). Cada plano oferece diferentes níveis de funcionalidades e suporte.",
      },
      {
        q: "Existe período de teste gratuito?",
        a: "Sim! Oferecemos 14 dias de teste gratuito no plano Professional, sem necessidade de cartão de crédito. Você pode experimentar todas as funcionalidades antes de decidir.",
      },
      {
        q: "Posso mudar de plano a qualquer momento?",
        a: "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor é calculado proporcionalmente ao período restante.",
      },
      {
        q: "Quais formas de pagamento são aceitas?",
        a: "Aceitamos cartões de crédito (Visa, Mastercard, American Express), débito e PIX. Para planos Enterprise, também oferecemos faturamento mensal.",
      },
    ],
  },
  {
    id: "jarvis",
    name: "Jarvis IA",
    icon: Zap,
    questions: [
      {
        q: "O que é o Jarvis?",
        a: "Jarvis é nosso assistente de IA especializado em impacto social. Ele pode responder dúvidas sobre a metodologia, ajudar com cálculos, gerar relatórios e fornecer mentoria personalizada.",
      },
      {
        q: "O Jarvis aprende com minhas interações?",
        a: "Sim! O Jarvis possui memória de longo prazo e aprende com suas interações para fornecer respostas cada vez mais personalizadas e relevantes ao seu contexto.",
      },
      {
        q: "Posso usar o Jarvis para gerar relatórios?",
        a: "Sim! O Jarvis pode gerar relatórios de impacto automaticamente, incluindo análises, gráficos e recomendações baseadas nos seus dados.",
      },
    ],
  },
  {
    id: "cases",
    name: "Cases e Certificados",
    icon: FileText,
    questions: [
      {
        q: "Como submeto um case de impacto?",
        a: "Acesse a página de submissão de cases, preencha o formulário com os dados do seu projeto, anexe documentos comprobatórios e envie para revisão. Nossa equipe analisará em até 5 dias úteis.",
      },
      {
        q: "O que são os Certificados de Impacto?",
        a: "São certificados digitais que atestam o impacto social do seu projeto. Cada certificado possui um hash único verificável via blockchain, garantindo autenticidade e imutabilidade.",
      },
      {
        q: "Como funcionam os Tokens de Impacto (SIT)?",
        a: "Os Social Impact Tokens (SIT) são tokens digitais que representam o impacto gerado. Eles podem ser acumulados, transferidos e utilizados como prova de impacto para stakeholders.",
      },
    ],
  },
  {
    id: "seguranca",
    name: "Segurança e Privacidade",
    icon: Shield,
    questions: [
      {
        q: "Meus dados estão seguros?",
        a: "Sim! Utilizamos criptografia de ponta a ponta, autenticação OAuth2, e seguimos as melhores práticas de segurança. Nossos servidores são certificados e monitorados 24/7.",
      },
      {
        q: "Vocês compartilham dados com terceiros?",
        a: "Não compartilhamos dados pessoais com terceiros sem seu consentimento explícito. Consulte nossa Política de Privacidade para mais detalhes.",
      },
      {
        q: "Posso exportar ou deletar meus dados?",
        a: "Sim! Você tem total controle sobre seus dados. Pode exportá-los a qualquer momento em formato CSV/JSON ou solicitar a exclusão completa da sua conta.",
      },
    ],
  },
  {
    id: "api",
    name: "API e Integrações",
    icon: Users,
    questions: [
      {
        q: "Vocês oferecem API pública?",
        a: "Sim! Oferecemos uma API REST completa com documentação OpenAPI. Você pode integrar nossos serviços em suas aplicações usando nossa API ou SDK JavaScript.",
      },
      {
        q: "Quais são os limites de rate limiting?",
        a: "Os limites variam por plano: Free (100 req/hora), Starter (1.000 req/hora), Professional (10.000 req/hora) e Enterprise (ilimitado com SLA).",
      },
      {
        q: "Como obtenho uma API key?",
        a: "Após criar sua conta, acesse a seção de OAuth Clients no seu perfil para gerar suas credenciais de API.",
      },
    ],
  },
  {
    id: "suporte",
    name: "Suporte",
    icon: MessageSquare,
    questions: [
      {
        q: "Como entro em contato com o suporte?",
        a: "Você pode abrir um ticket de suporte diretamente na plataforma, enviar email para suporte@impact7.com, ou usar o chat com o Jarvis para dúvidas rápidas.",
      },
      {
        q: "Qual o tempo de resposta do suporte?",
        a: "Para planos Free e Starter, respondemos em até 48h. Para Professional, em até 24h. Clientes Enterprise têm suporte prioritário com SLA de 4h.",
      },
      {
        q: "Vocês oferecem treinamento?",
        a: "Sim! Oferecemos webinars gratuitos mensais, documentação completa e, para planos Professional e Enterprise, treinamentos personalizados.",
      },
    ],
  },
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(
      (category) =>
        category.questions.length > 0 &&
        (!selectedCategory || category.id === selectedCategory)
    );

  const totalQuestions = faqCategories.reduce(
    (acc, cat) => acc + cat.questions.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Central de Ajuda</Badge>
          <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Encontre respostas para as dúvidas mais comuns sobre o IMPACT7
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar nas perguntas frequentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            {totalQuestions} perguntas em {faqCategories.length} categorias
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 border-y bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </Button>
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4">
        <div className="container max-w-4xl">
          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tente buscar com outros termos ou entre em contato conosco
                </p>
                <Button asChild>
                  <Link href="/suporte">Abrir Ticket de Suporte</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((item, index) => (
                          <AccordionItem
                            key={index}
                            value={`${category.id}-${index}`}
                          >
                            <AccordionTrigger className="text-left">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">Não encontrou o que procurava?</h2>
          <p className="text-muted-foreground mb-8">
            Nossa equipe está pronta para ajudar você com qualquer dúvida
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/suporte">Abrir Ticket de Suporte</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contato">Falar Conosco</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
