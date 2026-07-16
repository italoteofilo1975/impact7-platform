// Funcao serverless da Vercel: expoe a API do Impact7 (tRPC, auth, Stripe, REST v1).
// O front estatico e servido pela Vercel; o tempo real (WebSocket/SSE) fica para o
// Supabase Realtime numa etapa seguinte, conforme a decisao de arquitetura.
import "dotenv/config";
import { buildApp } from "../server/_core/app";

const app = buildApp();

export default app;
