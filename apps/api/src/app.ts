import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { projectsRouter } from "./routes/projects";
import { samplesRouter } from "./routes/samples";
import { aiRouter } from "./routes/ai";
import { billingRouter } from "./routes/billing";
import { usersRouter } from "./routes/users";
import { webhooksRouter } from "./routes/webhooks";

export function createApp() {
  const app = new Hono();

  // Global middleware
  app.use("*", logger());
  app.use(
    "*",
    cors({
      origin: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(","),
      credentials: true,
    })
  );

  // Health check (unauthenticated)
  app.get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" })
  );

  // Webhooks (unauthenticated — have their own signature verification)
  app.route("/webhooks", webhooksRouter);

  // Protected API routes
  const api = new Hono();
  api.use("*", authMiddleware);
  api.route("/projects", projectsRouter);
  api.route("/samples", samplesRouter);
  api.route("/ai", aiRouter);
  api.route("/billing", billingRouter);
  api.route("/users", usersRouter);

  app.route("/api", api);
  app.onError(errorHandler);

  return app;
}

export type AppType = ReturnType<typeof createApp>;
