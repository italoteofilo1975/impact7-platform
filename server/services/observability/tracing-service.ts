/**
 * Tracing Service
 * SET7.06 - Operação e Observabilidade
 * 
 * Implementa tracing distribuído básico com correlation IDs
 */

import { randomUUID } from "crypto";

// Trace context interface
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTime: number;
  name: string;
  attributes: Record<string, string | number | boolean>;
}

// Span interface
export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "OK" | "ERROR" | "UNSET";
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
}

// Span event interface
export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string | number | boolean>;
}

// In-memory trace storage (for development)
const activeSpans = new Map<string, Span>();
const completedSpans: Span[] = [];
const MAX_COMPLETED_SPANS = 1000;

// Generate unique IDs
export function generateTraceId(): string {
  return randomUUID().replace(/-/g, "");
}

export function generateSpanId(): string {
  return randomUUID().replace(/-/g, "").substring(0, 16);
}

// Create a new trace
export function createTrace(name: string, attributes?: Record<string, string | number | boolean>): TraceContext {
  const traceId = generateTraceId();
  const spanId = generateSpanId();
  
  const span: Span = {
    traceId,
    spanId,
    name,
    startTime: Date.now(),
    status: "UNSET",
    attributes: attributes || {},
    events: [],
  };
  
  activeSpans.set(spanId, span);
  
  console.log(`[Trace] Started trace ${traceId} - ${name}`);
  
  return {
    traceId,
    spanId,
    startTime: span.startTime,
    name,
    attributes: span.attributes,
  };
}

// Create a child span
export function createSpan(
  parentContext: TraceContext,
  name: string,
  attributes?: Record<string, string | number | boolean>
): TraceContext {
  const spanId = generateSpanId();
  
  const span: Span = {
    traceId: parentContext.traceId,
    spanId,
    parentSpanId: parentContext.spanId,
    name,
    startTime: Date.now(),
    status: "UNSET",
    attributes: attributes || {},
    events: [],
  };
  
  activeSpans.set(spanId, span);
  
  console.log(`[Trace] Started span ${spanId} - ${name} (parent: ${parentContext.spanId})`);
  
  return {
    traceId: parentContext.traceId,
    spanId,
    parentSpanId: parentContext.spanId,
    startTime: span.startTime,
    name,
    attributes: span.attributes,
  };
}

// End a span
export function endSpan(context: TraceContext, status: "OK" | "ERROR" = "OK"): void {
  const span = activeSpans.get(context.spanId);
  
  if (!span) {
    console.warn(`[Trace] Span ${context.spanId} not found`);
    return;
  }
  
  span.endTime = Date.now();
  span.duration = span.endTime - span.startTime;
  span.status = status;
  
  activeSpans.delete(context.spanId);
  completedSpans.push(span);
  
  // Trim completed spans if too many
  if (completedSpans.length > MAX_COMPLETED_SPANS) {
    completedSpans.splice(0, completedSpans.length - MAX_COMPLETED_SPANS);
  }
  
  console.log(`[Trace] Ended span ${context.spanId} - ${span.name} (${span.duration}ms) [${status}]`);
}

// Add event to span
export function addSpanEvent(
  context: TraceContext,
  name: string,
  attributes?: Record<string, string | number | boolean>
): void {
  const span = activeSpans.get(context.spanId);
  
  if (!span) {
    console.warn(`[Trace] Span ${context.spanId} not found for event`);
    return;
  }
  
  span.events.push({
    name,
    timestamp: Date.now(),
    attributes,
  });
}

// Set span attribute
export function setSpanAttribute(
  context: TraceContext,
  key: string,
  value: string | number | boolean
): void {
  const span = activeSpans.get(context.spanId);
  
  if (!span) {
    console.warn(`[Trace] Span ${context.spanId} not found for attribute`);
    return;
  }
  
  span.attributes[key] = value;
}

