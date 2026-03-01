import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "",
  STUDIO: process.env.STRIPE_STUDIO_PRICE_ID ?? "",
} as const;

export type StripePriceId = keyof typeof STRIPE_PRICE_IDS;
