import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";

const glossaryTerms = [
  {
    term: "SROI",
    fullName: "Social Return on Investment",
    category: "Métricas",
    definition:
      "Metodologia que mede o valor social, ambiental e econômico criado por uma intervenção, expressando-o como uma razão entre o valor gerado e o investimento realizado. Por exemplo, um SROI de 4:1 significa que cada R$1 investido gera R$4 em valor social.",
  },
  {
    term: "Teoria de Mudança",
    fullName: "Theory of Change",
    category: "Frameworks",
    definition:
      "Descrição abrangente de como e por que uma mudança desejada é esperada acontecer em um contexto particular. Mapeia a sequência causal de inputs, atividades, outputs, outcomes e impacto.",
  },
  {
    term: "Outcome",
    fullName: "Resultado",
    category: "Conceitos",
    definition:
      "Mudança que ocorre como resultado de uma intervenção. Diferente de output (produto direto), outcome representa a transformação real na vida dos beneficiários.",
  },
  {
    term: "Output",
    fullName: "Produto",
    category: "Conceitos",
    definition:
      "Produto ou serviço direto entregue por uma atividade. Por exemplo, número de pessoas treinadas, refeições servidas ou materiais distribuídos.",
  },
  {
    term: "Impacto",
    fullName: "Impact",
    category: "Conceitos",
    definition:
      "Mudança de longo prazo atribuível a uma intervenção, descontando o que teria acontecido de qualquer forma (deadweight) e o que foi causado por outros fatores (attribution).",
  },
  {
    term: "Deadweight",
    fullName: "Peso Morto",
    category: "Ajustes SROI",
    definition:
      "Porcentagem do outcome que teria acontecido mesmo sem a intervenção. É subtraído do valor total para evitar superestimação do impacto.",
  },
  {
    term: "Attribution",
    fullName: "Atribuição",
    category: "Ajustes SROI",
    definition:
      "Porcentagem do outcome que pode ser atribuída a outros fatores ou organizações. Garante que apenas o impacto genuíno da intervenção seja contabilizado.",
  },
  {
    term: "Displacement",
    fullName: "Deslocamento",
    category: "Ajustes SROI",
    definition:
      "Quando um benefício em um lugar resulta em prejuízo em outro. Por exemplo, um programa de emprego que desloca trabalhadores de outras empresas.",
  },
  {
    term: "Drop-off",
    fullName: "Decaimento",
    category: "Ajustes SROI",
    definition:
      "Taxa de redução do outcome ao longo do tempo. Reconhece que os benefícios de uma intervenção podem diminuir com o passar dos anos.",
  },
  {
    term: "Proxy Financeiro",
    fullName: "Financial Proxy",
    category: "Métricas",
    definition:
      "Valor monetário usado para representar outcomes que não têm preço de mercado. Por exemplo, usar o custo de tratamento de depressão como proxy para melhoria de saúde mental.",
  },
  {
    term: "Stakeholder",
    fullName: "Parte Interessada",
    category: "Conceitos",
    definition:
      "Qualquer pessoa ou grupo afetado por uma intervenção, positiva ou negativamente. Inclui beneficiários diretos, famílias, comunidades, financiadores e sociedade.",
  },
  {
    term: "Beneficiário",
    fullName: "Beneficiary",
    category: "Conceitos",
    definition:
      "Pessoa ou grupo que recebe diretamente os benefícios de uma intervenção social. São os principais stakeholders cujas mudanças de vida são mensuradas.",
  },
  {
    term: "ESG",
    fullName: "Environmental, Social and Governance",
    category: "Frameworks",
    definition:
      "Critérios usados para avaliar práticas ambientais, sociais e de governança de organizações. Cada vez mais importantes para investidores e consumidores.",
  },
  {
    term: "ODS",
    fullName: "Objetivos de Desenvolvimento Sustentável",
    category: "Frameworks",
    definition:
      "17 objetivos globais estabelecidos pela ONU para 2030, abrangendo pobreza, fome, saúde, educação, igualdade, água, energia, trabalho, inovação, desigualdades, cidades, consumo, clima, oceanos, biodiversidade, paz e parcerias.",
  },
  {
    term: "Logic Model",
    fullName: "Modelo Lógico",
    category: "Frameworks",
    definition:
      "Representação visual que conecta recursos (inputs), atividades, outputs, outcomes e impacto de um programa. Ferramenta fundamental para planejamento e avaliação.",
  },
  {
    term: "Baseline",
    fullName: "Linha de Base",
    category: "Métricas",
    definition:
      "Medição inicial antes de uma intervenção começar. Serve como ponto de referência para avaliar mudanças e calcular o impacto real.",
  },
  {
    term: "Counterfactual",
    fullName: "Contrafactual",
    category: "Conceitos",
    definition:
      "O que teria acontecido na ausência da intervenção. Essencial para determinar o impacto real, separando-o de tendências naturais ou outros fatores.",
  },
  {
    term: "Token de Impacto",
    fullName: "Impact Token",
    category: "IMPACT7",
    definition:
      "Unidade de reconhecimento do IMPACT7 que representa contribuições para o ecossistema de impacto social. Pode ser ganho por submissão de cases, participação em pesquisas ou engajamento na comunidade.",
  },
  {
    term: "Case de Impacto",
    fullName: "Impact Case",
    category: "IMPACT7",
    definition:
      "Documentação estruturada de uma intervenção social no IMPACT7, incluindo contexto, metodologia, resultados e aprendizados. Contribui para o conhecimento coletivo do setor.",
  },
  {
    term: "Certificado de Impacto",
    fullName: "Impact Certificate",
    category: "IMPACT7",
    definition:
      "Documento oficial emitido pelo IMPACT7 que atesta a mensuração de impacto de um projeto, incluindo metodologia utilizada e resultados verificados.",
  },
];

const categories = Array.from(new Set(glossaryTerms.map((t) => t.category)));

export default function Glossario() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    return glossaryTerms
      .filter((term) => {
        const matchesSearch =
          term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          !selectedCategory || term.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4">Referência</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Glossário de Impacto Social
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Termos e conceitos essenciais para mensuração de impacto
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{glossaryTerms.length} termos</span>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 px-4 border-b sticky top-0 bg-background z-10">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar termos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-8 px-4">
        <div className="container">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum termo encontrado para "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTerms.map((item, index) => (
                <Card key={index} id={item.term.toLowerCase().replace(/\s/g, "-")}>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-xl font-bold">{item.term}</h3>
                        {item.fullName !== item.term && (
                          <p className="text-sm text-muted-foreground">
                            {item.fullName}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    <p className="text-muted-foreground">{item.definition}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
