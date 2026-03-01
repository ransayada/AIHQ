"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type BottomPanel = "sequencer" | "piano-roll" | "mixer" | "synth" | "effects";
export type RightPanel = "samples" | "ai" | null;

interface UIState {
  activeBottomPanel: BottomPanel;
  activeRightPanel: RightPanel;
  isSampleBrowserOpen: boolean;
  isAIPanelOpen: boolean;
  isMixerOpen: boolean;

  setBottomPanel: (panel: BottomPanel) => void;
  setRightPanel: (panel: RightPanel) => void;
  toggleSampleBrowser: () => void;
  toggleAIPanel: () => void;
  toggleMixer: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      activeBottomPanel: "sequencer",
      activeRightPanel: null,
      isSampleBrowserOpen: false,
      isAIPanelOpen: false,
      isMixerOpen: true,

      setBottomPanel: (panel) => set({ activeBottomPanel: panel }),
      setRightPanel: (panel) => set({ activeRightPanel: panel }),
      toggleSampleBrowser: () => {
        const open = !get().isSampleBrowserOpen;
        set({ isSampleBrowserOpen: open, activeRightPanel: open ? "samples" : null });
      },
      toggleAIPanel: () => {
        const open = !get().isAIPanelOpen;
        set({ isAIPanelOpen: open, activeRightPanel: open ? "ai" : null });
      },
      toggleMixer: () => set((s) => ({ isMixerOpen: !s.isMixerOpen })),
    }),
    { name: "UIStore" }
  )
);
