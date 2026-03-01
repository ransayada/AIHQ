import { Hono } from "hono";
import { prisma } from "../db/client";
import { billingService } from "../services/billing.service";
import { stripe } from "../lib/stripe";

const router = new Hono();

// POST /webhooks/clerk — sync new users from Clerk
router.post("/clerk", async (c) => {
  const svixId = c.req.header("svix-id");
  const svixTimestamp = c.req.header("svix-timestamp");
  const svixSignature = c.req.header("svix-signature");
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!svixId || !svixTimestamp || !svixSignature || !webhookSecret) {
    return c.json({ error: "Missing svix headers" }, 400);
  }

  // Verify Svix signature (Clerk uses Svix for webhooks)
  try {
    const { Webhook } = await import("svix");
    const wh = new Webhook(webhookSecret);
    const body = await c.req.text();
    const evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: { id: string; email_addresses: Array<{ email_address: string }>; image_url?: string; first_name?: string; last_name?: string } };

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id: clerkId, email_addresses, image_url, first_name, last_name } = evt.data;
      const email = email_addresses[0]?.email_address ?? "";
      const displayName = [first_name, last_name].filter(Boolean).join(" ") || null;

      await prisma.user.upsert({
        where: { clerkId },
        create: { clerkId, email, displayName, avatarUrl: image_url ?? null },
        update: { email, displayName, avatarUrl: image_url ?? null },
      });
    }

    if (evt.type === "user.deleted") {
      const { id: clerkId } = evt.data;
      await prisma.user.deleteMany({ where: { clerkId } });
    }

    return c.json({ received: true });
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return c.json({ error: "Invalid webhook signature" }, 400);
  }
});

// POST /webhooks/stripe — handle Stripe subscription events
router.post("/stripe", async (c) => {
  const sig = c.req.header("stripe-signature");
  const body = await c.req.text();

  if (!sig) return c.json({ error: "Missing stripe-signature header" }, 400);

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );

    await billingService.handleWebhook(event);
    return c.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return c.json({ error: "Webhook error" }, 400);
  }
});

export const webhooksRouter = router;
