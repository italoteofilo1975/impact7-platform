/**
 * Fraud Detection and Risk Scoring Module
 * Camada 9: Detecção de Fraude
 * 
 * Implementa análise de risco e detecção de fraude conforme MYFIPE
 */

import * as crypto from 'crypto';

// Configurações de detecção de fraude
const FRAUD_CONFIG = {
  riskThresholds: {
    low: 30,
    medium: 60,
    high: 80,
  },
  velocityLimits: {
    maxTransactionsPerHour: 10,
    maxAmountPerHour: 10000,
    maxTransactionsPerDay: 50,
    maxAmountPerDay: 50000,
  },
  anomalyWeights: {
    newDevice: 20,
    newLocation: 15,
    unusualTime: 10,
    highAmount: 25,
    velocityExceeded: 30,
    impossibleTravel: 50,
    suspiciousPattern: 35,
  },
};

// Interface para transação
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  timestamp: number;
  ip: string;
  deviceFingerprint: string;
  location?: GeoLocation;
  merchantCategory?: string;
  paymentMethod?: string;
}

// Interface para localização
interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

// Interface para perfil de usuário
interface UserProfile {
  userId: string;
  averageTransactionAmount: number;
  typicalLocations: GeoLocation[];
  knownDevices: string[];
  typicalTransactionTimes: number[]; // Horas do dia (0-23)
  transactionHistory: Transaction[];
  riskScore: number;
  lastUpdated: number;
}

// Interface para resultado de análise de risco
interface RiskAnalysisResult {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  action: 'allow' | 'review' | 'block';
  factors: RiskFactor[];
  recommendation: string;
}

// Interface para fator de risco
interface RiskFactor {
  name: string;
  weight: number;
  description: string;
  triggered: boolean;
}

// Armazenamento em memória (em produção, usar banco de dados)
const userProfiles = new Map<string, UserProfile>();
const transactionVelocity = new Map<string, Transaction[]>();

/**
 * Gerar fingerprint de dispositivo
 */
