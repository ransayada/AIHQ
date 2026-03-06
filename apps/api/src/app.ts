import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { projectsRouter } from "./routes/projects";
import { samplesRouter } from "./routes/samples";
import { aiRouter } from "./routes/ai";
import { billingRouter } from "./routes/billing";
import { usersRouter } from "./routes/users";
import { webhooksRouter } from "./routes/webhooks";
import { logsRouter } from "./routes/logs";
import { docsRouter } from "./routes/docs";
import { snapshotsRouter } from "./routes/snapshots";
import { shareRouter, publicShareRouter } from "./routes/share";
import { samplesUploadRouter } from "./routes/samples-upload";
import { log } from "./lib/logger";

export function createApp() {
  const app = new Hono();

  // ── Request / response logger ──────────────────────────────────────────────
  app.use("*", async (c, next) => {
    const reqId  = Math.random().toString(36).slice(2, 10);
    const method = c.req.method;
    const path   = new URL(c.req.url).pathname;
    const t0     = Date.now();

    log.info(`→ ${method} ${path}`, { reqId });

    await next();

    const ms     = Date.now() - t0;
    const status = c.res.status;

    if (status >= 500)      log.error(`← ${method} ${path}`, { reqId, status, ms });
    else if (status >= 400) log.warn( `← ${method} ${path}`, { reqId, status, ms });
    else                    log.info( `← ${method} ${path}`, { reqId, status, ms });
  });

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.use(
    "*",
    cors({
      origin: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(","),
      credentials: true,
    })
  );

  // ── Health check (unauthenticated) ─────────────────────────────────────────
  app.get("/health", (c) => {
    log.debug("health check");
    return c.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
  });

  // ── Readiness check — verifies DB + Redis connectivity ───────────────────
  app.get("/ready", async (c) => {
    const checks: Record<string, "ok" | "fail"> = {};
    let allOk = true;

    // Check Prisma DB
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      checks.db = "ok";
    } catch {
      checks.db = "fail";
      allOk = false;
    }

    // Check Redis
    try {
      const { default: Redis } = await import("ioredis");
      const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
        connectTimeout: 2000,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      await redis.connect();
      await redis.ping();
      await redis.quit();
      checks.redis = "ok";
    } catch {
      checks.redis = "fail";
      allOk = false;
    }

    const status = allOk ? 200 : 503;
    log.debug("readiness check", { checks, status });
    return c.json({ status: allOk ? "ready" : "degraded", checks }, status);
  });

  // ── Webhooks (unauthenticated — own signature verification) ────────────────
  app.route("/webhooks", webhooksRouter);

  // ── Frontend log ingestion (unauthenticated) ───────────────────────────────
  app.route("/logs", logsRouter);

  // ── Swagger API docs (unauthenticated) ────────────────────────────────────
  app.route("/docs", docsRouter);

  // ── Protected API routes ───────────────────────────────────────────────────
  const api = new Hono();
  api.use("*", authMiddleware);
  api.route("/projects", projectsRouter);
  api.route("/projects", snapshotsRouter);   // /api/projects/:id/snapshots
  api.route("/projects", shareRouter);       // /api/projects/:id/share
  api.route("/samples",  samplesRouter);
  api.route("/samples",  samplesUploadRouter); // /api/samples/upload + /api/samples/:id/stream
  api.route("/ai",       aiRouter);
  api.route("/billing",  billingRouter);
  api.route("/users",    usersRouter);

  // Public share (no auth)
  app.route("/api/share", publicShareRouter);

  app.route("/api", api);
  app.onError(errorHandler);

  return app;
}

export type AppType = ReturnType<typeof createApp>;
