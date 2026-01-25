/**
 * Schemas de Validação Zod
 * Validação consistente de formulários no frontend e backend
 */

import { z } from 'zod';

/**
 * Schema de Contato
 * Usado em: Contact form, Lead generation
 */
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(320, 'Email muito longo'),
  organization: z.string()
    .max(200, 'Nome da organização muito longo')
    .optional(),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Telefone inválido')
    .min(8, 'Telefone muito curto')
    .max(20, 'Telefone muito longo')
    .optional(),
  message: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(2000, 'Mensagem muito longa')
    .optional(),
  subject: z.string()
    .max(200, 'Assunto muito longo')
    .optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Schema de Registro de Usuário
 * Usado em: User registration, Sign up
 */
export const registrationSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(320, 'Email muito longo'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha muito longa')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
  organization: z.string()
    .max(200, 'Nome da organização muito longo')
    .optional(),
  acceptTerms: z.boolean()
    .refine(val => val === true, 'Você deve aceitar os termos de uso'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Schema de Cálculo de Impacto
 * Usado em: Impact Calculator
 */
export const impactCalculatorSchema = z.object({
  // 7 C's - Context dimensions
  clarity: z.number()
    .min(0, 'Valor deve ser entre 0 e 100')
    .max(100, 'Valor deve ser entre 0 e 100'),
  connection: z.number()
    .min(0, 'Valor deve ser entre 0 e 100')
    .max(100, 'Valor deve ser entre 0 e 100'),
  commitment: z.number()
    .min(0, 'Valor deve ser entre 0 e 100')
    .max(100, 'Valor deve ser entre 0 e 100'),
  collaboration: z.number()
    .min(0, 'Valor deve ser entre 0 e 100')
    .max(100, 'Valor deve ser entre 0 e 100'),
  creativity: z.number()
    .min(0, 'Valor deve ser entre 0 e 100')
    .max(100, 'Valor deve ser entre 0 e 100'),
  continuity: z.number()
    .min(0, 'Valor deve ser entre 0 e 100')
    .max(100, 'Valor deve ser entre 0 e 100'),
  engagement: z.number()
    .min(0, 'Valor deve ser entre 0 e 100')
    .max(100, 'Valor deve ser entre 0 e 100'),
  
  // Resistance
  resistance: z.number()
    .min(1, 'Resistência deve ser maior que 0')
    .max(100, 'Valor deve ser entre 1 e 100'),
  
  // Optional fields
  investment: z.number()
    .min(0, 'Investimento não pode ser negativo')
    .optional(),
  projectName: z.string()
    .max(200, 'Nome do projeto muito longo')
    .optional(),
  organization: z.string()
    .max(200, 'Nome da organização muito longo')
    .optional(),
});

export type ImpactCalculatorData = z.infer<typeof impactCalculatorSchema>;

/**
 * Schema de Newsletter
 * Usado em: Newsletter subscription
 */
export const newsletterSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(320, 'Email muito longo'),
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  interests: z.array(z.string())
    .optional(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

/**
 * Schema de Download de Whitepaper
 * Usado em: Whitepaper download form
 */
export const whitepaperDownloadSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(320, 'Email muito longo'),
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  organization: z.string()
    .max(200, 'Nome da organização muito longo')
    .optional(),
  role: z.string()
    .max(100, 'Cargo muito longo')
    .optional(),
});

export type WhitepaperDownloadData = z.infer<typeof whitepaperDownloadSchema>;

/**
 * Schema de Case Submission
 * Usado em: Submit case study
 */
export const caseSubmissionSchema = z.object({
  projectTitle: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título muito longo'),
  organizationName: z.string()
    .min(2, 'Nome da organização deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  sector: z.string()
    .max(100, 'Setor muito longo'),
  location: z.string()
    .max(200, 'Localização muito longa'),
  challenge: z.string()
    .min(50, 'Descrição do desafio deve ter pelo menos 50 caracteres')
    .max(2000, 'Descrição muito longa'),
  solution: z.string()
    .min(50, 'Descrição da solução deve ter pelo menos 50 caracteres')
    .max(2000, 'Descrição muito longa'),
  results: z.string()
    .min(50, 'Descrição dos resultados deve ter pelo menos 50 caracteres')
    .max(2000, 'Descrição muito longa'),
  investment: z.number()
    .min(0, 'Investimento não pode ser negativo')
    .optional(),
  beneficiaries: z.number()
    .min(0, 'Número de beneficiários não pode ser negativo')
    .optional(),
  duration: z.string()
    .max(100, 'Duração muito longa')
    .optional(),
  contactName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  contactEmail: z.string()
    .email('Email inválido')
    .max(320, 'Email muito longo'),
});

export type CaseSubmissionData = z.infer<typeof caseSubmissionSchema>;
