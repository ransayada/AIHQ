import { z } from "zod";

export const SampleSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  fileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number().int().positive(),
  duration: z.number().positive().optional(),
  sampleRate: z.number().int().positive().optional(),
  storageKey: z.string(),
  tags: z.array(z.string()),
  isPublic: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateSampleSchema = SampleSchema.omit({
  id: true,
  storageKey: true,
  createdAt: true,
  updatedAt: true,
});

export type Sample = z.infer<typeof SampleSchema>;
export type CreateSample = z.infer<typeof CreateSampleSchema>;
