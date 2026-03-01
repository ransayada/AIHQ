import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "../app";

// Mock auth middleware to inject test user
vi.mock("../middleware/auth", () => ({
  authMiddleware: vi.fn(async (c: { set: (k: string, v: string) => void }, next: () => Promise<void>) => {
    c.set("dbUserId", "user-test-123");
    c.set("clerkUserId", "clerk-test-123");
    c.set("tier", "PRO");
    await next();
  }),
}));

const { prisma } = await import("../db/client");

describe("Projects API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/projects", () => {
    it("returns list of projects", async () => {
      const mockProjects = [
        {
          id: "proj-1",
          name: "My Project",
          description: null,
          bpm: 120,
          key: "C",
          scale: "major",
          thumbnailUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastOpenedAt: new Date(),
        },
      ];

      vi.mocked(prisma.project.findMany).mockResolvedValueOnce(mockProjects as never);

      const app = createApp();
      const res = await app.request("/api/projects");

      expect(res.status).toBe(200);
      const body = await res.json() as { data: { projects: Array<{ name: string }> } };
      expect(body.data.projects).toHaveLength(1);
      expect(body.data.projects[0]?.name).toBe("My Project");
    });
  });

  describe("POST /api/projects", () => {
    it("creates a new project", async () => {
      const mockProject = {
        id: "proj-new",
        name: "Test Project",
        description: null,
        bpm: 120,
        key: "C",
        scale: "major",
        thumbnailUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastOpenedAt: new Date(),
      };

      vi.mocked(prisma.project.count).mockResolvedValueOnce(0 as never);
      vi.mocked(prisma.project.create).mockResolvedValueOnce(mockProject as never);

      const app = createApp();
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Project" }),
      });

      expect(res.status).toBe(201);
    });

    it("rejects empty name", async () => {
      const app = createApp();
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });

      expect(res.status).toBe(400);
    });
  });
});
