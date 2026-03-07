/**
 * Structured logger for the AIHQ API.
 *
 * Dev:  human-readable colourised console output
 * Prod: JSON lines + ships to Elasticsearch when ES_URL is set
 *
 * Usage:
 *   log.info("project created", { projectId, userId });
 *   log.error("db failed", { table: "project", error: err.message });
 *   await log.timed("createProject", () => prisma.project.create(...), { userId });
 */

import winston from "winston";

// ── Elasticsearch transport (optional — gracefully absent if ES is down) ────────
function buildESTransport() {
  const esUrl = process.env.ES_URL ?? process.env.ELASTICSEARCH_URL;
  if (!esUrl) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ElasticsearchTransport } = require("winston-elasticsearch") as {
      ElasticsearchTransport: new (opts: Record<string, unknown>) => winston.transport;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Client } = require("@elastic/elasticsearch") as {
      Client: new (opts: Record<string, unknown>) => unknown;
    };

    const client = new Client({ node: esUrl });
    return new ElasticsearchTransport({
      level: "debug",
      client,
      index: "aihq-api",
      buffered: false,
    });
  } catch {
    // Packages not available or ES unreachable — silently skip
    return null;
  }
}

// ── Winston instance ─────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== "production";

const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const ctx = Object.keys(meta).length > 0
      ? "  " + Object.entries(meta)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
          .join("  ")
      : "";
    return `${timestamp as string} ${level} ${message as string}${ctx}`;
  })
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: isDev ? (process.env.LOG_LEVEL ?? "debug") : "info",
    format: isDev ? devFormat : prodFormat,
  }),
];

const esTransport = buildESTransport();
if (esTransport) transports.push(esTransport);

const _winston = winston.createLogger({
  level: "debug",
  transports,
});

// ── Public API ───────────────────────────────────────────────────────────────
type LogContext = Record<string, unknown>;

export const log = {
  debug: (msg: string, ctx?: LogContext) => _winston.debug(msg, ctx),
  info:  (msg: string, ctx?: LogContext) => _winston.info(msg,  ctx),
  warn:  (msg: string, ctx?: LogContext) => _winston.warn(msg,  ctx),
  error: (msg: string, ctx?: LogContext) => _winston.error(msg, ctx),

  /** Ingest a batch of log entries from the frontend */
  ingestFrontend(entries: Array<{ level: string; msg: string; ctx?: LogContext; ts?: string }>) {
    for (const e of entries) {
      const level = (["debug", "info", "warn", "error"].includes(e.level) ? e.level : "info") as
        "debug" | "info" | "warn" | "error";
      _winston[level](e.msg, { source: "frontend", ts: e.ts, ...e.ctx });
    }
  },

  /**
   * Run an async function with automatic timing, success/failure logging.
   * Always rethrows so callers can handle errors.
   */
  async timed<T>(label: string, fn: () => Promise<T>, ctx?: LogContext): Promise<T> {
    const t0 = Date.now();
    try {
      const result = await fn();
      _winston.debug(`${label} completed`, { ...ctx, ms: Date.now() - t0 });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error
        ? err.stack?.split("\n").slice(1, 3).join(" | ").trim()
        : undefined;
      _winston.error(`${label} failed`, { ...ctx, ms: Date.now() - t0, error, ...(stack ? { stack } : {}) });
      throw err;
    }
  },

  /** Build a child logger that prefixes every entry with baseCtx. */
  child(baseCtx: LogContext) {
    return {
      debug: (msg: string, ctx?: LogContext) => log.debug(msg, { ...baseCtx, ...ctx }),
      info:  (msg: string, ctx?: LogContext) => log.info(msg,  { ...baseCtx, ...ctx }),
      warn:  (msg: string, ctx?: LogContext) => log.warn(msg,  { ...baseCtx, ...ctx }),
      error: (msg: string, ctx?: LogContext) => log.error(msg, { ...baseCtx, ...ctx }),
    };
  },
};
