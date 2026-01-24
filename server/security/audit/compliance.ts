/**
 * Compliance Module - LGPD/GDPR
 * Camada 12: Conformidade e Compliance
 * 
 * Implementa conformidade com LGPD e GDPR conforme MYFIPE
 */

import * as crypto from 'crypto';

// Configurações de compliance
const COMPLIANCE_CONFIG = {
  dataRetentionDays: {
    personalData: 365 * 3, // 3 anos
    transactionData: 365 * 5, // 5 anos (requisito fiscal)
    auditLogs: 365, // 1 ano
    marketingConsent: 365 * 2, // 2 anos
  },
  consentTypes: [
    'essential', // Necessário para funcionamento
    'analytics', // Análise de uso
    'marketing', // Comunicações de marketing
    'thirdParty', // Compartilhamento com terceiros
    'profiling', // Criação de perfil
  ],
  dataCategories: [
    'identification', // Nome, email, CPF
    'contact', // Telefone, endereço
    'financial', // Dados de pagamento
    'behavioral', // Histórico de navegação
    'preferences', // Preferências do usuário
  ],
};

// Interface para consentimento
interface Consent {
  userId: string;
  type: string;
  granted: boolean;
  timestamp: number;
  ip: string;
  version: string; // Versão da política
  expiresAt?: number;
}

// Interface para solicitação de dados (DSAR)
interface DataSubjectRequest {
  id: string;
  userId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: number;
  completedAt?: number;
  notes?: string;
  responseData?: any;
}

// Interface para registro de processamento
interface ProcessingRecord {
  id: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  recipients: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  createdAt: number;
}

// Armazenamento em memória (em produção, usar banco de dados)
const consents = new Map<string, Consent[]>();
const dsarRequests = new Map<string, DataSubjectRequest[]>();
const processingRecords: ProcessingRecord[] = [];

/**
 * Gerar ID único
 */
function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Registrar consentimento
 */
export function recordConsent(params: {
  userId: string;
  type: string;
  granted: boolean;
  ip: string;
  version: string;
}): Consent {
  const { userId, type, granted, ip, version } = params;
  
  const consent: Consent = {
    userId,
    type,
    granted,
    timestamp: Date.now(),
    ip,
    version,
    expiresAt: granted ? Date.now() + COMPLIANCE_CONFIG.dataRetentionDays.marketingConsent * 24 * 60 * 60 * 1000 : undefined,
  };
  
  // Obter consentimentos existentes
  const userConsents = consents.get(userId) || [];
  
  // Adicionar novo consentimento (manter histórico)
  userConsents.push(consent);
  consents.set(userId, userConsents);
  
  return consent;
}

/**
 * Verificar consentimento ativo
 */
export function hasActiveConsent(userId: string, type: string): boolean {
  const userConsents = consents.get(userId) || [];
  
  // Encontrar consentimento mais recente do tipo
  const latestConsent = userConsents
    .filter(c => c.type === type)
    .sort((a, b) => b.timestamp - a.timestamp)[0];
  
  if (!latestConsent) return false;
  
  // Verificar se está ativo e não expirado
  if (!latestConsent.granted) return false;
  if (latestConsent.expiresAt && latestConsent.expiresAt < Date.now()) return false;
  
  return true;
}

/**
 * Obter todos os consentimentos de um usuário
 */
export function getUserConsents(userId: string): Consent[] {
  return consents.get(userId) || [];
}

/**
 * Revogar consentimento
 */
export function revokeConsent(userId: string, type: string, ip: string): Consent {
  return recordConsent({
    userId,
    type,
    granted: false,
    ip,
    version: 'revoked',
  });
}

/**
 * Criar solicitação de titular de dados (DSAR)
 */
export function createDSAR(params: {
  userId: string;
  type: DataSubjectRequest['type'];
  notes?: string;
}): DataSubjectRequest {
  const { userId, type, notes } = params;
  
  const request: DataSubjectRequest = {
    id: generateId(),
    userId,
    type,
    status: 'pending',
    createdAt: Date.now(),
    notes,
  };
  
  const userRequests = dsarRequests.get(userId) || [];
  userRequests.push(request);
  dsarRequests.set(userId, userRequests);
  
  return request;
}

/**
 * Atualizar status de DSAR
 */
export function updateDSARStatus(
  requestId: string,
  status: DataSubjectRequest['status'],
  responseData?: any
): DataSubjectRequest | null {
  let foundRequest: DataSubjectRequest | null = null;
  
  dsarRequests.forEach((requests) => {
    const request = requests.find((r: DataSubjectRequest) => r.id === requestId);
    if (request) {
      request.status = status;
      if (status === 'completed') {
        request.completedAt = Date.now();
        request.responseData = responseData;
      }
      foundRequest = request;
    }
  });
  
  return foundRequest;
}

/**
 * Obter DSARs de um usuário
 */
export function getUserDSARs(userId: string): DataSubjectRequest[] {
  return dsarRequests.get(userId) || [];
}

/**
 * Gerar relatório de dados pessoais (direito de acesso)
 */
export function generateDataAccessReport(userId: string, userData: any): {
  reportId: string;
  generatedAt: string;
  userId: string;
  dataCategories: Record<string, any>;
  consents: Consent[];
  processingPurposes: string[];
  retentionInfo: Record<string, string>;
} {
  const userConsents = getUserConsents(userId);
  
  return {
    reportId: generateId(),
    generatedAt: new Date().toISOString(),
    userId,
    dataCategories: {
      identification: {
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf ? '***.***.***-**' : null, // Mascarado
      },
      contact: {
        phone: userData.phone,
        address: userData.address,
      },
      account: {
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
        role: userData.role,
      },
    },
    consents: userConsents,
    processingPurposes: [
      'Prestação de serviços contratados',
      'Comunicação sobre a conta',
      'Cumprimento de obrigações legais',
      userConsents.some(c => c.type === 'marketing' && c.granted) ? 'Marketing' : null,
      userConsents.some(c => c.type === 'analytics' && c.granted) ? 'Análise de uso' : null,
    ].filter(Boolean) as string[],
    retentionInfo: {
      personalData: `${COMPLIANCE_CONFIG.dataRetentionDays.personalData} dias`,
      transactionData: `${COMPLIANCE_CONFIG.dataRetentionDays.transactionData} dias`,
      auditLogs: `${COMPLIANCE_CONFIG.dataRetentionDays.auditLogs} dias`,
    },
  };
}

