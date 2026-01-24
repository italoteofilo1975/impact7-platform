import { useState, useMemo } from "react";
import { Link } from "wouter";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Calculator,
  Award,
  CreditCard,
  Shield,
  Bot,
  FileText,
  Users,
  Settings,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  // Geral
  {
    id: "1",
    question: "O que é a Plataforma IMPACT7?",
    answer: "A Plataforma IMPACT7 é uma solução SaaS para mensuração de impacto social baseada no Método IMPACT7. Ela permite calcular o S-ROI (Retorno Social sobre Investimento), gerenciar cases de impacto, obter certificações digitais e acessar um assistente de IA especializado em impacto social.",
    category: "geral",
    tags: ["plataforma", "impact7", "sroi"],
  },
  {
    id: "2",
    question: "O que é o Método IMPACT7?",
    answer: "O Método IMPACT7 é uma metodologia científica para mensuração de impacto social que combina Ciência Cognitiva, Modelagem Matemática e Engenharia de Software. Ele utiliza a equação I = (E × C⁷) / R, onde I é o Impacto, E é o Efeito, C⁷ é o Fator de Contexto (composto por 7 coeficientes) e R é a Resistência.",
    category: "geral",
    tags: ["método", "equação", "ciência"],
  },
  {
    id: "3",
    question: "Quem pode usar a plataforma?",
    answer: "A plataforma é destinada a ONGs, OSCs, fundações, institutos, empresas com programas de responsabilidade social, investidores de impacto, governos e qualquer organização que deseje mensurar e demonstrar o impacto social de seus projetos.",
    category: "geral",
    tags: ["público", "organizações", "usuários"],
  },
  
  // Calculadora
  {
    id: "4",
    question: "Como funciona a Calculadora de Impacto?",
    answer: "A Calculadora de Impacto permite inserir dados do seu projeto (investimento, beneficiários, duração, setor) e responder a um questionário sobre os 7 coeficientes de contexto. Com base nessas informações, o sistema calcula automaticamente o S-ROI usando a equação do Método IMPACT7.",
    category: "calculadora",
    tags: ["calculadora", "sroi", "cálculo"],
  },
  {
    id: "5",
    question: "O que são os 7 coeficientes de contexto?",
    answer: "Os 7 coeficientes são: C1 (Clareza de Propósito), C2 (Capacidade de Execução), C3 (Contexto Social), C4 (Colaboração), C5 (Comunicação), C6 (Continuidade) e C7 (Cultura de Impacto). Cada um é avaliado de 0 a 10 e multiplicado para formar o Fator de Contexto C⁷.",
    category: "calculadora",
    tags: ["coeficientes", "contexto", "c7"],
  },
  {
    id: "6",
    question: "Posso salvar meus cálculos?",
    answer: "Sim! Usuários logados podem salvar seus cálculos no histórico e acessá-los posteriormente. Você também pode exportar os resultados em PDF para compartilhar com stakeholders.",
    category: "calculadora",
    tags: ["salvar", "histórico", "pdf"],
  },
  
  // Cases
  {
    id: "7",
    question: "O que é um Case de Impacto?",
    answer: "Um Case de Impacto é o registro documentado de um projeto social na plataforma. Ele inclui informações sobre o projeto, resultados alcançados, métricas de impacto e evidências. Cases aprovados podem receber certificação digital.",
    category: "cases",
    tags: ["case", "projeto", "registro"],
  },
  {
    id: "8",
    question: "Como submeter um case?",
    answer: "Para submeter um case, acesse a página 'Submeter Case', preencha o formulário com informações do projeto (nome, descrição, setor, beneficiários, investimento, resultados) e envie para análise. Nossa equipe avaliará e você receberá feedback em até 5 dias úteis.",
    category: "cases",
    tags: ["submeter", "formulário", "análise"],
  },
  {
    id: "9",
    question: "Quanto tempo leva a aprovação de um case?",
    answer: "O prazo padrão de análise é de 5 dias úteis. Cases com documentação completa e evidências claras tendem a ser aprovados mais rapidamente. Você receberá notificações sobre o status da análise.",
    category: "cases",
    tags: ["prazo", "aprovação", "análise"],
  },
  
  // Certificações
  {
    id: "10",
    question: "O que é a certificação digital?",
    answer: "A certificação digital é um documento verificável que atesta que seu projeto passou pela análise do Método IMPACT7 e teve seu impacto social validado. O certificado inclui um QR Code que permite verificação online da autenticidade.",
    category: "certificacoes",
    tags: ["certificado", "digital", "verificação"],
  },
  {
    id: "11",
    question: "Quais são os níveis de certificação?",
    answer: "Existem 3 níveis: Básico (para projetos iniciantes), Verificado (para projetos com evidências documentadas) e Excelência (para projetos com alto impacto comprovado e auditoria externa). Cada nível tem requisitos específicos.",
    category: "certificacoes",
    tags: ["níveis", "básico", "verificado", "excelência"],
  },
  {
    id: "12",
    question: "O certificado tem validade?",
    answer: "Sim, os certificados têm validade de 1 ano e podem ser renovados mediante nova análise. A renovação é simplificada para organizações que mantêm seus dados atualizados na plataforma.",
    category: "certificacoes",
    tags: ["validade", "renovação", "prazo"],
  },
  
  // Pagamentos
  {
    id: "13",
    question: "Quais são os planos disponíveis?",
    answer: "Oferecemos 4 planos: Free (gratuito, recursos básicos), Starter (R$ 97/mês), Professional (R$ 297/mês) e Enterprise (personalizado). Cada plano tem limites diferentes de projetos, certificações e recursos.",
    category: "pagamentos",
    tags: ["planos", "preços", "assinatura"],
  },
  {
    id: "14",
    question: "Quais formas de pagamento são aceitas?",
    answer: "Aceitamos cartões de crédito (Visa, Mastercard, Amex, Elo) e boleto bancário. Os pagamentos são processados de forma segura pelo Stripe, líder mundial em processamento de pagamentos.",
    category: "pagamentos",
    tags: ["pagamento", "cartão", "boleto"],
  },
  {
    id: "15",
    question: "Posso cancelar minha assinatura?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento pelo painel de configurações. O acesso continua até o fim do período pago. Não há multa de cancelamento.",
    category: "pagamentos",
    tags: ["cancelar", "assinatura", "reembolso"],
  },
  
  // Jarvis
  {
    id: "16",
    question: "O que é o Jarvis?",
    answer: "Jarvis é nosso assistente de IA especializado no Método IMPACT7. Ele pode responder dúvidas sobre a metodologia, ajudar a interpretar resultados, sugerir melhorias para seus projetos e gerar relatórios personalizados.",
    category: "jarvis",
    tags: ["jarvis", "ia", "assistente"],
  },
  {
    id: "17",
    question: "O Jarvis tem limite de uso?",
    answer: "O limite de uso do Jarvis varia por plano. O plano Free permite 10 interações por dia, enquanto planos pagos têm limites maiores ou ilimitados. O contador é resetado diariamente.",
    category: "jarvis",
    tags: ["limite", "uso", "interações"],
  },
  
  // Segurança
  {
    id: "18",
    question: "Meus dados estão seguros?",
    answer: "Sim! Utilizamos criptografia de ponta a ponta, autenticação segura via OAuth, e seguimos as melhores práticas de segurança (OWASP). Todos os dados são armazenados em servidores seguros com backup automático.",
    category: "seguranca",
    tags: ["segurança", "dados", "privacidade"],
  },
  {
    id: "19",
    question: "A plataforma está em conformidade com a LGPD?",
    answer: "Sim, a plataforma está em total conformidade com a Lei Geral de Proteção de Dados (LGPD). Você pode consultar nossa Política de Privacidade para detalhes sobre como tratamos seus dados.",
    category: "seguranca",
    tags: ["lgpd", "privacidade", "conformidade"],
  },
  
  // Conta
  {
    id: "20",
    question: "Como criar uma conta?",
    answer: "Clique em 'Entrar' no menu superior e você será direcionado para a página de login. Você pode criar uma conta usando seu email ou fazer login com sua conta Google/Microsoft.",
    category: "conta",
    tags: ["conta", "cadastro", "login"],
  },
  {
    id: "21",
    question: "Esqueci minha senha, o que fazer?",
    answer: "Na página de login, clique em 'Esqueci minha senha' e informe seu email. Você receberá um link para redefinir sua senha. O link é válido por 24 horas.",
    category: "conta",
    tags: ["senha", "recuperar", "email"],
  },
];

