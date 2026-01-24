import { useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Hook para reportar erros do frontend para o backend
 */
export function useErrorReporting() {
  const reportMutation = trpc.errors.report.useMutation();

  const reportError = useCallback((
    error: Error | string,
    context?: Record<string, unknown>
  ) => {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    reportMutation.mutate({
      message,
      stack,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        ...context,
      },
    });
  }, [reportMutation]);

  // Setup global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      const stack = event.reason?.stack;
      
      reportMutation.mutate({
        message: `Unhandled Promise Rejection: ${message}`,
        stack,
        context: {
          url: window.location.href,
          timestamp: Date.now(),
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError, reportMutation]);

  return { reportError };
}
