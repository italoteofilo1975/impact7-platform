/**
 * Input Validation Module
 * Camada 4: Proteção contra Injeção
 * Camada 7: Validação e Sanitização
 * 
 * Implementa validação de entrada com whitelist conforme MYFIPE
 */

// Configurações de validação
const VALIDATION_CONFIG = {
  maxStringLength: 10000,
  maxArrayLength: 1000,
  maxObjectDepth: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
  ],
  allowedProtocols: ['http:', 'https:'],
};

// Interface para resultado de validação
interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: any;
}

/**
 * Validar email com regex e formato
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email é obrigatório' };
  }
  
  // Limite de tamanho
  if (email.length > 254) {
    return { valid: false, error: 'Email muito longo' };
  }
  
  // Regex para validação de email (RFC 5322)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' };
  }
  
  // Verificar domínio tem pelo menos um ponto
  const [, domain] = email.split('@');
  if (!domain.includes('.')) {
    return { valid: false, error: 'Domínio de email inválido' };
  }
  
  return { valid: true, sanitized: email.toLowerCase().trim() };
}

/**
 * Validar CPF com dígito verificador
 */
export function validateCPF(cpf: string): ValidationResult {
  if (!cpf || typeof cpf !== 'string') {
    return { valid: false, error: 'CPF é obrigatório' };
  }
  
  // Remover caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verificar tamanho
  if (cleanCPF.length !== 11) {
    return { valid: false, error: 'CPF deve ter 11 dígitos' };
  }
  
  // Verificar se não são todos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { valid: false, error: 'CPF inválido' };
  }
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  // Verificar dígitos
  if (parseInt(cleanCPF[9]) !== digit1 || parseInt(cleanCPF[10]) !== digit2) {
    return { valid: false, error: 'CPF inválido' };
  }
  
  return { valid: true, sanitized: cleanCPF };
}

/**
 * Validar CNPJ com dígito verificador
 */
export function validateCNPJ(cnpj: string): ValidationResult {
  if (!cnpj || typeof cnpj !== 'string') {
    return { valid: false, error: 'CNPJ é obrigatório' };
  }
  
  // Remover caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verificar tamanho
  if (cleanCNPJ.length !== 14) {
    return { valid: false, error: 'CNPJ deve ter 14 dígitos' };
  }
  
  // Verificar se não são todos iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return { valid: false, error: 'CNPJ inválido' };
  }
  
  // Calcular primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  // Calcular segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  // Verificar dígitos
  if (parseInt(cleanCNPJ[12]) !== digit1 || parseInt(cleanCNPJ[13]) !== digit2) {
    return { valid: false, error: 'CNPJ inválido' };
  }
  
  return { valid: true, sanitized: cleanCNPJ };
}

/**
 * Validar telefone no formato E.164
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Telefone é obrigatório' };
  }
  
  // Remover caracteres não numéricos (exceto +)
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Verificar formato E.164
  // +[código país][número] - máximo 15 dígitos
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  
  if (!e164Regex.test(cleanPhone)) {
    return { valid: false, error: 'Formato de telefone inválido (use E.164: +5511999999999)' };
  }
  
  // Normalizar para formato E.164
  const normalized = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  
  return { valid: true, sanitized: normalized };
}

/**
 * Validar URL com protocolo whitelist
 */
export function validateURL(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL é obrigatória' };
  }
  
  try {
    const parsed = new URL(url);
    
    // Verificar protocolo permitido
    if (!VALIDATION_CONFIG.allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: `Protocolo não permitido. Use: ${VALIDATION_CONFIG.allowedProtocols.join(', ')}` };
    }
    
    // Verificar se não é localhost em produção
    if (process.env.NODE_ENV === 'production') {
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return { valid: false, error: 'URLs localhost não são permitidas em produção' };
      }
    }
    
    return { valid: true, sanitized: parsed.href };
  } catch {
    return { valid: false, error: 'URL inválida' };
  }
}

/**
 * Validar arquivo (tipo MIME e tamanho)
 */
