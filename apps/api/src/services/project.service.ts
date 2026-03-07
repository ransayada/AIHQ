import { prisma } from "../db/client";
import { ProjectDataSchema } from "@aihq/shared";
import type { ProjectData } from "@aihq/shared";
import { PLAN_LIMITS } from "@aihq/shared";
import type { Tier } from "@prisma/client";
import { log } from "../lib/logger";

// In-memory mock DB for local dev without a real Postgres instance
const mockProjects = new Map<string, any>();
const hasDatabase = () => process.env.USE_MOCK_DB !== "true" && Boolean(process.env.DATABASE_URL);

export const projectService = {
  async listProjects(userId: string) {
    log.debug("projectService.listProjects", { userId });

    if (!hasDatabase()) {
      const projects = Array.from(mockProjects.values())
        .filter((p) => p.userId === userId)
        .map(({ data, ...p }) => p)
        .sort((a, b) => b.lastOpenedAt.getTime() - a.lastOpenedAt.getTime());
      log.debug("projectService.listProjects: mock returned", { count: projects.length });
      return projects;
    }

    return log.timed("projectService.listProjects:db", () =>
      prisma.project.findMany({
        where: { userId },
        select: {
          id: true, name: true, description: true, bpm: true,
          key: true, scale: true, thumbnailUrl: true,
          createdAt: true, updatedAt: true, lastOpenedAt: true,
        },
        orderBy: { lastOpenedAt: "desc" },
      }),
      { userId }
    );
  },

  async getProject(userId: string, projectId: string) {
    log.debug("projectService.getProject", { userId, projectId });

    if (!hasDatabase()) {
      const p = mockProjects.get(projectId);
      const found = p?.userId === userId ? p : null;
      if (!found) log.warn("projectService.getProject: not found (mock)", { userId, projectId });
      return found;
    }

    return log.timed("projectService.getProject:db", () =>
      prisma.project.findFirst({ where: { id: projectId, userId } }),
      { userId, projectId }
    );
  },

  async createProject(userId: string, name: string, tier: Tier) {
    log.info("projectService.createProject", { userId, name, tier });

    // Enforce project limits for free tier (only when DB is available)
    if (hasDatabase()) {
      const limit = PLAN_LIMITS[tier].maxProjects;
      if (isFinite(limit)) {
        const count = await prisma.project.count({ where: { userId } });
        if (count >= limit) {
          log.warn("projectService.createProject: limit reached", { userId, tier, count, limit });
          throw new Error(`PROJECT_LIMIT_REACHED:Your ${tier} plan allows ${limit} projects.`);
        }
      }
    }

    const defaultData: ProjectData = ProjectDataSchema.parse({ version: "1" });

    if (!hasDatabase()) {
      const id  = "mock-" + Math.random().toString(36).substring(2, 9);
      const now = new Date();
      const proj = {
        id, userId, name,
        description: null,
        bpm:         defaultData.bpm,
        key:         defaultData.key,
        scale:       defaultData.scale,
        data:        defaultData as object,
        thumbnailUrl: null,
        isPublic:    false,
        createdAt:   now,
        updatedAt:   now,
        lastOpenedAt: now,
      };
      mockProjects.set(id, proj);
      log.info("projectService.createProject: created (mock)", { projectId: id, userId, name });
      const { data, ...meta } = proj;
      return meta;
    }

    return log.timed("projectService.createProject:db", () =>
      prisma.project.create({
        data: {
          userId, name,
          bpm:   defaultData.bpm,
          key:   defaultData.key,
          scale: defaultData.scale,
          data:  defaultData as object,
        },
        select: {
          id: true, name: true, description: true, bpm: true,
          key: true, scale: true, thumbnailUrl: true,
          createdAt: true, updatedAt: true, lastOpenedAt: true,
        },
      }),
      { userId, name }
    );
  },

  async saveProject(userId: string, projectId: string, data: ProjectData, name?: string) {
    log.debug("projectService.saveProject", { userId, projectId, name });

    if (!hasDatabase()) {
      const p = mockProjects.get(projectId);
      if (!p || p.userId !== userId) {
        log.warn("projectService.saveProject: not found (mock)", { userId, projectId });
        throw new Error("NOT_FOUND");
      }
      p.data         = data as object;
      p.bpm          = data.bpm;
      p.key          = data.key;
      p.scale        = data.scale;
      p.lastOpenedAt = new Date();
      p.updatedAt    = new Date();
      if (name) p.name = name;
      const { data: _d, ...meta } = p;
      log.debug("projectService.saveProject: saved (mock)", { projectId });
      return meta;
    }

    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) {
      log.warn("projectService.saveProject: not found", { userId, projectId });
      throw new Error("NOT_FOUND");
    }

    return log.timed("projectService.saveProject:db", () =>
      prisma.project.update({
        where: { id: projectId },
        data: {
          data:  data as object,
          bpm:   data.bpm,
          key:   data.key,
          scale: data.scale,
          lastOpenedAt: new Date(),
          ...(name ? { name } : {}),
        },
        select: { id: true, name: true, updatedAt: true, lastOpenedAt: true },
      }),
      { projectId }
    );
  },

  async renameProject(userId: string, projectId: string, name: string) {
    log.info("projectService.renameProject", { userId, projectId, name });

    if (!hasDatabase()) {
      const p = mockProjects.get(projectId);
      if (!p || p.userId !== userId) {
        log.warn("projectService.renameProject: not found (mock)", { userId, projectId });
        throw new Error("NOT_FOUND");
      }
      p.name      = name;
      p.updatedAt = new Date();
      const { data: _d, ...meta } = p;
      return meta;
    }

    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) {
      log.warn("projectService.renameProject: not found", { userId, projectId });
      throw new Error("NOT_FOUND");
    }

    return log.timed("projectService.renameProject:db", () =>
      prisma.project.update({
        where: { id: projectId },
        data:  { name },
        select: { id: true, name: true, updatedAt: true },
      }),
      { projectId, name }
    );
  },

  async deleteProject(userId: string, projectId: string) {
    log.info("projectService.deleteProject", { userId, projectId });

    if (!hasDatabase()) {
      const p = mockProjects.get(projectId);
      if (!p || p.userId !== userId) {
        log.warn("projectService.deleteProject: not found (mock)", { userId, projectId });
        throw new Error("NOT_FOUND");
      }
      mockProjects.delete(projectId);
      log.info("projectService.deleteProject: deleted (mock)", { projectId });
      return;
    }

    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) {
      log.warn("projectService.deleteProject: not found", { userId, projectId });
      throw new Error("NOT_FOUND");
    }

    await log.timed("projectService.deleteProject:db", () =>
      prisma.project.delete({ where: { id: projectId } }),
      { projectId }
    );
    log.info("projectService.deleteProject: deleted", { projectId });
  },
};