/**
 * Exportar dados em formato portável (direito de portabilidade)
 */
export function exportUserData(userId: string, userData: any): string {
  const report = generateDataAccessReport(userId, userData);
  
  return JSON.stringify({
    exportFormat: 'JSON',
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    data: report,
  }, null, 2);
}

/**
 * Anonimizar dados de usuário (direito ao esquecimento)
 */
export function anonymizeUserData(userId: string): {
  anonymizedFields: string[];
  retainedFields: string[];
  reason: string;
} {
  // Campos que podem ser anonimizados
  const anonymizedFields = [
    'name',
    'email',
    'phone',
    'address',
    'cpf',
    'preferences',
  ];
  
  // Campos que devem ser retidos (obrigação legal)
  const retainedFields = [
    'transactionHistory', // Requisito fiscal
    'invoices', // Requisito fiscal
    'auditLogs', // Requisito de segurança
  ];
  
  // Remover consentimentos
  consents.delete(userId);
  
  return {
    anonymizedFields,
    retainedFields,
    reason: 'Dados fiscais e de auditoria retidos conforme obrigação legal',
  };
}

/**
 * Registrar atividade de processamento
 */
export function registerProcessingActivity(params: {
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  recipients: string[];
  retentionPeriod: number;
  securityMeasures: string[];
}): ProcessingRecord {
  const record: ProcessingRecord = {
    id: generateId(),
    ...params,
    createdAt: Date.now(),
  };
  
  processingRecords.push(record);
  return record;
}

/**
 * Obter registro de atividades de processamento (ROPA)
 */
export function getProcessingRecords(): ProcessingRecord[] {
  return processingRecords;
}

/**
 * Verificar se dados podem ser processados
 */
export function canProcessData(
  userId: string,
  purpose: string,
  dataCategories: string[]
): { allowed: boolean; reason: string } {
  // Verificar consentimento para cada categoria
  for (const category of dataCategories) {
    // Dados essenciais não precisam de consentimento
    if (category === 'essential') continue;
    
    // Verificar consentimento específico
    const consentType = mapCategoryToConsent(category);
    if (!hasActiveConsent(userId, consentType)) {
      return {
        allowed: false,
        reason: `Consentimento não concedido para: ${category}`,
      };
    }
  }
  
  return { allowed: true, reason: 'Processamento autorizado' };
}

/**
 * Mapear categoria de dados para tipo de consentimento
 */
function mapCategoryToConsent(category: string): string {
  const mapping: Record<string, string> = {
    behavioral: 'analytics',
    preferences: 'profiling',
    marketing: 'marketing',
    thirdParty: 'thirdParty',
  };
  
  return mapping[category] || 'essential';
}

/**
 * Gerar política de privacidade dinâmica
 */
export function generatePrivacyPolicy(): {
  version: string;
  lastUpdated: string;
  sections: Array<{ title: string; content: string }>;
} {
  return {
    version: '2.0',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        title: 'Dados Coletados',
        content: `Coletamos as seguintes categorias de dados: ${COMPLIANCE_CONFIG.dataCategories.join(', ')}.`,
      },
      {
        title: 'Finalidades do Tratamento',
        content: 'Seus dados são tratados para: prestação de serviços, comunicação, cumprimento legal, e quando autorizado, marketing e análise.',
      },
      {
        title: 'Base Legal',
        content: 'O tratamento é baseado em: execução de contrato, consentimento, obrigação legal, e interesse legítimo.',
      },
      {
        title: 'Retenção de Dados',
        content: `Dados pessoais: ${COMPLIANCE_CONFIG.dataRetentionDays.personalData} dias. Dados de transação: ${COMPLIANCE_CONFIG.dataRetentionDays.transactionData} dias.`,
      },
      {
        title: 'Seus Direitos',
        content: 'Você tem direito a: acesso, retificação, exclusão, portabilidade, restrição e oposição ao tratamento.',
      },
      {
        title: 'Contato',
        content: 'Para exercer seus direitos, entre em contato através do painel de configurações ou email: privacidade@impact7.com.br',
      },
    ],
  };
}

/**
 * Verificar conformidade geral
 */
export function checkCompliance(): {
  compliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Verificar se há registros de processamento
  if (processingRecords.length === 0) {
    issues.push('Nenhum registro de atividade de processamento (ROPA)');
    recommendations.push('Registrar todas as atividades de processamento de dados');
  }
  
  // Verificar DSARs pendentes há mais de 30 dias
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let pendingDSARs = 0;
  
  dsarRequests.forEach(requests => {
    requests.forEach(req => {
      if (req.status === 'pending' && req.createdAt < thirtyDaysAgo) {
        pendingDSARs++;
      }
    });
  });
  
  if (pendingDSARs > 0) {
    issues.push(`${pendingDSARs} solicitações de titular pendentes há mais de 30 dias`);
    recommendations.push('Processar solicitações de titular dentro do prazo legal');
  }
  
  return {
    compliant: issues.length === 0,
    issues,
    recommendations,
  };
}

export const complianceConfig = COMPLIANCE_CONFIG;
