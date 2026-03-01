import { prisma } from "../db/client";
import { stripe, STRIPE_PRICE_IDS } from "../lib/stripe";
import type Stripe from "stripe";
import type { Tier } from "@prisma/client";

const PRICE_ID_TO_TIER: Record<string, Tier> = {
  [process.env.STRIPE_PRO_PRICE_ID ?? ""]: "PRO",
  [process.env.STRIPE_STUDIO_PRICE_ID ?? ""]: "STUDIO",
};

export const billingService = {
  async createCheckoutSession(userId: string, priceId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) throw new Error("USER_NOT_FOUND");

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;

      // Save customer ID even before subscription is created
      await prisma.subscription.upsert({
        where: { userId },
        create: { userId, stripeCustomerId: customerId, tier: "FREE" },
        update: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      metadata: { userId },
      allow_promotion_codes: true,
    });

    return session.url!;
  },

  async createPortalSession(userId: string): Promise<string> {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) throw new Error("NO_SUBSCRIPTION");

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.APP_URL}/dashboard`,
    });

    return session.url;
  },

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        // Retrieve the subscription to get the price ID
        const stripeSubId = session.subscription as string;
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        const priceId = stripeSub.items.data[0]?.price.id ?? "";
        const tier = PRICE_ID_TO_TIER[priceId] ?? "FREE";

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubId,
            stripePriceId: priceId,
            tier,
            status: "active",
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
          update: {
            stripeSubscriptionId: stripeSubId,
            stripePriceId: priceId,
            tier,
            status: "active",
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id ?? "";
        const tier = PRICE_ID_TO_TIER[priceId] ?? "FREE";

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            tier,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { tier: "FREE", status: "cancelled", stripeSubscriptionId: null },
        });
        break;
      }
    }
  },
};
