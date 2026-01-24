import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Play, 
  Copy, 
  Check, 
  Code2, 
  Terminal, 
  FileJson,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2
} from "lucide-react";

// Tipos
interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  name: string;
  description: string;
  parameters?: Parameter[];
  body?: BodyField[];
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

interface BodyField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

interface ExecutionResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  time: number;
}

// Endpoints disponíveis
const ENDPOINTS: Endpoint[] = [
  {
    id: "list-cases",
    method: "GET",
    path: "/api/v1/cases",
    name: "Listar Cases",
    description: "Retorna lista paginada de cases de impacto",
    parameters: [
      { name: "page", type: "number", required: false, description: "Número da página", default: "1" },
      { name: "limit", type: "number", required: false, description: "Itens por página", default: "10" },
      { name: "sector", type: "string", required: false, description: "Filtrar por setor" },
      { name: "region", type: "string", required: false, description: "Filtrar por região" },
    ],
  },
  {
    id: "get-case",
    method: "GET",
    path: "/api/v1/cases/:id",
    name: "Obter Case",
    description: "Retorna detalhes de um case específico",
    parameters: [
      { name: "id", type: "string", required: true, description: "ID do case" },
    ],
  },
  {
    id: "get-stats",
    method: "GET",
    path: "/api/v1/stats",
    name: "Estatísticas Globais",
    description: "Retorna métricas agregadas de impacto",
  },
  {
    id: "calculate",
    method: "POST",
    path: "/api/v1/calculator",
    name: "Calcular S-ROI",
    description: "Calcula o retorno social sobre investimento",
    body: [
      { name: "investimento", type: "number", required: true, description: "Valor do investimento em R$", example: "100000" },
      { name: "beneficiarios", type: "number", required: true, description: "Número de beneficiários", example: "500" },
      { name: "duracao", type: "number", required: true, description: "Duração em meses", example: "12" },
      { name: "setor", type: "string", required: true, description: "Setor de atuação", example: "educacao" },
    ],
  },
  {
    id: "list-ods",
    method: "GET",
    path: "/api/v1/ods",
    name: "Listar ODS",
    description: "Retorna os 17 Objetivos de Desenvolvimento Sustentável",
  },
];

// Gerador de código
function generateCode(
  endpoint: Endpoint,
  language: string,
  apiKey: string,
  params: Record<string, string>,
  body: Record<string, string>
): string {
  const baseUrl = "https://api.impact7.com.br";
  let path = endpoint.path;
  
  // Substituir parâmetros de path
  Object.entries(params).forEach(([key, value]) => {
    if (path.includes(`:${key}`)) {
      path = path.replace(`:${key}`, value || `{${key}}`);
    }
  });
  
  // Query params
  const queryParams = Object.entries(params)
    .filter(([key, value]) => value && !endpoint.path.includes(`:${key}`))
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  
  const fullUrl = queryParams ? `${baseUrl}${path}?${queryParams}` : `${baseUrl}${path}`;
  
  switch (language) {
    case "javascript":
      if (endpoint.method === "GET") {
        return `// JavaScript (fetch)
const response = await fetch("${fullUrl}", {
  method: "GET",
  headers: {
    "Authorization": "Bearer ${apiKey || "YOUR_API_KEY"}",
    "Content-Type": "application/json"
  }
});

const data = await response.json();
console.log(data);`;
      } else {
        return `// JavaScript (fetch)
const response = await fetch("${fullUrl}", {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer ${apiKey || "YOUR_API_KEY"}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${JSON.stringify(
    Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)])
    ),
    null,
    2
  )})
});

const data = await response.json();
console.log(data);`;
      }
    
    case "python":
      if (endpoint.method === "GET") {
        return `# Python (requests)
import requests

response = requests.get(
    "${fullUrl}",
    headers={
        "Authorization": "Bearer ${apiKey || "YOUR_API_KEY"}",
        "Content-Type": "application/json"
    }
)

data = response.json()
print(data)`;
      } else {
        return `# Python (requests)
import requests

response = requests.${endpoint.method.toLowerCase()}(
    "${fullUrl}",
    headers={
        "Authorization": "Bearer ${apiKey || "YOUR_API_KEY"}",
        "Content-Type": "application/json"
    },
    json=${JSON.stringify(
      Object.fromEntries(
        Object.entries(body).filter(([_, v]) => v).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)])
      ),
      null,
      4
    ).replace(/"/g, "'")}
)

data = response.json()
print(data)`;
      }
    
    case "curl":
      if (endpoint.method === "GET") {
        return `# cURL
curl -X GET "${fullUrl}" \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json"`;
      } else {
        return `# cURL
curl -X ${endpoint.method} "${fullUrl}" \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
    Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)])
    )
  )}'`;
      }
    
    case "sdk":
      if (endpoint.method === "GET") {
        const methodName = endpoint.id.replace(/-/g, ".");
        return `// SDK @impact7/sdk
import { Impact7Client } from "@impact7/sdk";

const client = new Impact7Client({
  apiKey: "${apiKey || "YOUR_API_KEY"}"
});

const data = await client.${methodName}(${
  Object.keys(params).length > 0
    ? JSON.stringify(Object.fromEntries(Object.entries(params).filter(([_, v]) => v)), null, 2)
    : ""
});
console.log(data);`;
      } else {
        return `// SDK @impact7/sdk
import { Impact7Client } from "@impact7/sdk";

const client = new Impact7Client({
  apiKey: "${apiKey || "YOUR_API_KEY"}"
});

const data = await client.calculator.calculate(${JSON.stringify(
  Object.fromEntries(
    Object.entries(body).filter(([_, v]) => v).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)])
  ),
  null,
  2
)});
console.log(data);`;
      }
    
    default:
      return "";
  }
}