const categories = [
  { id: "geral", label: "Geral", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "calculadora", label: "Calculadora", icon: <Calculator className="h-4 w-4" /> },
  { id: "cases", label: "Cases", icon: <FileText className="h-4 w-4" /> },
  { id: "certificacoes", label: "Certificações", icon: <Award className="h-4 w-4" /> },
  { id: "pagamentos", label: "Pagamentos", icon: <CreditCard className="h-4 w-4" /> },
  { id: "jarvis", label: "Jarvis", icon: <Bot className="h-4 w-4" /> },
  { id: "seguranca", label: "Segurança", icon: <Shield className="h-4 w-4" /> },
  { id: "conta", label: "Conta", icon: <Settings className="h-4 w-4" /> },
];

export default function FAQInterativo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean | null>>({});

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch = searchQuery === "" || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === null || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleFeedback = (faqId: string, helpful: boolean) => {
    setHelpfulFeedback(prev => ({ ...prev, [faqId]: helpful }));
    toast.success(helpful ? "Obrigado pelo feedback!" : "Vamos melhorar esta resposta.");
  };

  return (
    <>
      <SEO
        title="FAQ - Perguntas Frequentes"
        description="Encontre respostas para as perguntas mais frequentes sobre a Plataforma IMPACT7, calculadora de impacto, certificações e mais."
        keywords="faq, perguntas frequentes, ajuda, suporte, dúvidas"
        url="https://impact7.com.br/faq-interativo"
      />
      <div className="min-h-screen bg-background">
        <MainNavbar />
        
        <main className="pt-20 pb-16">
          {/* Hero */}
          <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <Badge className="mb-4 bg-primary/10 text-primary">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Central de Ajuda
                </Badge>
                <h1 className="text-4xl font-bold mb-4">
                  Perguntas Frequentes
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Encontre respostas rápidas para suas dúvidas sobre a Plataforma IMPACT7
                </p>
                
                {/* Search */}
                <div className="relative max-w-xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar perguntas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-lg"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-6 border-b">
            <div className="container">
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todas
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.icon}
                    <span className="ml-2">{cat.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ List */}
          <section className="py-12">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                {filteredFAQs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Nenhuma pergunta encontrada
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Tente buscar com outros termos ou entre em contato conosco.
                      </p>
                      <Link href="/suporte">
                        <Button>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Falar com Suporte
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Accordion type="single" collapsible className="space-y-4">
                    {filteredFAQs.map(faq => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-start gap-3 text-left">
                            <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                              {categories.find(c => c.id === faq.category)?.icon}
                            </div>
                            <span className="font-medium">{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-12 pb-4">
                            <p className="text-muted-foreground mb-4">
                              {faq.answer}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">
                                Esta resposta foi útil?
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  variant={helpfulFeedback[faq.id] === true ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleFeedback(faq.id, true)}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant={helpfulFeedback[faq.id] === false ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleFeedback(faq.id, false)}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {faq.tags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-primary/10"
                                  onClick={() => setSearchQuery(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}

                {/* Results count */}
                {filteredFAQs.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground mt-6">
                    Mostrando {filteredFAQs.length} de {faqData.length} perguntas
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Still need help */}
          <section className="py-12 bg-muted/30">
            <div className="container">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Ainda precisa de ajuda?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Nossa equipe está pronta para ajudar você com qualquer dúvida.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/jarvis">
                    <Button variant="outline">
                      <Bot className="h-4 w-4 mr-2" />
                      Perguntar ao Jarvis
                    </Button>
                  </Link>
                  <Link href="/suporte">
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Falar com Suporte
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
        <WhatsAppWidget />
      </div>
    </>
  );
}