// Execute function with tracing
export async function withTracing<T>(
  name: string,
  fn: (context: TraceContext) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const context = createTrace(name, attributes);
  
  try {
    const result = await fn(context);
    endSpan(context, "OK");
    return result;
  } catch (error) {
    setSpanAttribute(context, "error.message", (error as Error).message);
    setSpanAttribute(context, "error.type", (error as Error).name);
    endSpan(context, "ERROR");
    throw error;
  }
}

// Execute child span with tracing
export async function withChildSpan<T>(
  parentContext: TraceContext,
  name: string,
  fn: (context: TraceContext) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const context = createSpan(parentContext, name, attributes);
  
  try {
    const result = await fn(context);
    endSpan(context, "OK");
    return result;
  } catch (error) {
    setSpanAttribute(context, "error.message", (error as Error).message);
    setSpanAttribute(context, "error.type", (error as Error).name);
    endSpan(context, "ERROR");
    throw error;
  }
}

// Get trace by ID
export function getTrace(traceId: string): Span[] {
  return completedSpans.filter(span => span.traceId === traceId);
}

// Get recent traces
export function getRecentTraces(limit: number = 100): Span[] {
  return completedSpans.slice(-limit);
}

// Get trace statistics
export function getTraceStats(): {
  activeSpans: number;
  completedSpans: number;
  avgDuration: number;
  errorRate: number;
} {
  const completed = completedSpans.filter(s => s.duration !== undefined);
  const errors = completed.filter(s => s.status === "ERROR");
  const totalDuration = completed.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  return {
    activeSpans: activeSpans.size,
    completedSpans: completed.length,
    avgDuration: completed.length > 0 ? totalDuration / completed.length : 0,
    errorRate: completed.length > 0 ? errors.length / completed.length : 0,
  };
}

// Clear all traces (for testing)
export function clearTraces(): void {
  activeSpans.clear();
  completedSpans.length = 0;
}

// Express middleware for request tracing
export function tracingMiddleware() {
  return (req: any, res: any, next: any) => {
    // Get or create trace ID from header
    const incomingTraceId = req.headers["x-trace-id"];
    const traceId = incomingTraceId || generateTraceId();
    const spanId = generateSpanId();
    
    // Create request span
    const span: Span = {
      traceId,
      spanId,
      name: `${req.method} ${req.path}`,
      startTime: Date.now(),
      status: "UNSET",
      attributes: {
        "http.method": req.method,
        "http.url": req.originalUrl,
        "http.user_agent": req.headers["user-agent"] || "unknown",
      },
      events: [],
    };
    
    activeSpans.set(spanId, span);
    
    // Attach trace context to request
    req.traceContext = {
      traceId,
      spanId,
      startTime: span.startTime,
      name: span.name,
      attributes: span.attributes,
    };
    
    // Set trace ID in response header
    res.setHeader("x-trace-id", traceId);
    
    // End span on response finish
    res.on("finish", () => {
      const s = activeSpans.get(spanId);
      if (s) {
        s.endTime = Date.now();
        s.duration = s.endTime - s.startTime;
        s.status = res.statusCode >= 400 ? "ERROR" : "OK";
        s.attributes["http.status_code"] = res.statusCode;
        
        activeSpans.delete(spanId);
        completedSpans.push(s);
        
        if (completedSpans.length > MAX_COMPLETED_SPANS) {
          completedSpans.splice(0, completedSpans.length - MAX_COMPLETED_SPANS);
        }
        
        console.log(`[Trace] ${s.name} - ${s.duration}ms [${s.status}]`);
      }
    });
    
    next();
  };
}

export default {
  createTrace,
  createSpan,
  endSpan,
  addSpanEvent,
  setSpanAttribute,
  withTracing,
  withChildSpan,
  getTrace,
  getRecentTraces,
  getTraceStats,
  clearTraces,
  tracingMiddleware,
  generateTraceId,
  generateSpanId,
};
