import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CreateProjectSchema, SaveProjectSchema } from "@aihq/shared";
import { projectService } from "../services/project.service";
import type { AuthVariables } from "../middleware/auth";

const router = new Hono<{ Variables: AuthVariables }>();

// GET /api/projects — list user's projects
router.get("/", async (c) => {
  const userId = c.get("dbUserId");
  const projects = await projectService.listProjects(userId);
  return c.json({ data: { projects } });
});

// GET /api/projects/:id — get project with full data
router.get("/:id", async (c) => {
  const userId = c.get("dbUserId");
  const { id } = c.req.param();
  const project = await projectService.getProject(userId, id);
  if (!project) return c.json({ error: { code: "NOT_FOUND", message: "Project not found" } }, 404);
  return c.json({ data: { project } });
});

// POST /api/projects — create new project
router.post(
  "/",
  zValidator("json", CreateProjectSchema),
  async (c) => {
    const userId = c.get("dbUserId");
    const tier = c.get("tier");
    const { name } = c.req.valid("json");

    try {
      const project = await projectService.createProject(userId, name, tier);
      return c.json({ data: { project } }, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.startsWith("PROJECT_LIMIT_REACHED:")) {
        return c.json({ error: { code: "PROJECT_LIMIT_REACHED", message: message.slice(22) } }, 403);
      }
      throw err;
    }
  }
);

// PUT /api/projects/:id — save project state
router.put(
  "/:id",
  zValidator("json", SaveProjectSchema),
  async (c) => {
    const userId = c.get("dbUserId");
    const { id } = c.req.param();
    const { data, name } = c.req.valid("json");

    try {
      const project = await projectService.saveProject(userId, id, data, name);
      return c.json({ data: { project } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message === "NOT_FOUND") {
        return c.json({ error: { code: "NOT_FOUND", message: "Project not found" } }, 404);
      }
      throw err;
    }
  }
);

// DELETE /api/projects/:id
router.delete("/:id", async (c) => {
  const userId = c.get("dbUserId");
  const { id } = c.req.param();

  try {
    await projectService.deleteProject(userId, id);
    return c.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "NOT_FOUND") {
      return c.json({ error: { code: "NOT_FOUND", message: "Project not found" } }, 404);
    }
    throw err;
  }
});

export const projectsRouter = router;
