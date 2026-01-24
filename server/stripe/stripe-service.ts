import Stripe from 'stripe';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { PLANS } from './products';

// Initialize Stripe with secret key (only if configured)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null;

export interface CreateCheckoutSessionParams {
  userId: number;
  userEmail: string;
  userName: string;
  planId: string;
  billingPeriod: 'monthly' | 'yearly';
  origin: string;
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  
  const { userId, userEmail, userName, planId, billingPeriod, origin } = params;
  
  const plan = PLANS[planId];
  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }
  
  if (planId === 'free') {
    throw new Error('Free plan does not require payment');
  }
  
  // Get or create Stripe customer
  let stripeCustomerId: string | null = null;
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.stripeCustomerId) {
    stripeCustomerId = user.stripeCustomerId;
  } else {
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: {
        user_id: userId.toString(),
      },
    });
    stripeCustomerId = customer.id;
    
    // Save customer ID to database
    await db.update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, userId));
  }
  
  // Get price ID based on plan and billing period
  const priceId = billingPeriod === 'yearly' 
    ? plan.stripePriceIdYearly 
    : plan.stripePriceIdMonthly;
  
  // If no price ID configured, create a dynamic price
  // In production, you should create products/prices in Stripe Dashboard
  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  
  if (priceId) {
    lineItems = [{
      price: priceId,
      quantity: 1,
    }];
  } else {
    // Create price on the fly (for development/testing)
    const amount = billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    lineItems = [{
      price_data: {
        currency: 'brl',
        product_data: {
          name: `IMPACT7 ${plan.name}`,
          description: plan.description,
        },
        unit_amount: amount,
        recurring: {
          interval: billingPeriod === 'yearly' ? 'year' : 'month',
        },
      },
      quantity: 1,
    }];
  }
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : userEmail,
    client_reference_id: userId.toString(),
    mode: 'subscription',
    line_items: lineItems,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/precos?canceled=true`,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName,
      plan_id: planId,
      billing_period: billingPeriod,
    },
    subscription_data: {
      metadata: {
        user_id: userId.toString(),
        plan_id: planId,
      },
    },
  });
  
  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }
  
  return session.url;
}

/**
 * Handle successful checkout
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.client_reference_id || session.metadata?.user_id;
  const planId = session.metadata?.plan_id;
  const subscriptionId = session.subscription as string;
  
  if (!userId || !planId) {
    console.error('[Stripe] Missing user_id or plan_id in checkout session');
    return;
  }
  
  // Update user subscription status
  const db = await getDb();
  if (!db) {
    console.error('[Stripe] Database not available');
    return;
  }
  await db.update(users)
    .set({
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: 'active',
      planType: planId as 'free' | 'starter' | 'professional' | 'enterprise',
    })
    .where(eq(users.id, parseInt(userId)));
  
  console.log(`[Stripe] User ${userId} subscribed to ${planId}`);
}

/**
 * Handle subscription updated
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.user_id;
  
  if (!userId) {
    console.error('[Stripe] Missing user_id in subscription metadata');
    return;
  }
  
  const status = subscription.status;
  let subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'none' = 'none';
  
  switch (status) {
    case 'active':
      subscriptionStatus = 'active';
      break;
    case 'canceled':
      subscriptionStatus = 'canceled';
      break;
    case 'past_due':
      subscriptionStatus = 'past_due';
      break;
    case 'trialing':
      subscriptionStatus = 'trialing';
      break;
    default:
      subscriptionStatus = 'none';
  }
  
  const db = await getDb();
  if (!db) {
    console.error('[Stripe] Database not available');
    return;
  }
  
  await db.update(users)
    .set({ subscriptionStatus })
    .where(eq(users.id, parseInt(userId)));
  
  console.log(`[Stripe] User ${userId} subscription status: ${subscriptionStatus}`);
}

/**
 * Handle subscription deleted/canceled
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.user_id;
  
  if (!userId) {
    console.error('[Stripe] Missing user_id in subscription metadata');
    return;
  }
  
  const db = await getDb();
  if (!db) {
    console.error('[Stripe] Database not available');
    return;
  }
  
  await db.update(users)
    .set({
      subscriptionStatus: 'canceled',
      planType: 'free',
    })
    .where(eq(users.id, parseInt(userId)));
  
  console.log(`[Stripe] User ${userId} subscription canceled`);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Create customer portal session
 */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session.url;
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  );
}

export { stripe };
