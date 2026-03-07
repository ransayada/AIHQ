"use client";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface MIDIMapping {
  id:       string;
  label:    string;
  channel:  number; // 1-16, 0 = any
  cc:       number;
  min:      number;
  max:      number;
  target:   string; // e.g. "track:1:volume", "transport:bpm"
}

interface MIDIState {
  enabled:    boolean;
  status:     "unavailable" | "prompt" | "granted" | "denied";
  deviceNames: string[];
  mappings:   MIDIMapping[];
  learningId: string | null;

  setStatus:       (status: MIDIState["status"]) => void;
  setDeviceNames:  (names: string[]) => void;
  addMapping:      (m: Omit<MIDIMapping, "id">) => MIDIMapping;
  removeMapping:   (id: string) => void;
  updateMapping:   (id: string, patch: Partial<MIDIMapping>) => void;
  startLearn:      (id: string) => void;
  commitLearn:     (id: string, channel: number, cc: number) => void;
  cancelLearn:     () => void;
  setEnabled:      (v: boolean) => void;
}

export const useMIDIStore = create<MIDIState>()(
  devtools(
    persist(
      (set, get) => ({
        enabled:     false,
        status:      "unavailable",
        deviceNames: [],
        mappings:    [],
        learningId:  null,

        setStatus:      (status)  => set({ status }),
        setDeviceNames: (names)   => set({ deviceNames: names }),
        setEnabled:     (enabled) => set({ enabled }),

        addMapping(m) {
          const id   = "midi-" + Math.random().toString(36).slice(2, 9);
          const full: MIDIMapping = { ...m, id };
          set((s) => ({ mappings: [...s.mappings, full] }));
          return full;
        },

        removeMapping(id) {
          set((s) => ({ mappings: s.mappings.filter((m) => m.id !== id) }));
        },

        updateMapping(id, patch) {
          set((s) => ({
            mappings: s.mappings.map((m) => m.id === id ? { ...m, ...patch } : m),
          }));
        },

        startLearn(id) { set({ learningId: id }); },
        cancelLearn()  { set({ learningId: null }); },

        commitLearn(id, channel, cc) {
          get().updateMapping(id, { channel, cc });
          set({ learningId: null });
        },
      }),
      { name: "aihq-midi-mappings", partialize: (s) => ({ mappings: s.mappings }) }
    ),
    { name: "MIDIStore" }
  )
);
