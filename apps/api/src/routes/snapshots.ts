/** Version history API — list, create, delete project snapshots. */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { snapshotService } from "../services/snapshot.service";
import { log } from "../lib/logger";
import type { AuthVariables } from "../middleware/auth";

export const snapshotsRouter = new Hono<{ Variables: AuthVariables }>();

// GET /api/projects/:id/snapshots
snapshotsRouter.get("/:projectId/snapshots", async (c) => {
  const userId    = c.get("dbUserId");
  const projectId = c.req.param("projectId");
  log.debug("GET snapshots", { userId, projectId });
  const snaps = await snapshotService.listSnapshots(userId, projectId);
  return c.json({ data: { snapshots: snaps } });
});

// POST /api/projects/:id/snapshots  — create snapshot
snapshotsRouter.post(
  "/:projectId/snapshots",
  zValidator("json", z.object({
    name:      z.string().max(80).optional(),
    stateJson: z.unknown(),
  })),
  async (c) => {
    const userId    = c.get("dbUserId");
    const projectId = c.req.param("projectId");
    const { name, stateJson } = c.req.valid("json");
    const snap = await snapshotService.createSnapshot(userId, projectId, name ?? "", stateJson);
    return c.json({ data: { snapshot: snap } }, 201);
  }
);

// GET /api/projects/:id/snapshots/:snapshotId  — fetch single snapshot state
snapshotsRouter.get("/:projectId/snapshots/:snapshotId", async (c) => {
  const snapshotId = c.req.param("snapshotId");
  const snap = await snapshotService.getSnapshot(snapshotId);
  if (!snap) return c.json({ error: "Not found" }, 404);
  return c.json({ data: { snapshot: snap } });
});

// DELETE /api/projects/:id/snapshots/:snapshotId
snapshotsRouter.delete("/:projectId/snapshots/:snapshotId", async (c) => {
  const userId     = c.get("dbUserId");
  const snapshotId = c.req.param("snapshotId");
  await snapshotService.deleteSnapshot(userId, snapshotId);
  return c.json({ data: { success: true } });
});
