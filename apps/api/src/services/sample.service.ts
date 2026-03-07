import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { prisma } from "../db/client";
import { PLAN_LIMITS } from "@aihq/shared";
import type { Tier } from "@prisma/client";
import { log } from "../lib/logger";

const hasDatabase = () => process.env.USE_MOCK_DB !== "true" && Boolean(process.env.DATABASE_URL);

// ── Local dev mock store ───────────────────────────────────────────────────────
interface LocalSample {
  id: string; userId: string; name: string; fileName: string;
  mimeType: string; fileSize: number; duration: number | null;
  storageKey: string; createdAt: Date;
}
const localSamples = new Map<string, LocalSample>();
const UPLOAD_DIR   = join(process.cwd(), "uploads");
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? "";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

export const sampleService = {
  async listSamples(userId: string) {
    if (!hasDatabase()) {
      return Array.from(localSamples.values())
        .filter((s) => s.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return prisma.sample.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Direct upload for local dev (no S3 required). */
  async uploadLocal(userId: string, name: string, fileName: string, mimeType: string, buffer: Buffer) {
    const id  = "smp-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const ext = fileName.split(".").pop() ?? "bin";
    const key = `${userId}/${id}.${ext}`;
    const path = join(UPLOAD_DIR, key.replace("/", "_"));
    await new Promise<void>((res, rej) => {
      const ws = createWriteStream(path);
      ws.write(buffer, (err) => (err ? rej(err) : ws.end(res)));
    });
    const rec: LocalSample = {
      id, userId, name, fileName, mimeType,
      fileSize: buffer.length, duration: null,
      storageKey: key, createdAt: new Date(),
    };
    localSamples.set(id, rec);
    log.info("sampleService.uploadLocal", { id, name, size: buffer.length });
    return { id, name, fileName, mimeType, fileSize: buffer.length, storageKey: key };
  },

  /** Serve a locally stored file. */
  getLocalPath(storageKey: string): string {
    return join(UPLOAD_DIR, storageKey.replace("/", "_"));
  },

  async getUploadUrl(
    userId: string,
    tier: Tier,
    fileName: string,
    mimeType: string,
    fileSize: number
  ): Promise<{ uploadUrl: string; storageKey: string; publicUrl: string }> {
    // Enforce storage limits
    const limitMB = PLAN_LIMITS[tier].sampleStorageMB;
    const { _sum } = await prisma.sample.aggregate({
      where: { userId },
      _sum: { fileSize: true },
    });
    const usedBytes = _sum.fileSize ?? 0;
    if (usedBytes + fileSize > limitMB * 1024 * 1024) {
      throw new Error(`STORAGE_LIMIT_REACHED:Storage limit of ${limitMB}MB reached.`);
    }

    const storageKey = `${userId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: storageKey,
      ContentType: mimeType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = `${PUBLIC_URL}/${storageKey}`;

    return { uploadUrl, storageKey, publicUrl };
  },

  async confirmUpload(
    userId: string,
    storageKey: string,
    name: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
    duration?: number
  ) {
    return prisma.sample.create({
      data: {
        userId,
        name,
        fileName,
        mimeType,
        fileSize,
        duration,
        storageKey,
        tags: [],
      },
    });
  },

  async deleteSample(userId: string, sampleId: string) {
    const sample = await prisma.sample.findFirst({ where: { id: sampleId, userId } });
    if (!sample) throw new Error("NOT_FOUND");

    // Delete from R2
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: sample.storageKey }));
    await prisma.sample.delete({ where: { id: sampleId } });
  },

  getPublicUrl(storageKey: string): string {
    return `${PUBLIC_URL}/${storageKey}`;
  },
};
