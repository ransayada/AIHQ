import { prisma } from "../db/client";
import { PLAN_LIMITS } from "@aihq/shared";
import type { Tier } from "@prisma/client";

export const aiService = {
  async checkGenerationLimit(userId: string, tier: Tier): Promise<void> {
    const limit = PLAN_LIMITS[tier].aiGenerationsPerMonth;
    if (!isFinite(limit)) return; // STUDIO: unlimited

    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) return; // No subscription record → treat as free (0 generations)

    // Reset counter if month has passed
    const now = new Date();
    if (now > new Date(sub.aiGenerationsReset.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      await prisma.subscription.update({
        where: { userId },
        data: { aiGenerationsUsed: 0, aiGenerationsReset: now },
      });
      return;
    }

    if (sub.aiGenerationsUsed >= limit) {
      throw new Error(
        `AI_LIMIT_REACHED:You've used all ${limit} AI generations this month. Upgrade to get more.`
      );
    }
  },

  async incrementGenerationUsage(userId: string): Promise<void> {
    await prisma.subscription.update({
      where: { userId },
      data: { aiGenerationsUsed: { increment: 1 } },
    });
  },

  async logGeneration(
    userId: string,
    type: "drum_pattern" | "melody" | "chat",
    tokensUsed = 0
  ): Promise<void> {
    await prisma.aiGeneration.create({
      data: { userId, type, tokensUsed },
    });
  },

  async getUsageStats(userId: string) {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    const tier: Tier = sub?.tier ?? "FREE";
    const limit = PLAN_LIMITS[tier].aiGenerationsPerMonth;
    return {
      used: sub?.aiGenerationsUsed ?? 0,
      limit: isFinite(limit) ? limit : -1,
      resetAt: sub?.aiGenerationsReset,
    };
  },
};
