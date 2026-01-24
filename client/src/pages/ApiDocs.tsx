import { useState } from "react";
import SEO from "@/components/SEO";
import { Link } from "wouter";
import { 
  ArrowLeft, Book, Code, Key, Lock, 
  ChevronRight, Copy, ExternalLink, 
  FileText, Calculator, Database, Target,
  CheckCircle, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

// Endpoints da API
const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/cases",
    summary: "Listar cases",
    description: "Retorna uma lista paginada de cases de impacto social",
    tag: "Cases",
    scopes: ["cases:list"],
    parameters: [
      { name: "page", type: "integer", description: "Número da página (padrão: 1)" },
      { name: "limit", type: "integer", description: "Itens por página (máx: 100)" },
      { name: "sector", type: "string", description: "Filtrar por setor" },
      { name: "region", type: "string", description: "Filtrar por região" },
      { name: "sdg", type: "integer", description: "Filtrar por ODS (1-17)" },
    ],
    responseExample: `{
  "data": [
    {
      "id": "case_001",
      "title": "Programa de Alfabetização Digital",
      "organization": "Instituto Educar",
      "sector": "Educação",
      "region": "Brasil - Nordeste",
      "year": 2023,
      "investment": 500000,
      "beneficiaries": 2500,
      "sroi": 4.2,
      "sdgs": [4, 10]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/cases/{id}",
    summary: "Obter case por ID",
    description: "Retorna os detalhes completos de um case específico",
    tag: "Cases",
    scopes: ["cases:read"],
    parameters: [
      { name: "id", type: "string", description: "ID do case", required: true },
    ],
    responseExample: `{
  "id": "case_001",
  "title": "Programa de Alfabetização Digital",
  "organization": "Instituto Educar",
  "description": "Programa de capacitação digital...",
  "sector": "Educação",
  "region": "Brasil - Nordeste",
  "year": 2023,
  "investment": 500000,
  "beneficiaries": 2500,
  "sroi": 4.2,
  "sdgs": [4, 10],
  "metrics": {
    "impactIndex": 7.85,
    "costPerBeneficiary": 200,
    "duration": 12
  },
  "testimonial": {
    "quote": "O programa transformou nossa comunidade...",
    "author": "Maria Silva",
    "role": "Coordenadora"
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/calculator",
    summary: "Calcular impacto social",
    description: "Calcula o índice de impacto social usando a fórmula I = (E × C⁷) / R",
    tag: "Calculator",
    scopes: ["calculator:use"],
    requestExample: `{
  "investment": 100000,
  "beneficiaries": 500,
  "duration": 12,
  "effectiveness": 0.8,
  "coverage": 0.7,
  "continuity": 0.85,
  "costEfficiency": 0.75,
  "communityEngagement": 0.9,
  "culturalAdaptation": 0.8,
  "capacityBuilding": 0.7,
  "collaboration": 0.85,
  "risk": 0.2
}`,
    responseExample: `{
  "impactIndex": 7.85,
  "sroi": 4.2,
  "classification": "Alto Impacto",
  "breakdown": {
    "effectiveness": 0.8,
    "c7Product": 0.314,
    "riskFactor": 0.2
  },
  "recommendations": [
    "Considere aumentar o engajamento comunitário",
    "O índice de capacitação pode ser melhorado"
  ],
  "benchmarks": {
    "sectorAverage": 5.2,
    "topPerformers": 8.5,
    "percentile": 78
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    summary: "Obter estatísticas agregadas",
    description: "Retorna estatísticas agregadas de todos os cases de impacto",
    tag: "Statistics",
    scopes: ["cases:stats"],
    responseExample: `{
  "totalCases": 156,
  "totalInvestment": 45000000,
  "totalBeneficiaries": 125000,
  "averageSroi": 3.8,
  "bySector": [
    { "sector": "Educação", "count": 45, "investment": 12000000 },
    { "sector": "Saúde", "count": 38, "investment": 15000000 }
  ],
  "byRegion": [
    { "region": "Brasil", "count": 89, "investment": 28000000 },
    { "region": "Portugal", "count": 34, "investment": 10000000 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/sdgs",
    summary: "Listar ODS",
    description: "Retorna a lista dos 17 Objetivos de Desenvolvimento Sustentável",
    tag: "SDGs",
    scopes: ["sdgs:read"],
    responseExample: `[
  {
    "id": 1,
    "name": "Erradicação da Pobreza",
    "description": "Acabar com a pobreza em todas as suas formas...",
    "color": "#E5243B"
  },
  {
    "id": 4,
    "name": "Educação de Qualidade",
    "description": "Assegurar a educação inclusiva e equitativa...",
    "color": "#C5192D"
  }
]`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-500/20 text-green-500",
  POST: "bg-blue-500/20 text-blue-500",
  PUT: "bg-yellow-500/20 text-yellow-500",
  DELETE: "bg-red-500/20 text-red-500",
};

const TAG_ICONS: Record<string, React.ReactNode> = {
  Cases: <FileText className="w-4 h-4" />,
  Calculator: <Calculator className="w-4 h-4" />,
  Statistics: <Database className="w-4 h-4" />,
  SDGs: <Target className="w-4 h-4" />,
};

export default function ApiDocs() {
  const [testApiKey, setTestApiKey] = useState("");
  const [testEndpoint, setTestEndpoint] = useState("/api/v1/cases");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };
  
  const handleTest = async () => {
    if (!testApiKey) {
      toast.error("Insira uma API key para testar");
      return;
    }
    
    setIsTesting(true);
    try {
      const response = await fetch(testEndpoint, {
        headers: {
          "X-API-Key": testApiKey,
        },
      });
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Erro: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <>
      <SEO
        title="Documentação da API"
        description="Documentação completa da API IMPACT7. Integre a mensuração de impacto social em suas aplicações."
        keywords="API, documentação, SDK, integração, desenvolvedores, IMPACT7"
        url="https://impact7.com.br/api-docs"
      />
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/api-keys">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Book className="w-8 h-8 text-primary" />
              Documentação da API
            </h1>
            <p className="text-muted-foreground">
              Referência completa da API pública IMPACT7
            </p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Introdução</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <a href="#auth" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> Autenticação
                      </a>
                    </li>
                    <li>
                      <a href="#rate-limit" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> Rate Limiting
                      </a>
                    </li>
                    <li>
                      <a href="#errors" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> Erros
                      </a>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Endpoints</h4>
                  <ul className="space-y-1 text-sm">
                    {["Cases", "Calculator", "Statistics", "SDGs"].map((tag) => (
                      <li key={tag}>
                        <a href={`#${tag.toLowerCase()}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                          {TAG_ICONS[tag]} {tag}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  <Link href="/api-keys">
                    <Button variant="outline" size="sm" className="w-full">
                      <Key className="w-4 h-4 mr-2" />
                      Gerenciar API Keys
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Introdução */}
            <Card id="intro">
              <CardHeader>
                <CardTitle>Introdução</CardTitle>
                <CardDescription>
                  A API pública do IMPACT7 permite integrar dados de impacto social em suas aplicações.
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Base URL: <code className="bg-muted px-2 py-1 rounded">/api/v1</code>
                </p>
                <p>
                  Todos os endpoints retornam JSON e suportam autenticação via API Key ou OAuth2.
                </p>
              </CardContent>
            </Card>
            
            {/* Autenticação */}
            <Card id="auth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="apikey">
                  <TabsList>
                    <TabsTrigger value="apikey">API Key</TabsTrigger>
                    <TabsTrigger value="oauth">OAuth2</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="apikey" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Inclua sua API key no header <code>X-API-Key</code>:
                    </p>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`curl -X GET "https://impact7.org/api/v1/cases" \\
  -H "X-API-Key: imp7_sua_api_key"`}
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(`curl -X GET "https://impact7.org/api/v1/cases" -H "X-API-Key: imp7_sua_api_key"`, "Exemplo")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="oauth" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use o fluxo Authorization Code com PKCE para obter um access token:
                    </p>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`curl -X GET "https://impact7.org/api/v1/cases" \\
  -H "Authorization: Bearer seu_access_token"`}
                      </pre>
                    </div>
                    <Link href="/oauth-clients">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Configurar OAuth Client
                      </Button>
                    </Link>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Rate Limiting */}
            <Card id="rate-limit">
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A API implementa rate limiting para garantir disponibilidade. Os limites padrão são:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li><strong>API Key:</strong> 1000 requisições/hora</li>
                  <li><strong>OAuth2:</strong> Configurável por client</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Headers incluídos em todas as respostas:
                </p>
                <div className="bg-muted p-4 rounded text-sm">
                  <code>X-RateLimit-Limit: 1000</code><br />
                  <code>X-RateLimit-Remaining: 999</code><br />
                  <code>X-RateLimit-Reset: 1704067200</code>
                </div>
              </CardContent>
            </Card>
            
            {/* Endpoints */}
            {["Cases", "Calculator", "Statistics", "SDGs"].map((tag) => (
              <Card key={tag} id={tag.toLowerCase()}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {TAG_ICONS[tag]}
                    {tag}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {API_ENDPOINTS.filter(e => e.tag === tag).map((endpoint, idx) => (
                      <AccordionItem key={idx} value={`${tag}-${idx}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Badge className={METHOD_COLORS[endpoint.method]}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm">{endpoint.path}</code>
                            <span className="text-muted-foreground text-sm">
                              {endpoint.summary}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground">
                            {endpoint.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-muted-foreground mr-2">Escopos:</span>
                            {endpoint.scopes.map((scope) => (
                              <Badge key={scope} variant="secondary" className="text-xs">
                                {scope}
                              </Badge>
                            ))}
                          </div>
                          
                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Parâmetros</h5>
                              <div className="bg-muted rounded overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2">Nome</th>
                                      <th className="text-left p-2">Tipo</th>
                                      <th className="text-left p-2">Descrição</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {endpoint.parameters.map((param) => (
                                      <tr key={param.name} className="border-b last:border-0">
                                        <td className="p-2">
                                          <code>{param.name}</code>
                                          {"required" in param && param.required && <span className="text-destructive ml-1">*</span>}
                                        </td>
                                        <td className="p-2 text-muted-foreground">{param.type}</td>
                                        <td className="p-2 text-muted-foreground">{param.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          
                          {endpoint.requestExample && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Request Body</h5>
                              <div className="relative">
                                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                                  {endpoint.requestExample}
                                </pre>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="absolute top-2 right-2 h-6 w-6"
                                  onClick={() => handleCopy(endpoint.requestExample!, "Request")}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h5 className="font-semibold text-sm mb-2">Response</h5>
                            <div className="relative">
                              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-64">
                                {endpoint.responseExample}
                              </pre>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => handleCopy(endpoint.responseExample, "Response")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
            
            {/* API Tester */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Testar API
                </CardTitle>
                <CardDescription>
                  Teste os endpoints diretamente nesta página
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="imp7_..."
                      value={testApiKey}
                      onChange={(e) => setTestApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint</Label>
                    <select
                      id="endpoint"
                      className="w-full h-10 px-3 rounded-md border bg-background"
                      value={testEndpoint}
                      onChange={(e) => setTestEndpoint(e.target.value)}
                    >
                      {API_ENDPOINTS.filter(e => e.method === "GET").map((endpoint) => (
                        <option key={endpoint.path} value={endpoint.path.replace("{id}", "1")}>
                          {endpoint.method} {endpoint.path}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <Button onClick={handleTest} disabled={isTesting}>
                  {isTesting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Executar
                    </>
                  )}
                </Button>
                
                {testResult && (
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Resultado</h5>
                    <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-64">
                      {testResult}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
