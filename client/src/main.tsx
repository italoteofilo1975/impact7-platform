// Suprimir erros de WebSocket do Vite HMR no ambiente sandbox
import "./suppress-hmr-errors";

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import "./theme-transition.css";

// Import i18n configuration
import "./lib/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos por padrão
      staleTime: 5 * 60 * 1000,
      // Manter em cache por 30 minutos
      gcTime: 30 * 60 * 1000,
      // Retry automático em caso de falha
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch em background quando a janela ganha foco
      refetchOnWindowFocus: true,
      // Não refetch em reconexão (evita spam de requests)
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry para mutações apenas 1 vez
      retry: 1,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// Loading fallback for i18n
const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-primary/20" />
      <div className="h-4 w-32 bg-muted rounded" />
    </div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<LoadingFallback />}>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </Suspense>
);