// Componente de syntax highlighting simples
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);
  
  // Colorização básica
  const highlightCode = (code: string) => {
    return code
      .replace(/(["'])(.*?)\1/g, '<span class="text-green-400">$&</span>')
      .replace(/\b(const|let|var|import|from|await|async|function|return|if|else)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
      .replace(/(\/\/.*$|#.*$)/gm, '<span class="text-gray-500">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>');
  };
  
  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
      </pre>
    </div>
  );
}

// Componente principal
export default function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [language, setLanguage] = useState("javascript");
  const [apiKey, setApiKey] = useState("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [body, setBody] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Atualizar parâmetros quando endpoint muda
  const handleEndpointChange = (endpointId: string) => {
    const endpoint = ENDPOINTS.find(e => e.id === endpointId);
    if (endpoint) {
      setSelectedEndpoint(endpoint);
      setParams({});
      setBody({});
      setResult(null);
      setError(null);
    }
  };
  
  // Executar requisição (simulada)
  const executeRequest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    const startTime = Date.now();
    
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      // Simular resposta baseada no endpoint
      let responseBody: unknown;
      
      switch (selectedEndpoint.id) {
        case "list-cases":
          responseBody = {
            success: true,
            data: [
              {
                id: "case-001",
                title: "Programa de Educação Digital",
                organization: "Instituto Educar",
                sector: "Educação",
                investment: 250000,
                beneficiaries: 1500,
                sroi: 4.2,
              },
              {
                id: "case-002",
                title: "Saúde Comunitária Rural",
                organization: "ONG Saúde para Todos",
                sector: "Saúde",
                investment: 180000,
                beneficiaries: 3200,
                sroi: 5.8,
              },
            ],
            pagination: {
              page: parseInt(params.page || "1"),
              limit: parseInt(params.limit || "10"),
              total: 42,
              totalPages: 5,
            },
          };
          break;
        
        case "get-case":
          responseBody = {
            success: true,
            data: {
              id: params.id || "case-001",
              title: "Programa de Educação Digital",
              organization: "Instituto Educar",
              description: "Programa de inclusão digital para jovens de comunidades vulneráveis",
              sector: "Educação",
              region: "Sudeste",
              investment: 250000,
              beneficiaries: 1500,
              sroi: 4.2,
              ods: [4, 8, 10],
              metrics: {
                jobsCreated: 45,
                skillsImproved: 1200,
                incomeIncrease: 35,
              },
            },
          };
          break;
        
        case "get-stats":
          responseBody = {
            success: true,
            data: {
              totalProjects: 156,
              totalInvestment: 45000000,
              totalBeneficiaries: 125000,
              averageSroi: 4.7,
              byRegion: {
                Norte: 12,
                Nordeste: 45,
                "Centro-Oeste": 18,
                Sudeste: 52,
                Sul: 29,
              },
              bySector: {
                Educação: 48,
                Saúde: 35,
                "Meio Ambiente": 28,
                Emprego: 25,
                Habitação: 20,
              },
            },
          };
          break;
        
        case "calculate":
          const inv = parseFloat(body.investimento || "100000");
          const ben = parseInt(body.beneficiarios || "500");
          const dur = parseInt(body.duracao || "12");
          responseBody = {
            success: true,
            data: {
              sroi: (ben * dur * 0.15 / inv * 100).toFixed(2),
              socialValue: (inv * 4.2).toFixed(2),
              costPerBeneficiary: (inv / ben).toFixed(2),
              monthlyImpact: (inv / dur).toFixed(2),
              projectedBeneficiaries5Years: ben * 3,
              recommendations: [
                "Considere expandir para comunidades adjacentes",
                "O setor de educação tem alto potencial de multiplicação",
                "Parcerias com empresas locais podem aumentar o impacto",
              ],
            },
          };
          break;
        
        case "list-ods":
          responseBody = {
            success: true,
            data: [
              { id: 1, name: "Erradicação da Pobreza", color: "#E5243B" },
              { id: 2, name: "Fome Zero", color: "#DDA63A" },
              { id: 3, name: "Saúde e Bem-Estar", color: "#4C9F38" },
              { id: 4, name: "Educação de Qualidade", color: "#C5192D" },
              { id: 5, name: "Igualdade de Gênero", color: "#FF3A21" },
              { id: 6, name: "Água Potável e Saneamento", color: "#26BDE2" },
              { id: 7, name: "Energia Limpa e Acessível", color: "#FCC30B" },
              { id: 8, name: "Trabalho Decente e Crescimento Econômico", color: "#A21942" },
              { id: 9, name: "Indústria, Inovação e Infraestrutura", color: "#FD6925" },
              { id: 10, name: "Redução das Desigualdades", color: "#DD1367" },
            ],
          };
          break;
        
        default:
          responseBody = { success: true, message: "OK" };
      }
      
      setResult({
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": "1000",
          "X-RateLimit-Remaining": "999",
          "X-Request-Id": `req_${Date.now()}`,
        },
        body: responseBody,
        time: Date.now() - startTime,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar requisição");
    } finally {
      setIsLoading(false);
    }
  };
  
  const code = generateCode(selectedEndpoint, language, apiKey, params, body);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/api/docs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Docs
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                API Playground
              </h1>
              <p className="text-sm text-muted-foreground">
                Teste a API IMPACT7 em tempo real
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Painel de Configuração */}
          <div className="space-y-6">
            {/* Seleção de Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Endpoint</CardTitle>
                <CardDescription>Selecione o endpoint que deseja testar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedEndpoint.id} onValueChange={handleEndpointChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENDPOINTS.map((endpoint) => (
                      <SelectItem key={endpoint.id} value={endpoint.id}>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={endpoint.method === "GET" ? "secondary" : "default"}
                            className="font-mono text-xs"
                          >
                            {endpoint.method}
                          </Badge>
                          <span>{endpoint.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm font-mono">
                    {selectedEndpoint.method} {selectedEndpoint.path}
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEndpoint.description}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* API Key */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Autenticação</CardTitle>
                <CardDescription>Insira sua API key para autenticar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk_live_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Obtenha sua API key em{" "}
                    <Link href="/api-keys" className="text-primary hover:underline">
                      /api-keys
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Parâmetros */}
            {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parâmetros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedEndpoint.parameters.map((param) => (
                    <div key={param.name} className="space-y-2">
                      <Label htmlFor={param.name} className="flex items-center gap-2">
                        {param.name}
                        {param.required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                        <span className="text-xs text-muted-foreground">({param.type})</span>
                      </Label>
                      <Input
                        id={param.name}
                        placeholder={param.default || param.description}
                        value={params[param.name] || ""}
                        onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Body */}
            {selectedEndpoint.body && selectedEndpoint.body.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Body</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedEndpoint.body.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name} className="flex items-center gap-2">
                        {field.name}
                        {field.required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                        <span className="text-xs text-muted-foreground">({field.type})</span>
                      </Label>
                      <Input
                        id={field.name}
                        placeholder={field.example || field.description}
                        value={body[field.name] || ""}
                        onChange={(e) => setBody({ ...body, [field.name]: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Botão Executar */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={executeRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Executar Requisição
                </>
              )}
            </Button>
          </div>
          
          {/* Painel de Código e Resultado */}
          <div className="space-y-6">
            {/* Código */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Código
                  </CardTitle>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="curl">cURL</SelectItem>
                      <SelectItem value="sdk">SDK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <CodeBlock code={code} language={language} />
              </CardContent>
            </Card>
            
            {/* Resultado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Resposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Erro</span>
                    </div>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                )}
                
                {result && (
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {result.status >= 200 && result.status < 300 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        <Badge variant={result.status >= 200 && result.status < 300 ? "default" : "destructive"}>
                          {result.status} {result.statusText}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {result.time}ms
                      </div>
                    </div>
                    
                    {/* Tabs de Headers e Body */}
                    <Tabs defaultValue="body">
                      <TabsList>
                        <TabsTrigger value="body">Body</TabsTrigger>
                        <TabsTrigger value="headers">Headers</TabsTrigger>
                      </TabsList>
                      <TabsContent value="body" className="mt-4">
                        <CodeBlock 
                          code={JSON.stringify(result.body, null, 2)} 
                          language="json" 
                        />
                      </TabsContent>
                      <TabsContent value="headers" className="mt-4">
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                          {Object.entries(result.headers).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-purple-400">{key}:</span>{" "}
                              <span className="text-green-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
                
                {!result && !error && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Execute uma requisição para ver o resultado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
