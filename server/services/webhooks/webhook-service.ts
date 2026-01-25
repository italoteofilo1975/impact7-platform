/**
 * Serviço de Webhooks
 * Sistema de notificações automáticas para integrações externas
 */

import { getDb } from "../../db";
import { webhooks, webhookDeliveries } from "../../../drizzle/schema";
import { eq, and, lte, isNull, or, desc } from "drizzle-orm";
import crypto from "crypto";

// Eventos suportados
export const WEBHOOK_EVENTS = {
  "case.created": "Novo case de impacto criado",
  "case.updated": "Case de impacto atualizado",
  "case.approved": "Case aprovado para publicação",
  "case.rejected": "Case rejeitado",
  "stats.updated": "Estatísticas de impacto atualizadas",
  "user.registered": "Novo usuário registrado",
  "calculation.completed": "Cálculo de S-ROI concluído",
} as const;

export type WebhookEvent = keyof typeof WEBHOOK_EVENTS;

// Gerar secret para webhook
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Criar assinatura HMAC para payload
export function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

// Criar webhook
export async function createWebhook(
  userId: number,
  name: string,
  url: string,
  events: WebhookEvent[]
): Promise<{ id: number; secret: string } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const secret = generateWebhookSecret();
  
  const result = await db.insert(webhooks).values({
    userId,
    name,
    url,
    secret,
    events: JSON.stringify(events),
    isActive: 1,
  
          createdAt: Date.now(),
        });
  
  const insertId = result[0]?.insertId;
  if (!insertId) return null;
  
  return { id: insertId, secret };
}

// Listar webhooks do usuário
export async function listUserWebhooks(userId: number): Promise<Array<{
  id: number;
  name: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  createdAt: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select()
    .from(webhooks)
    .where(eq(webhooks.userId, userId))
    .orderBy(desc(webhooks.createdAt));
  
  return results.map(w => ({
    id: w.id,
    name: w.name,
    url: w.url,
    events: w.events ? JSON.parse(w.events) : [],
    isActive: w.isActive,
    createdAt: w.createdAt,
  }));
}

// Atualizar webhook
export async function updateWebhook(
  userId: number,
  webhookId: number,
  updates: {
    name?: string;
    url?: string;
    events?: WebhookEvent[];
    isActive?: boolean;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const updateData: Record<string, unknown> = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.url) updateData.url = updates.url;
  if (updates.events) updateData.events = JSON.stringify(updates.events);
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
  
  await db.update(webhooks)
    .set(updateData)
    .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)));
  
  return true;
}

// Deletar webhook
export async function deleteWebhook(userId: number, webhookId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(webhooks)
    .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)));
  
  return true;
}

// Regenerar secret do webhook
export async function regenerateWebhookSecret(
  userId: number,
  webhookId: number
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const newSecret = generateWebhookSecret();
  
  await db.update(webhooks)
    .set({ secret: newSecret })
    .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)));
  
  return newSecret;
}

// Disparar evento para todos os webhooks inscritos
export async function triggerWebhookEvent(
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Buscar todos os webhooks ativos que assinam este evento
  const activeWebhooks = await db.select()
    .from(webhooks)
    .where(eq(webhooks.isActive, 1));
  
  const subscribedWebhooks = activeWebhooks.filter(w => {
    const events = w.events ? JSON.parse(w.events) : [];
    return events.includes(event);
  });
  
  // Enviar para cada webhook
  for (const webhook of subscribedWebhooks) {
    await deliverWebhook(webhook, event, payload);
  }
}

// Entregar webhook com retry
async function deliverWebhook(
  webhook: { id: number; url: string; secret: string },
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const fullPayload = {
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  };
  
  const payloadString = JSON.stringify(fullPayload);
  const signature = signPayload(payloadString, webhook.secret);
  
  // Criar registro de entrega
  const deliveryResult = await db.insert(webhookDeliveries).values({
    webhookId: webhook.id,
    event,
    payload: payloadString,
    attempts: 1,
  
          createdAt: Date.now(),
        });
  
  const deliveryId = deliveryResult[0]?.insertId;
  if (!deliveryId) return;
  
  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
        "X-Webhook-Event": event,
        "X-Webhook-Delivery": deliveryId.toString(),
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });
    
    const responseBody = await response.text().catch(() => "");
    
    // Atualizar registro de entrega
    await db.update(webhookDeliveries)
      .set({
        responseStatus: response.status,
        responseBody: responseBody.substring(0, 1000),
        deliveredAt: response.ok ? Date.now() : null,
        nextRetryAt: response.ok ? null : calculateNextRetry(1),
      })
      .where(eq(webhookDeliveries.id, deliveryId));
      
  } catch (error) {
    // Falha na entrega - agendar retry
    await db.update(webhookDeliveries)
      .set({
        responseStatus: 0,
        responseBody: error instanceof Error ? error.message : "Unknown error",
        nextRetryAt: calculateNextRetry(1),
      })
      .where(eq(webhookDeliveries.id, deliveryId));
  }
}

