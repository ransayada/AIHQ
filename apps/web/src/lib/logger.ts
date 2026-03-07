/**
 * Structured client-side logger for the AIHQ web app.
 *
 * - Outputs tagged, colourised messages to the browser console.
 * - Buffers entries and ships batches to POST /api/logs every 5s
 *   (or immediately when the buffer reaches 20 entries).
 * - Gracefully degrades if the log endpoint is unavailable.
 *
 * Usage:
 *   log.info("DJ: track loaded", { deck: "A", file: "song.mp3" });
 *   log.error("DJ: play failed", { deck: "B", error: err.message });
 *   const result = await log.attempt("loadProject", () => fetchProject(id));
 */

type Level = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

interface LogEntry {
  level: Level;
  msg:   string;
  ts:    string;
  ctx?:  LogContext;
}

// ── Console styles ────────────────────────────────────────────────────────────
const TAGS: Record<Level, string> = {
  debug: "%c[DEBUG]",
  info:  "%c[INFO ]",
  warn:  "%c[WARN ]",
  error: "%c[ERROR]",
};
const STYLES: Record<Level, string> = {
  debug: "color:#6b7280; font-weight:bold",
  info:  "color:#06b6d4; font-weight:bold",
  warn:  "color:#f59e0b; font-weight:bold",
  error: "color:#ef4444; font-weight:bold",
};

// ── Remote shipping ───────────────────────────────────────────────────────────
const BUFFER_MAX  = 20;
const FLUSH_MS    = 5_000;
const LOG_ENDPOINT = "/api/logs";

let buffer: LogEntry[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function scheduleFlush() {
  if (typeof window === "undefined") return;
  if (flushTimer !== null) return;
  flushTimer = setInterval(flushBuffer, FLUSH_MS);
}

async function flushBuffer() {
  if (buffer.length === 0) return;
  const entries = buffer.splice(0);
  try {
    await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
      keepalive: true,
    });
  } catch {
    // Silently drop if endpoint unreachable — never throw from logger
  }
}

function enqueue(entry: LogEntry) {
  buffer.push(entry);
  if (buffer.length >= BUFFER_MAX) {
    void flushBuffer();
  }
}

// Flush on page unload so we don't lose the last batch
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushBuffer();
  });
  window.addEventListener("beforeunload", () => void flushBuffer());
  scheduleFlush();
}

// ── Core write ────────────────────────────────────────────────────────────────
function write(level: Level, msg: string, ctx?: LogContext): void {
  const ts = new Date().toISOString();

  // Console output (browser only)
  if (typeof window !== "undefined") {
    const parts: unknown[] = [TAGS[level], STYLES[level], msg];
    if (ctx && Object.keys(ctx).length > 0) parts.push(ctx);
    if (level === "error")      console.error(...parts);
    else if (level === "warn")  console.warn(...parts);
    else if (level === "debug") console.debug(...parts);
    else                        console.info(...parts);
  }

  // Skip debug from remote to keep volume low
  if (level === "debug") return;
  enqueue({ level, msg, ts, ...(ctx ? { ctx } : {}) });
}

// ── Public API ────────────────────────────────────────────────────────────────
export const log = {
  debug: (msg: string, ctx?: LogContext) => write("debug", msg, ctx),
  info:  (msg: string, ctx?: LogContext) => write("info",  msg, ctx),
  warn:  (msg: string, ctx?: LogContext) => write("warn",  msg, ctx),
  error: (msg: string, ctx?: LogContext) => write("error", msg, ctx),

  /**
   * Run an async operation with automatic error logging.
   * Returns `fallback` on failure — never throws.
   */
  async attempt<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
    const t0 = performance.now();
    try {
      const result = await fn();
      write("debug", `${label} ok`, { ms: Math.round(performance.now() - t0) });
      return result;
    } catch (err) {
      write("error", `${label} failed`, {
        error: err instanceof Error ? err.message : String(err),
        ms:    Math.round(performance.now() - t0),
      });
      return fallback;
    }
  },

  /** Force-flush the log buffer immediately (useful in tests / beforeunload). */
  flush: flushBuffer,
};
