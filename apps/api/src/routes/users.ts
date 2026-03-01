import { Hono } from "hono";
import { prisma } from "../db/client";
import { aiService } from "../services/ai.service";
import { PLAN_LIMITS } from "@aihq/shared";
import type { AuthVariables } from "../middleware/auth";

const router = new Hono<{ Variables: AuthVariables }>();

// GET /api/users/me — get current user profile + plan info
router.get("/me", async (c) => {
  const userId = c.get("dbUserId");
  const tier = c.get("tier");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }

  const usageStats = await aiService.getUsageStats(userId);
  const limits = PLAN_LIMITS[tier];

  return c.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      plan: tier,
      subscription: user.subscription
        ? {
            tier: user.subscription.tier,
            status: user.subscription.status,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
          }
        : null,
      usage: {
        aiGenerations: usageStats,
      },
      limits: {
        maxProjects: limits.maxProjects === Infinity ? -1 : limits.maxProjects,
        cloudSave: limits.cloudSave,
        claudeChat: limits.claudeChat,
        sampleStorageMB: limits.sampleStorageMB,
        collaboration: limits.collaboration,
      },
    },
  });
});

export const usersRouter = router;
