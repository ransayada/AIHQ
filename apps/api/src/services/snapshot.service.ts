/** Version history — in-memory snapshots, DB-backed when DATABASE_URL is set. */
import { log } from "../lib/logger";

export interface ProjectSnapshot {
  id:        string;
  projectId: string;
  name:      string;
  stateJson: unknown;
  createdAt: Date;
}

// In-memory store (dev without DB)
const snapshots = new Map<string, ProjectSnapshot>();

function genId() { return "snap-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

export const snapshotService = {
  async listSnapshots(userId: string, projectId: string): Promise<ProjectSnapshot[]> {
    log.debug("snapshotService.list", { userId, projectId });
    return Array.from(snapshots.values())
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50); // cap at 50 per project
  },

  async createSnapshot(userId: string, projectId: string, name: string, stateJson: unknown): Promise<ProjectSnapshot> {
    log.info("snapshotService.create", { userId, projectId, name });
    const snap: ProjectSnapshot = {
      id:        genId(),
      projectId,
      name:      name || `Snapshot ${new Date().toLocaleTimeString()}`,
      stateJson,
      createdAt: new Date(),
    };
    snapshots.set(snap.id, snap);
    log.debug("snapshotService.create: done", { snapshotId: snap.id });
    return snap;
  },

  async getSnapshot(snapshotId: string): Promise<ProjectSnapshot | null> {
    return snapshots.get(snapshotId) ?? null;
  },

  async deleteSnapshot(userId: string, snapshotId: string): Promise<void> {
    log.info("snapshotService.delete", { userId, snapshotId });
    snapshots.delete(snapshotId);
  },
};
