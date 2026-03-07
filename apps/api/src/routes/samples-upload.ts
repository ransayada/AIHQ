/** Sample upload endpoint for local dev (no S3 required). */
import { Hono } from "hono";
import { sampleService } from "../services/sample.service";
import { log } from "../lib/logger";
import { createReadStream } from "fs";
import { existsSync } from "fs";
import type { AuthVariables } from "../middleware/auth";

export const samplesUploadRouter = new Hono<{ Variables: AuthVariables }>();

// POST /api/samples/upload  — multipart file upload (local dev)
samplesUploadRouter.post("/upload", async (c) => {
  const userId = c.get("dbUserId");

  const formData = await c.req.formData();
  const file     = formData.get("file") as File | null;
  const name     = (formData.get("name") as string | null) ?? file?.name ?? "Untitled";

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  const allowed = ["audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav", "audio/ogg", "audio/flac", "audio/aiff"];
  if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|flac|aif|aiff)$/i)) {
    return c.json({ error: "Unsupported file type" }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sample = await sampleService.uploadLocal(userId, name, file.name, file.type || "audio/mpeg", buffer);
  log.info("samplesUpload.post", { userId, name: sample.name, size: sample.fileSize });
  return c.json({ data: { sample } }, 201);
});

// GET /api/samples  — list user's samples
samplesUploadRouter.get("/", async (c) => {
  const userId = c.get("dbUserId");
  const list   = await sampleService.listSamples(userId);
  return c.json({ data: { samples: list } });
});

// GET /api/samples/:id/stream  — stream audio file
samplesUploadRouter.get("/:id/stream", async (c) => {
  const userId = c.get("dbUserId");
  const id     = c.req.param("id");
  const list   = await sampleService.listSamples(userId);
  const sample = list.find((s) => (s as { id: string }).id === id);
  if (!sample) return c.json({ error: "Not found" }, 404);

  const key  = (sample as { storageKey: string }).storageKey;
  const path = sampleService.getLocalPath(key);
  if (!existsSync(path)) return c.json({ error: "File not found" }, 404);

  const stream = createReadStream(path);
  const mime   = (sample as { mimeType: string }).mimeType ?? "audio/mpeg";
  return new Response(stream as unknown as ReadableStream, {
    headers: { "Content-Type": mime, "Accept-Ranges": "bytes" },
  });
});

// DELETE /api/samples/:id
samplesUploadRouter.delete("/:id", async (c) => {
  const userId = c.get("dbUserId");
  const id     = c.req.param("id");
  await sampleService.deleteSample(userId, id);
  return c.json({ data: { success: true } });
});
