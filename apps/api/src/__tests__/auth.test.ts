import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

// Mock @clerk/backend
vi.mock("@clerk/backend", () => ({
  verifyToken: vi.fn(),
}));

// Mock DB client
vi.mock("../db/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const { verifyToken } = await import("@clerk/backend");
const { prisma }      = await import("../db/client");

function makeApp() {
  const app = new Hono<{ Variables: { clerkUserId: string; dbUserId: string; tier: string } }>();
  app.use("*", authMiddleware);
  app.get("/test", (c) =>
    c.json({
      clerkUserId: c.get("clerkUserId"),
      dbUserId:    c.get("dbUserId"),
      tier:        c.get("tier"),
    })
  );
  return app;
}

describe("auth middleware", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ── dev passthrough ──────────────────────────────────────────────────────────

  it("passes through in dev mode when CLERK_SECRET_KEY is unset", async () => {
    process.env.NODE_ENV = "development";
    process.env.CLERK_SECRET_KEY = "";

    const app = makeApp();
    const res = await app.request("/test");
    const body = await res.json() as { clerkUserId: string; dbUserId: string; tier: string };

    expect(res.status).toBe(200);
    expect(body.clerkUserId).toBe("dev-clerk-user");
    expect(body.dbUserId).toBe("dev-db-user");
    expect(body.tier).toBe("STUDIO");
  });

  it("skips dev passthrough in production even without CLERK_SECRET_KEY", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLERK_SECRET_KEY = "";

    const app = makeApp();
    const res = await app.request("/test");

    expect(res.status).toBe(401);
  });

  // ── missing / malformed header ───────────────────────────────────────────────

  it("returns 401 when Authorization header is missing", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLERK_SECRET_KEY = "sk_test_key";

    const app = makeApp();
    const res = await app.request("/test");
    const body = await res.json() as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 when Authorization header does not start with Bearer", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLERK_SECRET_KEY = "sk_test_key";

    const app = makeApp();
    const res = await app.request("/test", {
      headers: { Authorization: "Basic abc123" },
    });
    const body = await res.json() as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  // ── valid token ──────────────────────────────────────────────────────────────

  it("sets user context from a valid token", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLERK_SECRET_KEY = "sk_test_key";

    vi.mocked(verifyToken).mockResolvedValue({ sub: "clerk-user-abc" } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "db-user-123",
      clerkId: "clerk-user-abc",
      subscription: { tier: "PRO" },
    } as never);

    const app = makeApp();
    const res = await app.request("/test", {
      headers: { Authorization: "Bearer valid.jwt.token" },
    });
    const body = await res.json() as { clerkUserId: string; dbUserId: string; tier: string };

    expect(res.status).toBe(200);
    expect(body.clerkUserId).toBe("clerk-user-abc");
    expect(body.dbUserId).toBe("db-user-123");
    expect(body.tier).toBe("PRO");
  });

  // ── user not found ───────────────────────────────────────────────────────────

  it("returns 404 when Clerk token is valid but user does not exist in DB", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLERK_SECRET_KEY = "sk_test_key";

    vi.mocked(verifyToken).mockResolvedValue({ sub: "clerk-ghost" } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const app = makeApp();
    const res = await app.request("/test", {
      headers: { Authorization: "Bearer valid.jwt.token" },
    });
    const body = await res.json() as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("USER_NOT_FOUND");
  });

  // ── invalid token ────────────────────────────────────────────────────────────

  it("returns 401 when token verification throws", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLERK_SECRET_KEY = "sk_test_key";

    vi.mocked(verifyToken).mockRejectedValue(new Error("Token expired"));

    const app = makeApp();
    const res = await app.request("/test", {
      headers: { Authorization: "Bearer expired.jwt.token" },
    });
    const body = await res.json() as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(body.error.code).toBe("INVALID_TOKEN");
  });

  // ── tier defaults ────────────────────────────────────────────────────────────

  it("defaults tier to FREE when subscription is null", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLERK_SECRET_KEY = "sk_test_key";

    vi.mocked(verifyToken).mockResolvedValue({ sub: "clerk-free-user" } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "db-user-free",
      clerkId: "clerk-free-user",
      subscription: null,
    } as never);

    const app = makeApp();
    const res = await app.request("/test", {
      headers: { Authorization: "Bearer valid.jwt.token" },
    });
    const body = await res.json() as { tier: string };

    expect(res.status).toBe(200);
    expect(body.tier).toBe("FREE");
  });
});
