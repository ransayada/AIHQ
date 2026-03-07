/** Frontend log ingestion endpoint — no auth required. */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { log } from "../lib/logger";

export const logsRouter = new Hono();

const entrySchema = z.object({
  level: z.enum(["debug", "info", "warn", "error"]),
  msg:   z.string().max(2000),
  ts:    z.string().optional(),
  ctx:   z.record(z.unknown()).optional(),
});

logsRouter.post(
  "/",
  zValidator("json", z.object({ entries: z.array(entrySchema).max(100) })),
  (c) => {
    const { entries } = c.req.valid("json");
    log.ingestFrontend(entries);
    return c.json({ ok: true });
  }
);
