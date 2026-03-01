"use client";

import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  bpm: number;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  metronomeEnabled: boolean;
  position: string;
  engineInitialized: boolean;

  // Actions
  setIsPlaying: (playing: boolean) => void;
  setBpm: (bpm: number) => void;
  setTimeSignature: (num: number, den: number) => void;
  toggleMetronome: () => void;
  setPosition: (pos: string) => void;
  setEngineInitialized: (init: boolean) => void;
  setRecording: (rec: boolean) => void;
}

export const useTransportStore = create<TransportState>()(
  devtools(
    subscribeWithSelector((set, _get) => ({
      isPlaying: false,
      isRecording: false,
      bpm: 120,
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      metronomeEnabled: false,
      position: "0:0:0",
      engineInitialized: false,

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setBpm: (bpm) => set({ bpm }),
      setTimeSignature: (num, den) =>
        set({ timeSignatureNumerator: num, timeSignatureDenominator: den }),
      toggleMetronome: () => set((s) => ({ metronomeEnabled: !s.metronomeEnabled })),
      setPosition: (pos) => set({ position: pos }),
      setEngineInitialized: (init) => set({ engineInitialized: init }),
      setRecording: (rec) => set({ isRecording: rec }),
    })),
    { name: "TransportStore" }
  )
);
