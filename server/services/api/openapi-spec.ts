/**
 * OpenAPI 3.0 Specification for IMPACT7 Public API
 */

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "IMPACT7 Public API",
    description: `
A API pública do IMPACT7 permite que desenvolvedores integrem dados de impacto social em suas aplicações.

## Autenticação

A API suporta dois métodos de autenticação:

### API Key
Inclua sua API key no header \`X-API-Key\`:
\`\`\`
X-API-Key: imp7_sua_api_key
\`\`\`

### OAuth2
Use o fluxo Authorization Code com PKCE para obter um access token:
\`\`\`
Authorization: Bearer seu_access_token
\`\`\`

## Rate Limiting

- API Key: 1000 requisições/hora (configurável)
- OAuth2: Baseado nas configurações do client

Headers de rate limit incluídos em todas as respostas:
- \`X-RateLimit-Limit\`: Limite total
- \`X-RateLimit-Remaining\`: Requisições restantes
- \`X-RateLimit-Reset\`: Timestamp de reset

## Erros

A API usa códigos HTTP padrão:
- \`200\`: Sucesso
- \`400\`: Requisição inválida
- \`401\`: Não autenticado
- \`403\`: Não autorizado
- \`404\`: Não encontrado
- \`429\`: Rate limit excedido
- \`500\`: Erro interno
    `,
    version: "1.0.0",
    contact: {
      name: "IMPACT7 API Support",
      email: "api@impact7.org",
      url: "https://impact7.org/api-docs",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  tags: [
    {
      name: "Cases",
      description: "Operações relacionadas a cases de impacto social",
    },
    {
      name: "Calculator",
      description: "Calculadora de impacto social",
    },
    {
      name: "Statistics",
      description: "Estatísticas agregadas de impacto",
    },
    {
      name: "SDGs",
      description: "Objetivos de Desenvolvimento Sustentável (ODS)",
    },
  ],
  paths: {
    "/cases": {
      get: {
        tags: ["Cases"],
        summary: "Listar cases",
        description: "Retorna uma lista paginada de cases de impacto social",
        operationId: "listCases",
        security: [{ apiKey: [] }, { oauth2: ["cases:list"] }],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Número da página (começa em 1)",
            schema: { type: "integer", default: 1, minimum: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Itens por página (máximo 100)",
            schema: { type: "integer", default: 20, minimum: 1, maximum: 100 },
          },
          {
            name: "sector",
            in: "query",
            description: "Filtrar por setor",
            schema: { type: "string" },
          },
          {
            name: "region",
            in: "query",
            description: "Filtrar por região",
            schema: { type: "string" },
          },
          {
            name: "sdg",
            in: "query",
            description: "Filtrar por ODS (1-17)",
            schema: { type: "integer", minimum: 1, maximum: 17 },
          },
        ],
        responses: {
          "200": {
            description: "Lista de cases",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CaseSummary" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
                example: {
                  data: [
                    {
                      id: "case_001",
                      title: "Programa de Alfabetização Digital",
                      organization: "Instituto Educar",
                      sector: "Educação",
                      region: "Brasil - Nordeste",
                      year: 2023,
                      investment: 500000,
                      beneficiaries: 2500,
                      sroi: 4.2,
                      sdgs: [4, 10],
                    },
                  ],
                  pagination: {
                    page: 1,
                    limit: 20,
                    total: 45,
                    totalPages: 3,
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/cases/{id}": {
      get: {
        tags: ["Cases"],
        summary: "Obter case por ID",
        description: "Retorna os detalhes completos de um case específico",
        operationId: "getCase",
        security: [{ apiKey: [] }, { oauth2: ["cases:read"] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID do case",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Detalhes do case",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CaseDetail" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/calculator": {
      post: {
        tags: ["Calculator"],
        summary: "Calcular impacto social",
        description: "Calcula o S-ROI honesto (simulacao ilustrativa) com base em gatilhos, transformacoes e os tres descontos: atribuicao, deadweight e drop-off.",
        operationId: "calculateImpact",
        security: [{ apiKey: [] }, { oauth2: ["calculator:use"] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CalculatorInput" },
              example: {
                investment: 100000,
                beneficiaries: 500,
                duration: 12,
                effectiveness: 0.8,
                coverage: 0.7,
                continuity: 0.85,
                costEfficiency: 0.75,
                communityEngagement: 0.9,
                culturalAdaptation: 0.8,
                capacityBuilding: 0.7,
                collaboration: 0.85,
                risk: 0.2,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Resultado do cálculo",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CalculatorResult" },
                example: {
                  impactIndex: 7.85,
                  sroi: 4.2,
                  classification: "Alto Impacto",
                  breakdown: {
                    effectiveness: 0.8,
                    c7Product: 0.314,
                    riskFactor: 0.2,
                  },
                  recommendations: [
                    "Considere aumentar o engajamento comunitário",
                    "O índice de capacitação pode ser melhorado",
                  ],
                  benchmarks: {
                    sectorAverage: 5.2,
                    topPerformers: 8.5,
                    percentile: 78,
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/stats": {
      get: {
        tags: ["Statistics"],
        summary: "Obter estatísticas agregadas",
        description: "Retorna estatísticas agregadas de todos os cases de impacto",
        operationId: "getStats",
        security: [{ apiKey: [] }, { oauth2: ["cases:stats"] }],
        responses: {
          "200": {
            description: "Estatísticas agregadas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AggregatedStats" },
                example: {
                  totalCases: 156,
                  totalInvestment: 45000000,
                  totalBeneficiaries: 125000,
                  averageSroi: 3.8,
                  bySector: [
                    { sector: "Educação", count: 45, investment: 12000000 },
                    { sector: "Saúde", count: 38, investment: 15000000 },
                  ],
                  byRegion: [
                    { region: "Brasil", count: 89, investment: 28000000 },
                    { region: "Portugal", count: 34, investment: 10000000 },
                  ],
                  byYear: [
                    { year: 2023, count: 52, investment: 18000000 },
                    { year: 2022, count: 48, investment: 15000000 },
                  ],
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/sdgs": {
      get: {
        tags: ["SDGs"],
        summary: "Listar ODS",
        description: "Retorna a lista dos 17 Objetivos de Desenvolvimento Sustentável",
        operationId: "listSdgs",
        security: [{ apiKey: [] }, { oauth2: ["sdgs:read"] }],
        responses: {
          "200": {
            description: "Lista de ODS",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SDG" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/sdgs/{id}": {
      get: {
        tags: ["SDGs"],
        summary: "Obter ODS por ID",
        description: "Retorna detalhes de um ODS específico",
        operationId: "getSdg",
        security: [{ apiKey: [] }, { oauth2: ["sdgs:read"] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Número do ODS (1-17)",
            schema: { type: "integer", minimum: 1, maximum: 17 },
          },
        ],
        responses: {
          "200": {
            description: "Detalhes do ODS",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SDG" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description: "API Key para autenticação",
      },
      oauth2: {
        type: "oauth2",
        description: "OAuth2 Authorization Code com PKCE",
        flows: {
          authorizationCode: {
            authorizationUrl: "/oauth/authorize",
            tokenUrl: "/api/trpc/oauth.token",
            scopes: {
              "cases:read": "Ler detalhes de cases",
              "cases:list": "Listar cases",
              "cases:stats": "Acessar estatísticas",
              "calculator:use": "Usar calculadora",
              "sdgs:read": "Ler informações de ODS",
              "profile:read": "Ler perfil do usuário",
            },
          },
        },
      },
    },
    schemas: {
      CaseSummary: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID único do case" },
          title: { type: "string", description: "Título do case" },
          organization: { type: "string", description: "Organização responsável" },
          sector: { type: "string", description: "Setor de atuação" },
          region: { type: "string", description: "Região geográfica" },
          year: { type: "integer", description: "Ano do projeto" },
          investment: { type: "number", description: "Investimento em R$" },
          beneficiaries: { type: "integer", description: "Número de beneficiários" },
          sroi: { type: "number", description: "Retorno Social sobre Investimento" },
          sdgs: {
            type: "array",
            items: { type: "integer" },
            description: "ODS relacionados",
          },
        },
      },
      CaseDetail: {
        allOf: [
          { $ref: "#/components/schemas/CaseSummary" },
          {
            type: "object",
            properties: {
              description: { type: "string", description: "Descrição detalhada" },
              challenge: { type: "string", description: "Desafio enfrentado" },
              solution: { type: "string", description: "Solução implementada" },
              results: { type: "string", description: "Resultados alcançados" },
              testimonial: {
                type: "object",
                properties: {
                  quote: { type: "string" },
                  author: { type: "string" },
                  role: { type: "string" },
                },
              },
              metrics: {
                type: "object",
                properties: {
                  impactIndex: { type: "number" },
                  costPerBeneficiary: { type: "number" },
                  duration: { type: "integer", description: "Duração em meses" },
                },
              },
            },
          },
        ],
      },
      CalculatorInput: {
        type: "object",
        required: ["investment", "beneficiaries", "duration", "effectiveness"],
        properties: {
          investment: { type: "number", minimum: 0, description: "Investimento total em R$" },
          beneficiaries: { type: "integer", minimum: 1, description: "Número de beneficiários" },
          duration: { type: "integer", minimum: 1, description: "Duração em meses" },
          effectiveness: { type: "number", minimum: 0, maximum: 1, description: "Efetividade (0-1)" },
          coverage: { type: "number", minimum: 0, maximum: 1, description: "Cobertura (0-1)" },
          continuity: { type: "number", minimum: 0, maximum: 1, description: "Continuidade (0-1)" },
          costEfficiency: { type: "number", minimum: 0, maximum: 1, description: "Eficiência de custos (0-1)" },
          communityEngagement: { type: "number", minimum: 0, maximum: 1, description: "Engajamento comunitário (0-1)" },
          culturalAdaptation: { type: "number", minimum: 0, maximum: 1, description: "Adaptação cultural (0-1)" },
          capacityBuilding: { type: "number", minimum: 0, maximum: 1, description: "Capacitação (0-1)" },
          collaboration: { type: "number", minimum: 0, maximum: 1, description: "Colaboração (0-1)" },
          risk: { type: "number", minimum: 0, maximum: 1, description: "Fator de risco (0-1)" },
        },
      },
      CalculatorResult: {
        type: "object",
        properties: {
          impactIndex: { type: "number", description: "Índice de impacto calculado" },
          sroi: { type: "number", description: "Retorno Social sobre Investimento" },
          classification: { type: "string", description: "Classificação do impacto" },
          breakdown: {
            type: "object",
            description: "Detalhamento do cálculo",
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "Recomendações de melhoria",
          },
          benchmarks: {
            type: "object",
            properties: {
              sectorAverage: { type: "number" },
              topPerformers: { type: "number" },
              percentile: { type: "integer" },
            },
          },
        },
      },
      AggregatedStats: {
        type: "object",
        properties: {
          totalCases: { type: "integer" },
          totalInvestment: { type: "number" },
          totalBeneficiaries: { type: "integer" },
          averageSroi: { type: "number" },
          bySector: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sector: { type: "string" },
                count: { type: "integer" },
                investment: { type: "number" },
              },
            },
          },
          byRegion: {
            type: "array",
            items: {
              type: "object",
              properties: {
                region: { type: "string" },
                count: { type: "integer" },
                investment: { type: "number" },
              },
            },
          },
          byYear: {
            type: "array",
            items: {
              type: "object",
              properties: {
                year: { type: "integer" },
                count: { type: "integer" },
                investment: { type: "number" },
              },
            },
          },
        },
      },
      SDG: {
        type: "object",
        properties: {
          id: { type: "integer", minimum: 1, maximum: 17 },
          name: { type: "string" },
          description: { type: "string" },
          color: { type: "string", description: "Cor oficial do ODS (hex)" },
          icon: { type: "string", description: "URL do ícone" },
          targets: {
            type: "array",
            items: { type: "string" },
            description: "Metas do ODS",
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          code: { type: "string" },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Não autenticado",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              error: "Unauthorized",
              message: "API key inválida ou ausente",
              code: "UNAUTHORIZED",
            },
          },
        },
      },
      NotFound: {
        description: "Recurso não encontrado",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              error: "Not Found",
              message: "O recurso solicitado não foi encontrado",
              code: "NOT_FOUND",
            },
          },
        },
      },
      BadRequest: {
        description: "Requisição inválida",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              error: "Bad Request",
              message: "Parâmetros inválidos na requisição",
              code: "BAD_REQUEST",
            },
          },
        },
      },
      RateLimitExceeded: {
        description: "Rate limit excedido",
        headers: {
          "X-RateLimit-Limit": {
            schema: { type: "integer" },
            description: "Limite total de requisições",
          },
          "X-RateLimit-Remaining": {
            schema: { type: "integer" },
            description: "Requisições restantes",
          },
          "X-RateLimit-Reset": {
            schema: { type: "integer" },
            description: "Timestamp de reset (Unix)",
          },
        },
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: {
              error: "Too Many Requests",
              message: "Rate limit excedido. Tente novamente em 60 segundos.",
              code: "RATE_LIMIT_EXCEEDED",
            },
          },
        },
      },
    },
  },
};

export function getOpenApiSpec() {
  return openApiSpec;
}
