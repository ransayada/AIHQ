"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { log } from "@/lib/logger";

export interface Sample {
  id:        string;
  name:      string;
  fileName:  string;
  mimeType:  string;
  fileSize:  number;
  duration?: number | null;
  storageKey: string;
  createdAt:  string;
}

interface SamplesState {
  samples:   Sample[];
  loading:   boolean;
  uploading: boolean;
  error:     string | null;

  fetchSamples:  () => Promise<void>;
  uploadSample:  (file: File, name?: string) => Promise<Sample | null>;
  deleteSample:  (id: string) => Promise<void>;
  previewSample: (id: string) => void;
}

let previewAudio: HTMLAudioElement | null = null;

export const useSamplesStore = create<SamplesState>()(
  devtools(
    (set, get) => ({
      samples:   [],
      loading:   false,
      uploading: false,
      error:     null,

      async fetchSamples() {
        set({ loading: true, error: null });
        const list = await log.attempt("samplesStore.fetch", async () => {
          const res = await fetch("/api/samples");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body = await res.json() as { data: { samples: Sample[] } };
          return body.data.samples;
        }, [] as Sample[]);
        set({ samples: list, loading: false });
      },

      async uploadSample(file, name) {
        set({ uploading: true, error: null });
        const form = new FormData();
        form.append("file", file);
        form.append("name", name ?? file.name.replace(/\.[^.]+$/, ""));

        const sample = await log.attempt("samplesStore.upload", async () => {
          const res = await fetch("/api/samples/upload", { method: "POST", body: form });
          if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
          const body = await res.json() as { data: { sample: Sample } };
          return body.data.sample;
        }, null);

        if (sample) {
          set((s) => ({ samples: [sample, ...s.samples], uploading: false }));
        } else {
          set({ uploading: false, error: "Upload failed" });
        }
        return sample;
      },

      async deleteSample(id) {
        await log.attempt("samplesStore.delete", async () => {
          const res = await fetch(`/api/samples/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }, undefined);
        set((s) => ({ samples: s.samples.filter((x) => x.id !== id) }));
      },

      previewSample(id) {
        const sample = get().samples.find((s) => s.id === id);
        if (!sample) return;
        if (previewAudio) { previewAudio.pause(); previewAudio = null; }
        const audio = new Audio(`/api/samples/${id}/stream`);
        previewAudio = audio;
        audio.play().catch(() => {});
      },
    }),
    { name: "SamplesStore" }
  )
);
