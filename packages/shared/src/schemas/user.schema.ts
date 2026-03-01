import { z } from "zod";

export const PlanSchema = z.enum(["FREE", "PRO", "STUDIO"]);
export type Plan = z.infer<typeof PlanSchema>;

export const UserSchema = z.object({
  id: z.string(),
  clerkId: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  plan: PlanSchema,
  aiGenerationsUsed: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const PLAN_LIMITS = {
  FREE: {
    maxProjects: 3,
    cloudSave: false,
    aiGenerationsPerMonth: 0,
    claudeChat: false,
    sampleStorageMB: 100,
    collaboration: false,
  },
  PRO: {
    maxProjects: Infinity,
    cloudSave: true,
    aiGenerationsPerMonth: 50,
    claudeChat: true,
    sampleStorageMB: 5120,
    collaboration: false,
  },
  STUDIO: {
    maxProjects: Infinity,
    cloudSave: true,
    aiGenerationsPerMonth: Infinity,
    claudeChat: true,
    sampleStorageMB: 51200,
    collaboration: true,
  },
} as const satisfies Record<Plan, object>;
