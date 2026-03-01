import { prisma } from "../db/client";
import { ProjectDataSchema } from "@aihq/shared";
import type { ProjectData } from "@aihq/shared";
import { PLAN_LIMITS } from "@aihq/shared";
import type { Tier } from "@prisma/client";

export const projectService = {
  async listProjects(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        bpm: true,
        key: true,
        scale: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
        lastOpenedAt: true,
      },
      orderBy: { lastOpenedAt: "desc" },
    });
  },

  async getProject(userId: string, projectId: string) {
    return prisma.project.findFirst({
      where: { id: projectId, userId },
    });
  },

  async createProject(userId: string, name: string, tier: Tier) {
    // Enforce project limits for free tier
    const limit = PLAN_LIMITS[tier].maxProjects;
    if (isFinite(limit)) {
      const count = await prisma.project.count({ where: { userId } });
      if (count >= limit) {
        throw new Error(`PROJECT_LIMIT_REACHED:Your ${tier} plan allows ${limit} projects.`);
      }
    }

    const defaultData: ProjectData = ProjectDataSchema.parse({ version: "1" });

    return prisma.project.create({
      data: {
        userId,
        name,
        bpm: defaultData.bpm,
        key: defaultData.key,
        scale: defaultData.scale,
        data: defaultData as object,
      },
      select: {
        id: true,
        name: true,
        description: true,
        bpm: true,
        key: true,
        scale: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
        lastOpenedAt: true,
      },
    });
  },

  async saveProject(
    userId: string,
    projectId: string,
    data: ProjectData,
    name?: string
  ) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) throw new Error("NOT_FOUND");

    return prisma.project.update({
      where: { id: projectId },
      data: {
        data: data as object,
        bpm: data.bpm,
        key: data.key,
        scale: data.scale,
        lastOpenedAt: new Date(),
        ...(name ? { name } : {}),
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        lastOpenedAt: true,
      },
    });
  },

  async deleteProject(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) throw new Error("NOT_FOUND");
    await prisma.project.delete({ where: { id: projectId } });
  },
};
