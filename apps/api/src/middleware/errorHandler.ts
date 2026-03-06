import type { ErrorHandler } from "hono";
import * as Sentry from "@sentry/node";
import { log } from "../lib/logger";

export const errorHandler: ErrorHandler = (err, c) => {
  const method = c.req.method;
  const path   = new URL(c.req.url).pathname;

  if (err instanceof SyntaxError) {
    log.warn("invalid JSON body", { method, path, error: err.message });
    return c.json({ error: { code: "INVALID_JSON", message: "Invalid JSON body" } }, 400);
  }

  // Capture unexpected errors in Sentry (no-op when Sentry isn't configured)
  Sentry.captureException(err, {
    extra: { method, path },
  });

  log.error("unhandled exception", {
    method,
    path,
    error:  err.message,
    stack:  err.stack?.split("\n").slice(0, 4).join(" | "),
  });

  return c.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    500
  );
};
