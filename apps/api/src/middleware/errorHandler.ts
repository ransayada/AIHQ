import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[Error] ${c.req.method} ${c.req.path}:`, err);

  if (err instanceof SyntaxError) {
    return c.json({ error: { code: "INVALID_JSON", message: "Invalid JSON body" } }, 400);
  }

  return c.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    500
  );
};
