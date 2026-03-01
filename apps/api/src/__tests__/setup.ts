import { vi } from "vitest";

// Mock Prisma
vi.mock("../db/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    sample: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _sum: { fileSize: 0 } }),
    },
    aiGeneration: {
      create: vi.fn(),
    },
  },
}));

// Mock Stripe
vi.mock("../lib/stripe", () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
    subscriptions: { retrieve: vi.fn() },
    webhooks: { constructEvent: vi.fn() },
  },
  STRIPE_PRICE_IDS: { PRO: "price_pro", STUDIO: "price_studio" },
}));

// Mock Redis
vi.mock("../lib/redis", () => ({
  getRedis: vi.fn(() => ({
    pipeline: vi.fn(() => ({
      zremrangebyscore: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([[null, 0], [null, 1], [null, 1], [null, true]]),
    })),
  })),
}));
