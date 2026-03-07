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

  describe("PATCH /api/projects/:id", () => {
    it("renames a project", async () => {
      const existing = {
        id: "proj-rename",
        name: "New Name",
        updatedAt: new Date(),
      };

      vi.mocked(prisma.project.findFirst).mockResolvedValueOnce({
        id: "proj-rename",
        name: "Old Name",
        userId: "user-test-123",
      } as never);
      vi.mocked(prisma.project.update).mockResolvedValueOnce(existing as never);

      const app = createApp();
      const res = await app.request("/api/projects/proj-rename", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { data: { project: { name: string } } };
      expect(body.data.project.name).toBe("New Name");
    });

    it("rejects empty name on rename", async () => {
      const app = createApp();
      const res = await app.request("/api/projects/proj-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/projects/:id", () => {
    it("deletes a project", async () => {
      vi.mocked(prisma.project.findFirst).mockResolvedValueOnce({
        id: "proj-del",
        name: "Doomed",
        userId: "user-test-123",
      } as never);
      vi.mocked(prisma.project.delete).mockResolvedValueOnce({} as never);

      const app = createApp();
      const res = await app.request("/api/projects/proj-del", {
        method: "DELETE",
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { data: { success: boolean } };
      expect(body.data.success).toBe(true);
    });
  });
});
