import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { stream } from "hono/streaming";
import Anthropic from "@anthropic-ai/sdk";
import { aiService } from "../services/ai.service";
import { rateLimit } from "../middleware/rateLimit";
import type { AuthVariables } from "../middleware/auth";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const router = new Hono<{ Variables: AuthVariables }>();

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .min(1)
    .max(20),
  projectContext: z
    .object({
      bpm: z.number().int().min(40).max(300),
      key: z.string(),
      scale: z.string(),
      trackCount: z.number().int().nonnegative(),
    })
    .optional(),
});

// POST /api/ai/chat — Claude chat (streaming)
router.post(
  "/chat",
  rateLimit({ windowSeconds: 60, maxRequests: 20 }),
  zValidator("json", ChatSchema),
  async (c) => {
    const userId = c.get("dbUserId");
    const tier = c.get("tier");

    // Check plan access
    const { claudeChat } = {
      claudeChat: tier === "PRO" || tier === "STUDIO",
    };
    if (!claudeChat) {
      return c.json(
        {
          error: {
            code: "PLAN_REQUIRED",
            message: "Claude AI chat requires a Pro or Studio subscription.",
          },
        },
        403
      );
    }

    // Check generation limits
    try {
      await aiService.checkGenerationLimit(userId, tier);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.startsWith("AI_LIMIT_REACHED:")) {
        return c.json({ error: { code: "AI_LIMIT_REACHED", message: message.slice(17) } }, 429);
      }
      throw err;
    }

    const { messages, projectContext } = c.req.valid("json");

    const systemPrompt = [
      "You are an expert music production assistant integrated into AIHQ, a professional browser-based DAW.",
      "Help users with: chord progressions, arrangement, mixing tips, sound design, genre-specific advice, and music theory.",
      "Keep responses concise (under 200 words) and actionable. Use musical terminology.",
      projectContext
        ? `Current project: BPM ${projectContext.bpm}, Key: ${projectContext.key} ${projectContext.scale}, ${projectContext.trackCount} tracks.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Stream the response
    return stream(c, async (stream) => {
      let totalTokens = 0;

      try {
        const response = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 512,
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const chunk of response) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            await stream.write(chunk.delta.text);
          }
          if (chunk.type === "message_delta" && chunk.usage) {
            totalTokens = chunk.usage.output_tokens;
          }
        }

        // Log usage after stream completes
        await aiService.incrementGenerationUsage(userId);
        await aiService.logGeneration(userId, "chat", totalTokens);
      } catch (err) {
        await stream.write("\n\n[Error generating response. Please try again.]");
        console.error("Claude streaming error:", err);
      }
    });
  }
);

// POST /api/ai/log — log Magenta generation (runs client-side)
router.post(
  "/log",
  zValidator(
    "json",
    z.object({ type: z.enum(["drum_pattern", "melody"]) })
  ),
  async (c) => {
    const userId = c.get("dbUserId");
    const tier = c.get("tier");
    const { type } = c.req.valid("json");

    // Check limits for Pro tier
    if (tier === "FREE") {
      return c.json(
        { error: { code: "PLAN_REQUIRED", message: "AI generation requires Pro or Studio." } },
        403
      );
    }

    try {
      await aiService.checkGenerationLimit(userId, tier);
      await aiService.incrementGenerationUsage(userId);
      await aiService.logGeneration(userId, type);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.startsWith("AI_LIMIT_REACHED:")) {
        return c.json({ error: { code: "AI_LIMIT_REACHED", message: message.slice(17) } }, 429);
      }
      throw err;
    }

    return c.json({ data: { success: true } });
  }
);

// GET /api/ai/usage — get current AI usage stats
router.get("/usage", async (c) => {
  const userId = c.get("dbUserId");
  const stats = await aiService.getUsageStats(userId);
  return c.json({ data: stats });
});

export const aiRouter = router;
