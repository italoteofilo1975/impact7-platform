/**
 * Middleware de Validação e Sanitização de Entrada
 * Garante que todos os dados de entrada são seguros e válidos
 */

import { z } from "zod";

/**
 * Sanitizar string removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, "")
    // Escapa HTML básico
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Remove caracteres de controle (exceto newline e tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Sanitizar objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === "string" ? sanitizeString(item) :
        typeof item === "object" && item !== null ? sanitizeObject(item as Record<string, unknown>) :
        item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

/**
 * Validar URL
 */
export function isValidUrl(url: string): boolean {
  const urlSchema = z.string().url();
  return urlSchema.safeParse(url).success;
}

/**
 * Validar UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidSchema = z.string().uuid();
  return uuidSchema.safeParse(uuid).success;
}

/**
 * Schemas de validação comuns
 */
export const commonSchemas = {
  email: z.string().email("Email inválido").max(255),
  
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos"),
  
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, "Telefone inválido")
    .min(8, "Telefone muito curto")
    .max(20, "Telefone muito longo"),
  
  url: z.string().url("URL inválida").max(2048),
  
  text: z.string().max(10000, "Texto muito longo"),
  
  shortText: z.string().max(500, "Texto muito longo"),
  
  positiveNumber: z.number().positive("Deve ser um número positivo"),
  
  percentage: z.number().min(0).max(100, "Deve ser entre 0 e 100"),
  
  currency: z.number().min(0, "Valor não pode ser negativo"),
  
  date: z.coerce.date(),
  
  uuid: z.string().uuid("ID inválido"),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, "Slug inválido")
    .min(3)
    .max(100),
};

/**
 * Validar e sanitizar input de formulário de contato
 */
export const contactFormSchema = z.object({
  name: commonSchemas.name,
  email: commonSchemas.email,
  phone: commonSchemas.phone.optional(),
  subject: commonSchemas.shortText,
  message: commonSchemas.text,
});

/**
 * Validar e sanitizar input de cálculo S-ROI
 */
export const calculatorInputSchema = z.object({
  projectName: commonSchemas.name,
  investmentAmount: commonSchemas.currency,
  directBeneficiaries: z.number().int().positive(),
  indirectBeneficiaries: z.number().int().nonnegative(),
  projectDuration: z.number().int().positive().max(120, "Duração máxima de 120 meses"),
  sector: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
});

/**
 * Validar e sanitizar input de submissão de case
 */
export const caseSubmissionSchema = z.object({
  organizationName: commonSchemas.name,
  projectName: commonSchemas.name,
  description: commonSchemas.text,
  sector: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  investment: commonSchemas.currency,
  beneficiaries: z.number().int().positive(),
  sroi: z.number().positive().max(100, "S-ROI máximo de 100"),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  contactEmail: commonSchemas.email,
  contactName: commonSchemas.name,
});

/**
 * Middleware para validar e sanitizar request body
 */
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  // Primeiro sanitiza
  const sanitized = typeof data === "object" && data !== null 
    ? sanitizeObject(data as Record<string, unknown>)
    : data;
  
  // Depois valida
  return schema.parse(sanitized);
}

/**
 * Rate limit por IP (em memória)
 */
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  
  if (!record || record.resetAt < now) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Limpar registros antigos periodicamente
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(ipRequestCounts.entries());
  for (const [ip, record] of entries) {
    if (record.resetAt < now) {
      ipRequestCounts.delete(ip);
    }
  }
}, 60000);
