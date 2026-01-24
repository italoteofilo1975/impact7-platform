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
        required: ['engagement', 'clarity', 'connection', 'commitment', 'collaboration', 'creativity', 'continuity', 'resistance'],
        properties: {
          engagement: { type: 'number', minimum: 0, maximum: 100 },
          clarity: { type: 'number', minimum: 0, maximum: 100 },
          connection: { type: 'number', minimum: 0, maximum: 100 },
          commitment: { type: 'number', minimum: 0, maximum: 100 },
          collaboration: { type: 'number', minimum: 0, maximum: 100 },
          creativity: { type: 'number', minimum: 0, maximum: 100 },
          continuity: { type: 'number', minimum: 0, maximum: 100 },
          resistance: { type: 'number', minimum: 1, maximum: 100 },
          investment: { type: 'number', minimum: 0 },
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
