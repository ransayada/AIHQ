"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { log } from "@/lib/logger";

interface ShareState {
  shareUrl:  string | null;
  token:     string | null;
  sharing:   boolean;
  error:     string | null;

  fetchShareStatus: (projectId: string) => Promise<void>;
  createShare: (projectId: string, name: string, stateJson: unknown, bpm: number, key: string, scale: string) => Promise<string | null>;
  revokeShare: (projectId: string) => Promise<void>;
}

export const useShareStore = create<ShareState>()(
  devtools(
    (set) => ({
      shareUrl: null,
      token:    null,
      sharing:  false,
      error:    null,

      async fetchShareStatus(projectId) {
        const data = await log.attempt("shareStore.fetch", async () => {
          const res  = await fetch(`/api/projects/${projectId}/share`);
          const body = await res.json() as { data: { shareUrl: string | null; token: string | null } };
          return body.data;
        }, { shareUrl: null, token: null });
        set({ shareUrl: data.shareUrl, token: data.token });
      },

      async createShare(projectId, name, stateJson, bpm, key, scale) {
        set({ sharing: true, error: null });
        const url = await log.attempt("shareStore.create", async () => {
          const res = await fetch(`/api/projects/${projectId}/share`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ name, stateJson, bpm, key, scale }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = await res.json() as { data: { shareUrl: string; token: string } };
          set({ shareUrl: body.data.shareUrl, token: body.data.token, sharing: false });
          return body.data.shareUrl;
        }, null);
        if (!url) set({ sharing: false, error: "Failed to create share link" });
        return url;
      },

      async revokeShare(projectId) {
        await log.attempt("shareStore.revoke", async () => {
          await fetch(`/api/projects/${projectId}/share`, { method: "DELETE" });
        }, undefined);
        set({ shareUrl: null, token: null });
      },
    }),
    { name: "ShareStore" }
  )
);
