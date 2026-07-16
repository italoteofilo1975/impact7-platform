import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// OAuth REMOVED - Using local auth only
import { registerLocalAuthRoutes } from "./local-auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { dynamicRateLimiter, rateLimitHeaders } from "../middleware/rate-limiter";
import { securityHeadersMiddleware, latencyMiddleware, requestIdMiddleware } from "../middleware/security-headers";
import { startAlertMonitoring } from "../services/alerts/alert-service";
import { websocketService } from "../services/websocket/websocket-service";
import { sseNotificationService } from "../services/sse/sse-notification-service";
import stripeWebhook from "../stripe/webhook";
import publicApi from "../api/public-api";
import { handleLogin, handleLogout } from "../login";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createCustomJWT } from "../auth-custom";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Configurar trust proxy para ambientes com reverse proxy
  // Sempre habilitar quando há X-Forwarded-For header (comum em proxies)
  app.set('trust proxy', true);
  
  // Stripe webhook MUST be registered BEFORE express.json() middleware
  // because it needs raw body for signature verification
  app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
  
  // Enable gzip compression for all responses
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses > 1KB
  }));
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Cookie parser — MUST be before tRPC context so req.cookies is populated
  app.use(cookieParser());
  // Security headers (CSP, X-Frame-Options, HSTS, etc.)
  app.use(securityHeadersMiddleware);
  // Request ID for tracing
  app.use(requestIdMiddleware);
  // Latency tracking for SLO metrics
  app.use(latencyMiddleware);
  // Rate limiting middleware
  app.use('/api', rateLimitHeaders);
  app.use('/api', dynamicRateLimiter);
  
  // Inicializar WebSocket server PRIMEIRO (antes de qualquer middleware)
  websocketService.initialize(server);
  
  // SSE endpoint for real-time notifications
  app.get('/api/notifications/stream', (req, res) => {
    const userId = req.query.userId as string || 'anonymous';
    const role = (req.query.role as string || 'user') as 'admin' | 'user';
    sseNotificationService.addClient(userId, role, res);
  });

  // Health check endpoint (load balancers / Railway / uptime monitors)
  // Liveness: responde 200 se o processo está no ar; reporta o estado do DB.
  app.get('/api/health', async (_req, res) => {
    let db = 'unknown';
    try {
      const conn = await getDb();
      db = conn ? 'up' : 'down';
    } catch {
      db = 'down';
    }
    res.status(200).json({
      status: 'ok',
      service: 'impact7-platform',
      db,
      timestamp: new Date().toISOString(),
    });
  });

  // Login/Logout endpoints
  app.post('/api/login', handleLogin);
  app.post('/api/logout', handleLogout);
  
  // Auto-login admin (development/testing)
  app.get('/api/admin-autologin', async (req, res) => {
    try {
      const db = await getDb();
      if (!db) return res.status(500).send('DB unavailable');
      const [admin] = await db.select().from(users).where(eq(users.email, 'admin@impact7.com')).limit(1);
      
      if (!admin) {
        return res.status(404).send('Admin not found');
      }
      
      const token = await createCustomJWT({
        userId: admin.id,
        openId: `local:${admin.id}`,
        email: admin.email ?? '',
        name: admin.name ?? undefined,
        role: admin.role,
      });
      
      res.cookie('app_session_id', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      
      res.redirect('/admin');
    } catch (error) {
      console.error('[Auto-Login] Error:', error);
      res.status(500).send('Auto-login failed');
    }
  });
  
  // Public REST API v1
  app.use('/api/v1', publicApi);
  
  // Local authentication routes (email + password)
  registerLocalAuthRoutes(app);
  
  // OAuth REMOVED - Using local auth only
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Global error handler middleware — logs all unhandled errors to errorLogs table
  app.use(async (err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    try {
      const { errorLogger } = await import('../services/error-logger');
      await errorLogger.log({
        level: 'error',
        message: err.message || 'Unknown error',
        stack: err.stack,
        path: req.path,
        method: req.method,
        statusCode: err.status || err.statusCode || 500,
        context: { url: req.url },
      });
    } catch { /* silently fail */ }
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Iniciar monitoramento de alertas em produção
    if (process.env.NODE_ENV === 'production') {
      startAlertMonitoring();
    }
  });
  
  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[${signal}] Graceful shutdown initiated...`);
    
    // Stop accepting new connections
    server.close(async (err) => {
      if (err) {
        console.error('Error during server close:', err);
        process.exit(1);
      }
      
      console.log('[Shutdown] HTTP server closed');
      
      // Close WebSocket connections
      try {
        websocketService.shutdown();
        console.log('[Shutdown] WebSocket connections closed');
      } catch (e) {
        console.error('[Shutdown] Error closing WebSocket:', e);
      }
      
      // Wait for ongoing requests to complete (max 30 seconds)
      const timeout = setTimeout(() => {
        console.log('[Shutdown] Timeout reached, forcing exit');
        process.exit(0);
      }, 30000);
      
      // Clear timeout and exit cleanly
      clearTimeout(timeout);
      console.log('[Shutdown] Graceful shutdown completed');
      process.exit(0);
    });
    
    // Force close after 35 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('[Shutdown] Forced shutdown after timeout');
      process.exit(1);
    }, 35000);
  };
  
  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('[FATAL] Uncaught Exception:', error);
    try {
      const { errorLogger } = await import('../services/error-logger');
      await errorLogger.log({ level: 'error', message: `[FATAL] ${error.message}`, stack: error.stack });
    } catch { /* silently fail */ }
    gracefulShutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason: any, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
    try {
      const { errorLogger } = await import('../services/error-logger');
      await errorLogger.log({ level: 'error', message: `[FATAL] Unhandled Rejection: ${reason?.message || String(reason)}`, stack: reason?.stack });
    } catch { /* silently fail */ }
    // Don't exit on unhandled rejection in development
    if (process.env.NODE_ENV === 'production') {
      gracefulShutdown('unhandledRejection');
    }
  });
}

startServer().catch(console.error);
