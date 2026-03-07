"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { log } from "@/lib/logger";

export interface Snapshot {
  id:        string;
  projectId: string;
  name:      string;
  stateJson: unknown;
  createdAt: string;
}

interface VersionState {
  snapshots: Snapshot[];
  loading:   boolean;
  saving:    boolean;

  fetchSnapshots:  (projectId: string) => Promise<void>;
  saveSnapshot:    (projectId: string, name: string, stateJson: unknown) => Promise<void>;
  restoreSnapshot: (projectId: string, snapshotId: string) => Promise<unknown | null>;
  deleteSnapshot:  (projectId: string, snapshotId: string) => Promise<void>;
}

export const useVersionStore = create<VersionState>()(
  devtools(
    (set, get) => ({
      snapshots: [],
      loading:   false,
      saving:    false,

      async fetchSnapshots(projectId) {
        set({ loading: true });
        const list = await log.attempt("versionStore.fetch", async () => {
          const res  = await fetch(`/api/projects/${projectId}/snapshots`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = await res.json() as { data: { snapshots: Snapshot[] } };
          return body.data.snapshots;
        }, [] as Snapshot[]);
        set({ snapshots: list, loading: false });
      },

      async saveSnapshot(projectId, name, stateJson) {
        set({ saving: true });
        await log.attempt("versionStore.save", async () => {
          const res = await fetch(`/api/projects/${projectId}/snapshots`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ name, stateJson }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = await res.json() as { data: { snapshot: Snapshot } };
          set((s) => ({ snapshots: [body.data.snapshot, ...s.snapshots], saving: false }));
        }, undefined);
        set({ saving: false });
      },

      async restoreSnapshot(projectId, snapshotId) {
        const state = await log.attempt("versionStore.restore", async () => {
          const res  = await fetch(`/api/projects/${projectId}/snapshots/${snapshotId}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = await res.json() as { data: { snapshot: Snapshot } };
          return body.data.snapshot.stateJson;
        }, null);
        return state;
      },

      async deleteSnapshot(projectId, snapshotId) {
        await log.attempt("versionStore.delete", async () => {
          const res = await fetch(`/api/projects/${projectId}/snapshots/${snapshotId}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }, undefined);
        set((s) => ({ snapshots: s.snapshots.filter((x) => x.id !== snapshotId) }));
      },
    }),
    { name: "VersionStore" }
  )
);
