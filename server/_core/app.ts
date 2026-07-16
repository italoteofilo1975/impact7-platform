// Montagem do app Express compartilhada entre o servidor local e a funcao serverless da Vercel.
// So HTTP: middleware, webhook do Stripe, login, API publica, auth local, tRPC e o handler de erro.
// WebSocket, SSE, escuta de porta e arquivos estaticos ficam de fora, sao responsabilidade
// do servidor persistente local ou da propria Vercel (estatico e realtime).

import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerLocalAuthRoutes } from "./local-auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { dynamicRateLimiter, rateLimitHeaders } from "../middleware/rate-limiter";
import {
  securityHeadersMiddleware,
  latencyMiddleware,
  requestIdMiddleware,
} from "../middleware/security-headers";
import stripeWebhook from "../stripe/webhook";
import publicApi from "../api/public-api";
import { handleLogin, handleLogout } from "../login";

export function buildApp() {
  const app = express();
  app.set("trust proxy", true);

  // Webhook do Stripe ANTES do express.json (precisa do corpo cru).
  app.use("/api/stripe", express.raw({ type: "application/json" }), stripeWebhook);

  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) return false;
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  app.use(securityHeadersMiddleware);
  app.use(requestIdMiddleware);
  app.use(latencyMiddleware);
  app.use("/api", rateLimitHeaders);
  app.use("/api", dynamicRateLimiter);

  app.post("/api/login", handleLogin);
  app.post("/api/logout", handleLogout);

  app.use("/api/v1", publicApi);
  registerLocalAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  app.use(
    async (
      err: any,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      try {
        const { errorLogger } = await import("../services/error-logger");
        await errorLogger.log({
          level: "error",
          message: err.message || "Unknown error",
          stack: err.stack,
          path: req.path,
          method: req.method,
          statusCode: err.status || err.statusCode || 500,
          context: { url: req.url },
        });
      } catch {
        /* silently fail */
      }
      const status = err.status || err.statusCode || 500;
      res.status(status).json({ error: err.message || "Internal Server Error" });
    }
  );

  return app;
}
