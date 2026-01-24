/**
 * Stripe Products and Prices Configuration
 * 
 * Define all subscription plans and one-time products here.
 * Price IDs should be updated after creating products in Stripe Dashboard.
 */

export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // in cents (BRL)
  priceYearly: number; // in cents (BRL)
  stripePriceIdMonthly?: string; // Set after creating in Stripe
  stripePriceIdYearly?: string; // Set after creating in Stripe
  features: string[];
  limits: {
    projects: number;
    beneficiaries: number;
    teamMembers: number;
    apiCalls: number;
  };
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Para começar a medir impacto',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '1 projeto ativo',
      'Calculadora SROI básica',
      'Até 100 beneficiários',
      'Relatórios básicos',
      'Suporte por email',
    ],
    limits: {
      projects: 1,
      beneficiaries: 100,
      teamMembers: 1,
      apiCalls: 100,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para organizações em crescimento',
    priceMonthly: 19900, // R$ 199,00
    priceYearly: 199000, // R$ 1.990,00 (2 meses grátis)
    // Price IDs will be set after creating products in Stripe Dashboard
    // stripePriceIdMonthly: 'price_xxx',
    // stripePriceIdYearly: 'price_xxx',
    features: [
      '10 projetos ativos',
      'Calculadora SROI completa',
      'Beneficiários ilimitados',
      'Certificação digital',
      'Tokens de impacto',
      'Assistente Jarvis',
      'Relatórios avançados',
      'Exportação PDF/CSV',
      'Suporte prioritário',
    ],
    limits: {
      projects: 10,
      beneficiaries: -1, // unlimited
      teamMembers: 5,
      apiCalls: 10000,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes organizações',
    priceMonthly: 99900, // R$ 999,00
    priceYearly: 999000, // R$ 9.990,00 (2 meses grátis)
    // Price IDs will be set after creating products in Stripe Dashboard
    // stripePriceIdMonthly: 'price_xxx',
    // stripePriceIdYearly: 'price_xxx',
    features: [
      'Projetos ilimitados',
      'Tudo do plano Pro',
      'White-label completo',
      'API de integração',
      'SSO/SAML',
      'Suporte dedicado 24/7',
      'Onboarding personalizado',
      'SLA garantido',
      'Relatórios customizados',
    ],
    limits: {
      projects: -1, // unlimited
      beneficiaries: -1, // unlimited
      teamMembers: -1, // unlimited
      apiCalls: -1, // unlimited
    },
  },
};

/**
 * Get plan by ID
 */
export function getPlan(planId: string): PlanConfig | undefined {
  return PLANS[planId];
}

/**
 * Get all plans as array
 */
export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS);
}

/**
 * Check if a plan has a specific feature
 */
export function planHasFeature(planId: string, feature: string): boolean {
  const plan = PLANS[planId];
  return plan?.features.includes(feature) ?? false;
}

/**
 * Check if user is within plan limits
 */
export function isWithinLimits(
  planId: string,
  resource: keyof PlanConfig['limits'],
  currentCount: number
): boolean {
  const plan = PLANS[planId];
  if (!plan) return false;
  
  const limit = plan.limits[resource];
  if (limit === -1) return true; // unlimited
  
  return currentCount < limit;
}
