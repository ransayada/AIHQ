/** Project sharing API — create/revoke share links + public read. */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { shareService } from "../services/share.service";
import { log } from "../lib/logger";
import type { AuthVariables } from "../middleware/auth";

export const shareRouter = new Hono<{ Variables: AuthVariables }>();

// POST /api/projects/:id/share  — create or refresh a share link (auth required)
shareRouter.post(
  "/:projectId/share",
  zValidator("json", z.object({
    name:      z.string(),
    stateJson: z.unknown(),
    bpm:       z.number().optional().default(120),
    key:       z.string().optional().default("C"),
    scale:     z.string().optional().default("major"),
  })),
  async (c) => {
    const userId    = c.get("dbUserId");
    const projectId = c.req.param("projectId");
    const { name, stateJson, bpm, key, scale } = c.req.valid("json");
    const rec = await shareService.createShare(userId, projectId, name, stateJson, bpm, key, scale);
    const origin = new URL(c.req.url).origin;
    log.info("shareRouter.create", { projectId, token: rec.token });
    return c.json({ data: { token: rec.token, shareUrl: `${origin}/share/${rec.token}` } }, 201);
  }
);

// DELETE /api/projects/:id/share  — revoke share link
shareRouter.delete("/:projectId/share", async (c) => {
  const userId    = c.get("dbUserId");
  const projectId = c.req.param("projectId");
  await shareService.revokeShare(userId, projectId);
  return c.json({ data: { success: true } });
});

// GET /api/projects/:id/share  — get current share info
shareRouter.get("/:projectId/share", async (c) => {
  const userId    = c.get("dbUserId");
  const projectId = c.req.param("projectId");
  const rec = await shareService.getShareForProject(userId, projectId);
  if (!rec) return c.json({ data: { shareUrl: null, token: null } });
  const origin = new URL(c.req.url).origin;
  return c.json({ data: { token: rec.token, shareUrl: `${origin}/share/${rec.token}` } });
});

// ── Public read endpoint (no auth) ─────────────────────────────────────────────
export const publicShareRouter = new Hono();

publicShareRouter.get("/:token", async (c) => {
  const token = c.req.param("token");
  const rec   = await shareService.getShare(token);
  if (!rec) return c.json({ error: "Share link not found or expired" }, 404);
  log.debug("publicShareRouter.get", { token, projectId: rec.projectId });
  return c.json({
    data: {
      name:      rec.name,
      bpm:       rec.bpm,
      key:       rec.key,
      scale:     rec.scale,
      stateJson: rec.stateJson,
      createdAt: rec.createdAt,
    },
  });
});
