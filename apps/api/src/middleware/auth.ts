import type { MiddlewareHandler } from "hono";
import { verifyToken } from "@clerk/backend";
import { prisma } from "../db/client";
import { log } from "../lib/logger";

export type AuthVariables = {
  clerkUserId: string;
  dbUserId: string;
  tier: "FREE" | "PRO" | "STUDIO";
};

export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = async (
  c,
  next
) => {
  // Dev passthrough — allows local development without Clerk configured
  if (process.env.NODE_ENV !== "production" && !process.env.CLERK_SECRET_KEY) {
    log.debug("auth: dev passthrough", { userId: "dev-db-user", tier: "STUDIO" });
    c.set("clerkUserId", "dev-clerk-user");
    c.set("dbUserId",    "dev-db-user");
    c.set("tier",        "STUDIO");
    await next();
    return;
  }

  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    log.warn("auth: missing authorization header", {
      path:   new URL(c.req.url).pathname,
      method: c.req.method,
    });
    return c.json(
      { error: { code: "UNAUTHORIZED", message: "Missing authorization header" } },
      401
    );
  }

  const token = authHeader.slice(7);

  try {
    const payload    = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY ?? "" });
    const clerkUserId = payload.sub;

    const user = await prisma.user.findUnique({
      where:   { clerkId: clerkUserId },
      include: { subscription: true },
    });

    if (!user) {
      log.warn("auth: user not found in DB", { clerkUserId });
      return c.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found. Please sync." } },
        404
      );
    }

    const tier = (user.subscription?.tier ?? "FREE") as AuthVariables["tier"];
    log.debug("auth: verified", { userId: user.id, tier });

    c.set("clerkUserId", clerkUserId);
    c.set("dbUserId",    user.id);
    c.set("tier",        tier);

    await next();
  } catch (err) {
    log.warn("auth: invalid token", {
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json(
      { error: { code: "INVALID_TOKEN", message: "Invalid or expired token" } },
      401
    );
  }
};
