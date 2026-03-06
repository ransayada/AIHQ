/**
 * Sentry instrumentation — imported FIRST in index.ts (before any other imports).
 * When SENTRY_DSN is not set this is a no-op.
 */
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
  // Capture 100% of transactions in dev, 10% in prod
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Only enable if DSN is set
  enabled: Boolean(process.env.SENTRY_DSN),
  integrations: [
    Sentry.prismaIntegration(),
  ],
});