export function validateFile(
  mimeType: string,
  size: number,
  filename: string
): ValidationResult {
  // Verificar tipo MIME
  if (!VALIDATION_CONFIG.allowedMimeTypes.includes(mimeType)) {
    return { 
      valid: false, 
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${VALIDATION_CONFIG.allowedMimeTypes.join(', ')}` 
    };
  }
  
  // Verificar tamanho
  if (size > VALIDATION_CONFIG.maxFileSize) {
    return { 
      valid: false, 
      error: `Arquivo muito grande. Máximo: ${VALIDATION_CONFIG.maxFileSize / 1024 / 1024}MB` 
    };
  }
  
  // Sanitizar nome do arquivo (remover path traversal)
  const sanitizedFilename = filename
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  
  return { valid: true, sanitized: { mimeType, size, filename: sanitizedFilename } };
}

/**
 * Validar número de cartão de crédito (Luhn algorithm)
 */
export function validateCreditCard(cardNumber: string): ValidationResult {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return { valid: false, error: 'Número do cartão é obrigatório' };
  }
  
  // Remover espaços e hífens
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Verificar se são apenas dígitos
  if (!/^\d+$/.test(cleanNumber)) {
    return { valid: false, error: 'Número do cartão deve conter apenas dígitos' };
  }
  
  // Verificar tamanho (13-19 dígitos)
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { valid: false, error: 'Número do cartão inválido' };
  }
  
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, error: 'Número do cartão inválido' };
  }
  
  // Retornar apenas últimos 4 dígitos (para exibição)
  return { 
    valid: true, 
    sanitized: {
      lastFour: cleanNumber.slice(-4),
      brand: detectCardBrand(cleanNumber),
    }
  };
}

/**
 * Detectar bandeira do cartão
 */
function detectCardBrand(cardNumber: string): string {
  const patterns: Record<string, RegExp> = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^(?:2131|1800|35)/,
    elo: /^(?:636368|438935|504175|451416|636297)/,
    hipercard: /^(?:38|60)/,
  };
  
  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return brand;
    }
  }
  
  return 'unknown';
}

/**
 * Validar CVV/CVC
 */
export function validateCVV(cvv: string, cardBrand?: string): ValidationResult {
  if (!cvv || typeof cvv !== 'string') {
    return { valid: false, error: 'CVV é obrigatório' };
  }
  
  // Remover espaços
  const cleanCVV = cvv.trim();
  
  // Verificar se são apenas dígitos
  if (!/^\d+$/.test(cleanCVV)) {
    return { valid: false, error: 'CVV deve conter apenas dígitos' };
  }
  
  // AMEX usa 4 dígitos, outros usam 3
  const expectedLength = cardBrand === 'amex' ? 4 : 3;
  
  if (cleanCVV.length !== expectedLength && cleanCVV.length !== 3 && cleanCVV.length !== 4) {
    return { valid: false, error: `CVV deve ter ${expectedLength} dígitos` };
  }
  
  return { valid: true };
}

/**
 * Validar data no formato ISO 8601
 */
export function validateDate(dateString: string): ValidationResult {
  if (!dateString || typeof dateString !== 'string') {
    return { valid: false, error: 'Data é obrigatória' };
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Data inválida' };
  }
  
  return { valid: true, sanitized: date.toISOString() };
}

/**
 * Validar moeda (formato decimal)
 */
export function validateCurrency(value: string | number): ValidationResult {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return { valid: false, error: 'Valor monetário inválido' };
  }
  
  if (numValue < 0) {
    return { valid: false, error: 'Valor não pode ser negativo' };
  }
  
  // Arredondar para 2 casas decimais
  const sanitized = Math.round(numValue * 100) / 100;
  
  return { valid: true, sanitized };
}

/**
 * Validar string genérica com limites
 */
export function validateString(
  value: string,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
  } = {}
): ValidationResult {
  const {
    minLength = 0,
    maxLength = VALIDATION_CONFIG.maxStringLength,
    pattern,
    allowEmpty = false,
  } = options;
  
  if (!value && !allowEmpty) {
    return { valid: false, error: 'Campo é obrigatório' };
  }
  
  if (typeof value !== 'string') {
    return { valid: false, error: 'Valor deve ser uma string' };
  }
  
  if (value.length < minLength) {
    return { valid: false, error: `Mínimo de ${minLength} caracteres` };
  }
  
  if (value.length > maxLength) {
    return { valid: false, error: `Máximo de ${maxLength} caracteres` };
  }
  
  if (pattern && !pattern.test(value)) {
    return { valid: false, error: 'Formato inválido' };
  }
  
  return { valid: true, sanitized: value.trim() };
}

/**
 * Validar número inteiro
 */
export function validateInteger(
  value: string | number,
  options: { min?: number; max?: number } = {}
): ValidationResult {
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = options;
  
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(numValue) || !Number.isInteger(numValue)) {
    return { valid: false, error: 'Valor deve ser um número inteiro' };
  }
  
  if (numValue < min) {
    return { valid: false, error: `Valor mínimo: ${min}` };
  }
  
  if (numValue > max) {
    return { valid: false, error: `Valor máximo: ${max}` };
  }
  
  return { valid: true, sanitized: numValue };
}

/**
 * Validar UUID
 */
export function validateUUID(uuid: string): ValidationResult {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: 'UUID é obrigatório' };
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'UUID inválido' };
  }
  
  return { valid: true, sanitized: uuid.toLowerCase() };
}

export const validationConfig = VALIDATION_CONFIG;
