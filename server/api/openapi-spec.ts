/**
 * OpenAPI 3.0 Specification for IMPACT7 Public API
 */

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'IMPACT7 Public API',
    description: 'API REST pública para integração com a plataforma IMPACT7.',
    version: '1.0.0',
    contact: {
      name: 'IMPACT7 Support',
      email: 'api@impact7.com',
    },
  },
  servers: [
    { url: '/api/v1', description: 'Production API' },
  ],
  tags: [
    { name: 'Cases', description: 'Casos de estudo' },
    { name: 'Calculator', description: 'Calculadora de impacto' },
    { name: 'Leads', description: 'Gestão de leads' },
    { name: 'Metrics', description: 'Métricas públicas' },
    { name: 'System', description: 'Sistema' },
  ],
  paths: {
    '/cases': {
      get: {
        tags: ['Cases'],
        summary: 'Listar casos',
        operationId: 'listCases',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { '200': { description: 'Lista de casos' } },
        security: [{ ApiKeyAuth: [] }],
      },
    },
    '/cases/{id}': {
      get: {
        tags: ['Cases'],
        summary: 'Obter caso',
        operationId: 'getCase',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Detalhes do caso' }, '404': { description: 'Não encontrado' } },
        security: [{ ApiKeyAuth: [] }],
      },
    },
    '/calculator': {
      post: {
        tags: ['Calculator'],
        summary: 'Calcular impacto',
        operationId: 'calculate',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CalculatorInput' } } } },
        responses: { '200': { description: 'Resultado' } },
        security: [{ ApiKeyAuth: [] }],
      },
    },
    '/leads': {
      post: {
        tags: ['Leads'],
        summary: 'Criar lead',
        operationId: 'createLead',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LeadInput' } } } },
        responses: { '201': { description: 'Lead criado' } },
        security: [{ ApiKeyAuth: [] }],
      },
    },
    '/metrics': {
      get: {
        tags: ['Metrics'],
        summary: 'Obter métricas',
        operationId: 'getMetrics',
        responses: { '200': { description: 'Métricas' } },
        security: [{ ApiKeyAuth: [] }],
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        operationId: 'healthCheck',
        responses: { '200': { description: 'OK' } },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
    },
    schemas: {
      CalculatorInput: {
        type: 'object',
        description: 'Entrada da simulação ilustrativa do S-ROI honesto (não é dado de nenhuma iniciativa real).',
        required: ['gatilhos', 'transformacoes', 'valorGatilhoReais', 'valorTransformacaoReais', 'atribuicaoPercent', 'custoImtsReais'],
        properties: {
          gatilhos: { type: 'integer', minimum: 0, description: 'Pessoas que cruzaram o limiar de impacto (nível Preparar do Funil IMPACTA)' },
          transformacoes: { type: 'integer', minimum: 0, description: 'Subconjunto com transformação sustentada (nível Transformar)' },
          valorGatilhoReais: { type: 'number', minimum: 0, description: 'Proxy de valor monetário por gatilho, em reais' },
          valorTransformacaoReais: { type: 'number', minimum: 0, description: 'Proxy de valor monetário por transformação, em reais' },
          atribuicaoPercent: { type: 'number', minimum: 0, maximum: 100, description: 'Percentual de atribuição (0-100)' },
          deadweightPercent: { type: 'number', minimum: 0, maximum: 100, description: 'Percentual de deadweight (0-100), default 0' },
          dropOffPercent: { type: 'number', minimum: 0, maximum: 100, description: 'Percentual de drop-off (0-100), default 0' },
          custoImtsReais: { type: 'number', minimum: 0, exclusiveMinimum: true, description: 'Custo fixo da IMTS, em reais' },
        },
      },
      CalculatorResult: {
        type: 'object',
        description: 'Resultado da simulação ilustrativa (não é um S-ROI auditado).',
        properties: {
          success: { type: 'boolean' },
          illustrative: { type: 'boolean', description: 'Sempre true — sinaliza que o resultado é uma simulação, não um dado auditado.' },
          disclaimer: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              gatilhos: { type: 'integer' },
              transformacoes: { type: 'integer' },
              valorSocialBruto: { type: 'number' },
              fatorDesconto: { type: 'number' },
              valorSocial: { type: 'number' },
              custo: { type: 'number' },
              sroi: { type: 'number' },
              alavancagem: { type: 'number' },
              sensibilidade: {
                type: 'object',
                properties: {
                  sroiLow: { type: 'number' },
                  sroiHigh: { type: 'number' },
                },
              },
            },
          },
        },
      },
      LeadInput: {
        type: 'object',
        required: ['email'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          organization: { type: 'string' },
          phone: { type: 'string' },
          source: { type: 'string', enum: ['contact_form', 'whitepaper_download', 'ebook', 'scheduling', 'calculator'] },
          message: { type: 'string' },
        },
      },
    },
  },
};

export default openApiSpec;