export function generateDeviceFingerprint(
  userAgent: string,
  screenResolution?: string,
  timezone?: string,
  language?: string
): string {
  const data = [userAgent, screenResolution, timezone, language].filter(Boolean).join('|');
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

/**
 * Obter ou criar perfil de usuário
 */
function getOrCreateProfile(userId: string): UserProfile {
  let profile = userProfiles.get(userId);
  
  if (!profile) {
    profile = {
      userId,
      averageTransactionAmount: 0,
      typicalLocations: [],
      knownDevices: [],
      typicalTransactionTimes: [],
      transactionHistory: [],
      riskScore: 0,
      lastUpdated: Date.now(),
    };
    userProfiles.set(userId, profile);
  }
  
  return profile;
}

/**
 * Atualizar perfil com nova transação
 */
function updateProfile(profile: UserProfile, transaction: Transaction): void {
  // Adicionar ao histórico
  profile.transactionHistory.push(transaction);
  
  // Manter apenas últimas 100 transações
  if (profile.transactionHistory.length > 100) {
    profile.transactionHistory.shift();
  }
  
  // Atualizar média de valor
  const amounts = profile.transactionHistory.map(t => t.amount);
  profile.averageTransactionAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  
  // Atualizar dispositivos conhecidos
  if (!profile.knownDevices.includes(transaction.deviceFingerprint)) {
    profile.knownDevices.push(transaction.deviceFingerprint);
    // Manter apenas últimos 10 dispositivos
    if (profile.knownDevices.length > 10) {
      profile.knownDevices.shift();
    }
  }
  
  // Atualizar localizações típicas
  if (transaction.location) {
    const existingLocation = profile.typicalLocations.find(loc =>
      calculateDistance(loc, transaction.location!) < 50 // 50km de raio
    );
    
    if (!existingLocation) {
      profile.typicalLocations.push(transaction.location);
      // Manter apenas últimas 5 localizações
      if (profile.typicalLocations.length > 5) {
        profile.typicalLocations.shift();
      }
    }
  }
  
  // Atualizar horários típicos
  const hour = new Date(transaction.timestamp).getHours();
  if (!profile.typicalTransactionTimes.includes(hour)) {
    profile.typicalTransactionTimes.push(hour);
  }
  
  profile.lastUpdated = Date.now();
}

/**
 * Calcular distância entre duas coordenadas (Haversine)
 */
function calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Verificar velocity (frequência de transações)
 */
function checkVelocity(userId: string, transaction: Transaction): {
  exceeded: boolean;
  details: string;
} {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  // Obter transações recentes
  let userTransactions = transactionVelocity.get(userId) || [];
  
  // Limpar transações antigas
  userTransactions = userTransactions.filter(t => t.timestamp > oneDayAgo);
  
  // Adicionar nova transação
  userTransactions.push(transaction);
  transactionVelocity.set(userId, userTransactions);
  
  // Verificar limites por hora
  const lastHourTransactions = userTransactions.filter(t => t.timestamp > oneHourAgo);
  const lastHourAmount = lastHourTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (lastHourTransactions.length > FRAUD_CONFIG.velocityLimits.maxTransactionsPerHour) {
    return {
      exceeded: true,
      details: `Exceeded ${FRAUD_CONFIG.velocityLimits.maxTransactionsPerHour} transactions per hour`,
    };
  }
  
  if (lastHourAmount > FRAUD_CONFIG.velocityLimits.maxAmountPerHour) {
    return {
      exceeded: true,
      details: `Exceeded $${FRAUD_CONFIG.velocityLimits.maxAmountPerHour} per hour`,
    };
  }
  
  // Verificar limites por dia
  const lastDayAmount = userTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (userTransactions.length > FRAUD_CONFIG.velocityLimits.maxTransactionsPerDay) {
    return {
      exceeded: true,
      details: `Exceeded ${FRAUD_CONFIG.velocityLimits.maxTransactionsPerDay} transactions per day`,
    };
  }
  
  if (lastDayAmount > FRAUD_CONFIG.velocityLimits.maxAmountPerDay) {
    return {
      exceeded: true,
      details: `Exceeded $${FRAUD_CONFIG.velocityLimits.maxAmountPerDay} per day`,
    };
  }
  
  return { exceeded: false, details: '' };
}

/**
 * Verificar viagem impossível
 */
function checkImpossibleTravel(
  profile: UserProfile,
  transaction: Transaction
): { impossible: boolean; details: string } {
  if (!transaction.location || profile.transactionHistory.length === 0) {
    return { impossible: false, details: '' };
  }
  
  // Encontrar última transação com localização
  const lastTransactionWithLocation = [...profile.transactionHistory]
    .reverse()
    .find(t => t.location);
  
  if (!lastTransactionWithLocation?.location) {
    return { impossible: false, details: '' };
  }
  
  const distance = calculateDistance(lastTransactionWithLocation.location, transaction.location);
  const timeDiff = (transaction.timestamp - lastTransactionWithLocation.timestamp) / 1000 / 60 / 60; // horas
  
  // Velocidade máxima razoável: 900 km/h (avião comercial)
  const maxSpeed = 900;
  const requiredTime = distance / maxSpeed;
  
  if (timeDiff < requiredTime && distance > 100) {
    return {
      impossible: true,
      details: `${Math.round(distance)}km traveled in ${Math.round(timeDiff * 60)} minutes`,
    };
  }
  
  return { impossible: false, details: '' };
}

/**
 * Analisar risco de uma transação
 */
export function analyzeTransactionRisk(transaction: Transaction): RiskAnalysisResult {
  const profile = getOrCreateProfile(transaction.userId);
  const factors: RiskFactor[] = [];
  let totalScore = 0;
  
  // Fator 1: Dispositivo novo
  const isNewDevice = !profile.knownDevices.includes(transaction.deviceFingerprint);
  factors.push({
    name: 'new_device',
    weight: FRAUD_CONFIG.anomalyWeights.newDevice,
    description: 'Transaction from unknown device',
    triggered: isNewDevice,
  });
  if (isNewDevice) totalScore += FRAUD_CONFIG.anomalyWeights.newDevice;
  
  // Fator 2: Localização nova
  let isNewLocation = false;
  if (transaction.location && profile.typicalLocations.length > 0) {
    isNewLocation = !profile.typicalLocations.some(loc =>
      calculateDistance(loc, transaction.location!) < 100
    );
  }
  factors.push({
    name: 'new_location',
    weight: FRAUD_CONFIG.anomalyWeights.newLocation,
    description: 'Transaction from unusual location',
    triggered: isNewLocation,
  });
  if (isNewLocation) totalScore += FRAUD_CONFIG.anomalyWeights.newLocation;
  
  // Fator 3: Horário incomum
  const hour = new Date(transaction.timestamp).getHours();
  const isUnusualTime = profile.typicalTransactionTimes.length > 0 &&
    !profile.typicalTransactionTimes.includes(hour);
  factors.push({
    name: 'unusual_time',
    weight: FRAUD_CONFIG.anomalyWeights.unusualTime,
    description: 'Transaction at unusual time',
    triggered: isUnusualTime,
  });
  if (isUnusualTime) totalScore += FRAUD_CONFIG.anomalyWeights.unusualTime;
  
  // Fator 4: Valor alto
  const isHighAmount = profile.averageTransactionAmount > 0 &&
    transaction.amount > profile.averageTransactionAmount * 3;
  factors.push({
    name: 'high_amount',
    weight: FRAUD_CONFIG.anomalyWeights.highAmount,
    description: 'Transaction amount significantly higher than average',
    triggered: isHighAmount,
  });
  if (isHighAmount) totalScore += FRAUD_CONFIG.anomalyWeights.highAmount;
  
  // Fator 5: Velocity check
  const velocityCheck = checkVelocity(transaction.userId, transaction);
  factors.push({
    name: 'velocity_exceeded',
    weight: FRAUD_CONFIG.anomalyWeights.velocityExceeded,
    description: velocityCheck.details || 'Transaction velocity within limits',
    triggered: velocityCheck.exceeded,
  });
  if (velocityCheck.exceeded) totalScore += FRAUD_CONFIG.anomalyWeights.velocityExceeded;
  
  // Fator 6: Viagem impossível
  const travelCheck = checkImpossibleTravel(profile, transaction);
  factors.push({
    name: 'impossible_travel',
    weight: FRAUD_CONFIG.anomalyWeights.impossibleTravel,
    description: travelCheck.details || 'Location change is plausible',
    triggered: travelCheck.impossible,
  });
  if (travelCheck.impossible) totalScore += FRAUD_CONFIG.anomalyWeights.impossibleTravel;
  
  // Normalizar score para 0-100
  const maxPossibleScore = Object.values(FRAUD_CONFIG.anomalyWeights).reduce((a, b) => a + b, 0);
  const normalizedScore = Math.min(100, Math.round((totalScore / maxPossibleScore) * 100));
  
  // Determinar nível e ação
  let level: 'low' | 'medium' | 'high' | 'critical';
  let action: 'allow' | 'review' | 'block';
  let recommendation: string;
  
  if (normalizedScore < FRAUD_CONFIG.riskThresholds.low) {
    level = 'low';
    action = 'allow';
    recommendation = 'Transaction appears safe. Proceed normally.';
  } else if (normalizedScore < FRAUD_CONFIG.riskThresholds.medium) {
    level = 'medium';
    action = 'review';
    recommendation = 'Transaction requires additional verification. Consider 2FA or manual review.';
  } else if (normalizedScore < FRAUD_CONFIG.riskThresholds.high) {
    level = 'high';
    action = 'review';
    recommendation = 'High risk transaction. Require additional authentication and manual approval.';
  } else {
    level = 'critical';
    action = 'block';
    recommendation = 'Transaction blocked due to critical risk indicators. Contact user for verification.';
  }
  
  // Atualizar perfil se transação for permitida
  if (action !== 'block') {
    updateProfile(profile, transaction);
    profile.riskScore = normalizedScore;
  }
  
  return {
    score: normalizedScore,
    level,
    action,
    factors,
    recommendation,
  };
}

/**
 * Analisar risco de login
 */
export function analyzeLoginRisk(params: {
  userId: string;
  ip: string;
  deviceFingerprint: string;
  location?: GeoLocation;
  timestamp?: number;
}): RiskAnalysisResult {
  const { userId, ip, deviceFingerprint, location, timestamp = Date.now() } = params;
  
  // Criar transação fictícia para análise
  const loginTransaction: Transaction = {
    id: `login_${Date.now()}`,
    userId,
    amount: 0,
    currency: 'USD',
    timestamp,
    ip,
    deviceFingerprint,
    location,
  };
  
  return analyzeTransactionRisk(loginTransaction);
}

/**
 * Obter perfil de risco do usuário
 */
export function getUserRiskProfile(userId: string): UserProfile | null {
  return userProfiles.get(userId) || null;
}

/**
 * Resetar perfil de usuário (após verificação de identidade)
 */
export function resetUserProfile(userId: string): void {
  userProfiles.delete(userId);
  transactionVelocity.delete(userId);
}

/**
 * Obter estatísticas de fraude
 */
export function getFraudStats(): {
  totalProfiles: number;
  averageRiskScore: number;
  highRiskUsers: number;
  blockedTransactions: number;
} {
  let totalRiskScore = 0;
  let highRiskUsers = 0;
  
  userProfiles.forEach(profile => {
    totalRiskScore += profile.riskScore;
    if (profile.riskScore >= FRAUD_CONFIG.riskThresholds.high) {
      highRiskUsers++;
    }
  });
  
  return {
    totalProfiles: userProfiles.size,
    averageRiskScore: userProfiles.size > 0 ? totalRiskScore / userProfiles.size : 0,
    highRiskUsers,
    blockedTransactions: 0, // Implementar contador real
  };
}

export const fraudConfig = FRAUD_CONFIG;
