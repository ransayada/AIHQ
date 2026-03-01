import type { MiddlewareHandler } from "hono";
import { verifyToken } from "@clerk/backend";
import { prisma } from "../db/client";

export type AuthVariables = {
  clerkUserId: string;
  dbUserId: string;
  tier: "FREE" | "PRO" | "STUDIO";
};

export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = async (
  c,
  next
) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Missing authorization header" } }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY ?? "",
    });
    const clerkUserId = payload.sub;

    // Look up the DB user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { subscription: true },
    });

    if (!user) {
      return c.json({ error: { code: "USER_NOT_FOUND", message: "User not found. Please sync." } }, 404);
    }

    c.set("clerkUserId", clerkUserId);
    c.set("dbUserId", user.id);
    c.set("tier", (user.subscription?.tier ?? "FREE") as AuthVariables["tier"]);

    await next();
  } catch (err) {
    return c.json({ error: { code: "INVALID_TOKEN", message: "Invalid or expired token" } }, 401);
  }
};
