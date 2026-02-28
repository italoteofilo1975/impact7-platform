/**
 * Security Headers Middleware — CONF-009
 * SET7.03 — Segurança, Privacidade e Conformidade
 *
 * Implementa Content Security Policy (CSP) e headers de segurança HTTP
 * para proteger contra XSS, clickjacking, MIME sniffing e outros ataques.
 */
import { Request, Response, NextFunction } from "express";

// ─── Métricas de Latência (para SLOs) ───────────────────────────────────────
const latencyBuckets: number[] = [];
const MAX_BUCKET_SIZE = 1000; // Manter últimas 1000 requisições

export function recordLatency(ms: number): void {
  latencyBuckets.push(ms);
  if (latencyBuckets.length > MAX_BUCKET_SIZE) {
    latencyBuckets.shift();
  }
}

export function getLatencyPercentile(percentile: number): number {
  if (latencyBuckets.length === 0) return 0;
  const sorted = [...latencyBuckets].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function getLatencyStats() {
  if (latencyBuckets.length === 0) {
    return { p50: 0, p95: 0, p99: 0, avg: 0, count: 0 };
  }
  const sorted = [...latencyBuckets].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    avg: Math.round(avg),
    count: sorted.length,
  };
}

// ─── Middleware de Latência ──────────────────────────────────────────────────
export function latencyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    recordLatency(ms);
  });
  next();
}

// ─── Content Security Policy ─────────────────────────────────────────────────
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",    // Necessário para Vite HMR em dev
    "'unsafe-eval'",      // Necessário para Vite em dev
    "https://fonts.googleapis.com",
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'",    // Necessário para Tailwind CSS
    "https://fonts.googleapis.com",
  ],
  "font-src": [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https:",             // Permitir imagens de qualquer HTTPS
  ],
  "connect-src": [
    "'self'",
    "wss:",               // WebSocket seguro
    "ws:",                // WebSocket (dev)
    "https://api.manus.im",
    "https://manus.im",
    "https://maps.googleapis.com",
  ],
  "frame-ancestors": ["'none'"],  // Prevenir clickjacking
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "object-src": ["'none'"],
  "media-src": ["'self'", "blob:", "https:"],
  "worker-src": ["'self'", "blob:"],
};

function buildCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}

// ─── Security Headers Middleware ─────────────────────────────────────────────
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  const isDev = process.env.NODE_ENV !== "production";

  // Content Security Policy
  // Em dev, usar Report-Only para não quebrar o Vite HMR
  if (isDev) {
    res.setHeader("Content-Security-Policy-Report-Only", buildCSP());
  } else {
    res.setHeader("Content-Security-Policy", buildCSP());
  }

  // Prevenir MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevenir clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Forçar HTTPS (apenas em produção)
  if (!isDev) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Controlar informações de referrer
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Controlar permissões do browser
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=()"
  );

  // Remover header que expõe tecnologia
  res.removeHeader("X-Powered-By");

  // Adicionar header de versão do IMPACT7 (não expõe stack)
  res.setHeader("X-IMPACT7-Version", "9.0.0");

  next();
}

// ─── Request ID Middleware ────────────────────────────────────────────────────
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}
