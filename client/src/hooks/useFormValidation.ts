/**
 * Hooks de Validação de Formulários
 * Integração react-hook-form + Zod para validação consistente
 */

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  contactSchema,
  registrationSchema,
  impactCalculatorSchema,
  newsletterSchema,
  whitepaperDownloadSchema,
  caseSubmissionSchema,
  type ContactFormData,
  type RegistrationFormData,
  type ImpactCalculatorData,
  type NewsletterFormData,
  type WhitepaperDownloadData,
  type CaseSubmissionData,
} from '../../../shared/validation/schemas';

/**
 * Hook para formulário de contato
 * Validação: nome (2-100 chars), email, telefone opcional, mensagem (10-2000 chars)
 */
export function useContactForm(defaultValues?: Partial<ContactFormData>): UseFormReturn<ContactFormData> {
  return useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      organization: '',
      phone: '',
      message: '',
      subject: '',
      ...defaultValues,
    },
    mode: 'onBlur', // Valida ao sair do campo
  });
}

/**
 * Hook para formulário de registro
 * Validação: nome, email, senha forte (8+ chars, maiúscula, minúscula, número), confirmação, termos
 */
export function useRegistrationForm(defaultValues?: Partial<RegistrationFormData>): UseFormReturn<RegistrationFormData> {
  return useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      organization: '',
      acceptTerms: false,
      ...defaultValues,
    },
    mode: 'onBlur',
  });
}

/**
 * Hook para calculadora de impacto
 * Validação: 7 C's (0-100), resistência (1-100), investimento opcional
 */
export function useCalculatorForm(defaultValues?: Partial<ImpactCalculatorData>): UseFormReturn<ImpactCalculatorData> {
  return useForm<ImpactCalculatorData>({
    resolver: zodResolver(impactCalculatorSchema),
    defaultValues: {
      clarity: 50,
      connection: 50,
      commitment: 50,
      collaboration: 50,
      creativity: 50,
      continuity: 50,
      engagement: 50,
      resistance: 20,
      investment: undefined,
      projectName: '',
      organization: '',
      ...defaultValues,
    },
    mode: 'onChange', // Valida em tempo real para sliders
  });
}

/**
 * Hook para formulário de newsletter
 * Validação: email, nome opcional, interesses opcionais
 */
export function useNewsletterForm(defaultValues?: Partial<NewsletterFormData>): UseFormReturn<NewsletterFormData> {
  return useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      name: '',
      interests: [],
      ...defaultValues,
    },
    mode: 'onBlur',
  });
}

/**
 * Hook para formulário de download de whitepaper
 * Validação: email, nome, organização opcional, cargo opcional
 */
export function useWhitepaperForm(defaultValues?: Partial<WhitepaperDownloadData>): UseFormReturn<WhitepaperDownloadData> {
  return useForm<WhitepaperDownloadData>({
    resolver: zodResolver(whitepaperDownloadSchema),
    defaultValues: {
      email: '',
      name: '',
      organization: '',
      role: '',
      ...defaultValues,
    },
    mode: 'onBlur',
  });
}

/**
 * Hook para formulário de submissão de case
 * Validação: título (5-200 chars), organização, desafio/solução/resultados (50-2000 chars)
 */
export function useCaseSubmissionForm(defaultValues?: Partial<CaseSubmissionData>): UseFormReturn<CaseSubmissionData> {
  return useForm<CaseSubmissionData>({
    resolver: zodResolver(caseSubmissionSchema),
    defaultValues: {
      projectTitle: '',
      organizationName: '',
      sector: '',
      location: '',
      challenge: '',
      solution: '',
      results: '',
      investment: undefined,
      beneficiaries: undefined,
      duration: '',
      contactName: '',
      contactEmail: '',
      ...defaultValues,
    },
    mode: 'onBlur',
  });
}

/**
 * Helper para extrair mensagens de erro do formulário
 * Uso: const errorMessage = getFormErrorMessage(form.formState.errors, 'fieldName');
 */
export function getFormErrorMessage(errors: Record<string, any>, fieldName: string): string | undefined {
  const error = errors[fieldName];
  return error?.message as string | undefined;
}

/**
 * Helper para verificar se um campo tem erro
 * Uso: const hasError = hasFormError(form.formState.errors, 'fieldName');
 */
export function hasFormError(errors: Record<string, any>, fieldName: string): boolean {
  return !!errors[fieldName];
}
