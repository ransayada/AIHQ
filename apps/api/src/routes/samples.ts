import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sampleService } from "../services/sample.service";
import { rateLimit } from "../middleware/rateLimit";
import type { AuthVariables } from "../middleware/auth";

const router = new Hono<{ Variables: AuthVariables }>();

// GET /api/samples — list user's samples
router.get("/", async (c) => {
  const userId = c.get("dbUserId");
  const samples = await sampleService.listSamples(userId);

  // Add public URLs to each sample
  const samplesWithUrls = samples.map((s) => ({
    ...s,
    url: sampleService.getPublicUrl(s.storageKey),
  }));

  return c.json({ data: { samples: samplesWithUrls } });
});

// POST /api/samples/upload-url — get presigned upload URL
router.post(
  "/upload-url",
  rateLimit({ windowSeconds: 60, maxRequests: 10 }),
  zValidator(
    "json",
    z.object({
      fileName: z.string().min(1).max(200),
      mimeType: z.string().regex(/^audio\//),
      fileSize: z.number().int().positive().max(500 * 1024 * 1024), // 500MB max per file
    })
  ),
  async (c) => {
    const userId = c.get("dbUserId");
    const tier = c.get("tier");
    const { fileName, mimeType, fileSize } = c.req.valid("json");

    try {
      const result = await sampleService.getUploadUrl(userId, tier, fileName, mimeType, fileSize);
      return c.json({ data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.startsWith("STORAGE_LIMIT_REACHED:")) {
        return c.json(
          { error: { code: "STORAGE_LIMIT_REACHED", message: message.slice(22) } },
          403
        );
      }
      throw err;
    }
  }
);

// POST /api/samples/confirm — confirm upload and save metadata
router.post(
  "/confirm",
  zValidator(
    "json",
    z.object({
      storageKey: z.string(),
      name: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
      fileSize: z.number().int().positive(),
      duration: z.number().positive().optional(),
    })
  ),
  async (c) => {
    const userId = c.get("dbUserId");
    const body = c.req.valid("json");

    const sample = await sampleService.confirmUpload(
      userId,
      body.storageKey,
      body.name,
      body.fileName,
      body.mimeType,
      body.fileSize,
      body.duration
    );

    return c.json({ data: { sample, url: sampleService.getPublicUrl(sample.storageKey) } }, 201);
  }
);

// DELETE /api/samples/:id
router.delete("/:id", async (c) => {
  const userId = c.get("dbUserId");
  const { id } = c.req.param();

  try {
    await sampleService.deleteSample(userId, id);
    return c.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "NOT_FOUND") {
      return c.json({ error: { code: "NOT_FOUND", message: "Sample not found" } }, 404);
    }
    throw err;
  }
});

export const samplesRouter = router;
