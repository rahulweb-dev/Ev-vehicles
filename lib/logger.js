/**
 * Thin server-side logger.
 * In production with Sentry configured: forwards errors to Sentry.
 * In development: falls back to console.
 */

export function logError(context, error) {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      // Dynamic import so Sentry is never bundled into routes that don't use it
      import("@sentry/nextjs").then(Sentry => {
        Sentry.withScope(scope => {
          scope.setTag("route", context);
          Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
        });
      }).catch(() => {});
    } catch {}
  }
  // Always log to console so Vercel logs capture it
  console.error(`[${context}]`, error instanceof Error ? error.message : error);
}

export function logWarn(context, message) {
  console.warn(`[${context}] ${message}`);
}
