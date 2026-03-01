import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { billingService } from "../services/billing.service";
import type { AuthVariables } from "../middleware/auth";

const router = new Hono<{ Variables: AuthVariables }>();

// POST /api/billing/checkout — create Stripe checkout session
router.post(
  "/checkout",
  zValidator("json", z.object({ priceId: z.string().min(1) })),
  async (c) => {
    const userId = c.get("dbUserId");
    const { priceId } = c.req.valid("json");

    try {
      const url = await billingService.createCheckoutSession(userId, priceId);
      return c.json({ data: { url } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message === "USER_NOT_FOUND") {
        return c.json({ error: { code: "NOT_FOUND", message: "User not found" } }, 404);
      }
      throw err;
    }
  }
);

// POST /api/billing/portal — create Stripe billing portal session
router.post("/portal", async (c) => {
  const userId = c.get("dbUserId");

  try {
    const url = await billingService.createPortalSession(userId);
    return c.json({ data: { url } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "NO_SUBSCRIPTION") {
      return c.json(
        { error: { code: "NO_SUBSCRIPTION", message: "No active subscription found." } },
        404
      );
    }
    throw err;
  }
});

export const billingRouter = router;
