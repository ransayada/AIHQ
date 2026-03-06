/**
 * Validates all required environment variables at process startup.
 * Import this module BEFORE anything else in index.ts.
 * The process will exit with a clear error message if required vars are missing.
 */
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// In test / dev, service keys are optional (can be placeholder strings).
// In production every external service key is required.
const serviceKey = (prefix?: string) =>
  isProd
    ? z.string().min(8)
    : z.string().min(1).default(prefix ? `${prefix}_placeholder` : "placeholder");

const envSchema = z.object({
  // ── Runtime ────────────────────────────────────────────────────────────────
  NODE_ENV:  z.enum(["development", "test", "production"]).default("development"),
  PORT:      z.coerce.number().int().min(1).max(65535).default(3001),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // ── Database ───────────────────────────────────────────────────────────────
  DATABASE_URL: isTest
    ? z.string().default("postgresql://postgres:postgres@localhost:5432/aihq_test")
    : z.string().url({ message: "DATABASE_URL must be a valid postgresql:// URL" }),

  // ── Redis ──────────────────────────────────────────────────────────────────
  REDIS_URL: isProd
    ? z.string().url({ message: "REDIS_URL must be a valid redis:// or rediss:// URL" })
    : z.string().default("redis://localhost:6379"),

  // ── Auth ───────────────────────────────────────────────────────────────────
  CLERK_SECRET_KEY: serviceKey("sk_test"),

  // ── AI ─────────────────────────────────────────────────────────────────────
  ANTHROPIC_API_KEY: serviceKey("sk-ant"),

  // ── Payments ───────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY:      serviceKey("sk_test"),
  STRIPE_WEBHOOK_SECRET:  serviceKey("whsec"),

  // ── Storage ────────────────────────────────────────────────────────────────
  AWS_REGION:            z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID:     serviceKey(),
  AWS_SECRET_ACCESS_KEY: serviceKey(),
  AWS_S3_BUCKET:         z.string().default("aihq-dev"),

  // ── Webhooks ───────────────────────────────────────────────────────────────
  SVIX_WEBHOOK_SECRET: serviceKey("whsec"),

  // ── Networking ─────────────────────────────────────────────────────────────
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  // ── Observability (optional) ───────────────────────────────────────────────
  SENTRY_DSN:        z.string().url().optional(),
  ES_URL:            z.string().url().optional(),
  ELASTICSEARCH_URL: z.string().url().optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n[env] ❌ Invalid environment variables — server cannot start:\n${errors}\n`
    );
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