// Calcular próximo retry com backoff exponencial
function calculateNextRetry(attempt: number): number {
  // Backoff: 1min, 5min, 15min, 1h, 4h (max 5 tentativas)
  const delays = [60, 300, 900, 3600, 14400];
  const delaySeconds = delays[Math.min(attempt - 1, delays.length - 1)];
  return Date.now() + delaySeconds * 1000;
}

// Processar retries pendentes
export async function processWebhookRetries(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const now = Date.now();
  
  // Buscar entregas pendentes de retry
  const pendingDeliveries = await db.select()
    .from(webhookDeliveries)
    .where(
      and(
        lte(webhookDeliveries.nextRetryAt, now),
        isNull(webhookDeliveries.deliveredAt)
      )
    );
  
  let processed = 0;
  
  for (const delivery of pendingDeliveries) {
    if (delivery.attempts >= 5) {
      // Max retries atingido
      await db.update(webhookDeliveries)
        .set({ nextRetryAt: null })
        .where(eq(webhookDeliveries.id, delivery.id));
      continue;
    }
    
    // Buscar webhook
    const webhookResults = await db.select()
      .from(webhooks)
      .where(eq(webhooks.id, delivery.webhookId));
    
    if (webhookResults.length === 0 || !webhookResults[0].isActive) continue;
    
    const webhook = webhookResults[0];
    const payload = JSON.parse(delivery.payload);
    const signature = signPayload(delivery.payload, webhook.secret);
    
    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": `sha256=${signature}`,
          "X-Webhook-Event": delivery.event,
          "X-Webhook-Delivery": delivery.id.toString(),
          "X-Webhook-Retry": delivery.attempts.toString(),
        },
        body: delivery.payload,
        signal: AbortSignal.timeout(10000),
      });
      
      const responseBody = await response.text().catch(() => "");
      
      await db.update(webhookDeliveries)
        .set({
          responseStatus: response.status,
          responseBody: responseBody.substring(0, 1000),
          attempts: delivery.attempts + 1,
          deliveredAt: response.ok ? Date.now() : null,
          nextRetryAt: response.ok ? null : calculateNextRetry(delivery.attempts + 1),
        })
        .where(eq(webhookDeliveries.id, delivery.id));
        
    } catch (error) {
      await db.update(webhookDeliveries)
        .set({
          responseStatus: 0,
          responseBody: error instanceof Error ? error.message : "Unknown error",
          attempts: delivery.attempts + 1,
          nextRetryAt: calculateNextRetry(delivery.attempts + 1),
        })
        .where(eq(webhookDeliveries.id, delivery.id));
    }
    
    processed++;
  }
  
  return processed;
}

// Obter histórico de entregas de um webhook
export async function getWebhookDeliveries(
  userId: number,
  webhookId: number,
  limit: number = 50
): Promise<Array<{
  id: number;
  event: string;
  responseStatus: number | null;
  attempts: number;
  deliveredAt: number | null;
  createdAt: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  // Verificar se o webhook pertence ao usuário
  const webhookResults = await db.select()
    .from(webhooks)
    .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)));
  
  if (webhookResults.length === 0) return [];
  
  const deliveries = await db.select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.webhookId, webhookId))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(limit);
  
  return deliveries.map(d => ({
    id: d.id,
    event: d.event,
    responseStatus: d.responseStatus,
    attempts: d.attempts,
    deliveredAt: d.deliveredAt,
    createdAt: d.createdAt,
  }));
}

// Testar webhook com payload de exemplo
export async function testWebhook(
  userId: number,
  webhookId: number
): Promise<{ success: boolean; status?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };
  
  const webhookResults = await db.select()
    .from(webhooks)
    .where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)));
  
  if (webhookResults.length === 0) {
    return { success: false, error: "Webhook not found" };
  }
  
  const webhook = webhookResults[0];
  
  const testPayload = {
    event: "test",
    timestamp: new Date().toISOString(),
    data: {
      message: "Este é um teste do webhook IMPACT7",
      webhookId: webhook.id,
      webhookName: webhook.name,
    },
  };
  
  const payloadString = JSON.stringify(testPayload);
  const signature = signPayload(payloadString, webhook.secret);
  
  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
        "X-Webhook-Event": "test",
        "X-Webhook-Test": "true",
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000),
    });
    
    return {
      success: response.ok,
      status: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
