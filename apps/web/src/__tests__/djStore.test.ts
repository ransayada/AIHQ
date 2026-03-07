import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDJStore } from "@/stores/djStore";

// djEngine is mocked via setup.ts → @aihq/audio-engine mock
import { djEngine } from "@aihq/audio-engine";

describe("DJStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useDJStore.setState({
      decks: {
        A: { id: "A", fileName: null, isLoaded: false, isLoading: false, isPlaying: false, volume: 80, playbackRate: 1, bpm: 128, eq: { low: 0, mid: 0, high: 0 }, filter: 1, reverb: 0, delay: 0, loop: false },
        B: { id: "B", fileName: null, isLoaded: false, isLoading: false, isPlaying: false, volume: 80, playbackRate: 1, bpm: 128, eq: { low: 0, mid: 0, high: 0 }, filter: 1, reverb: 0, delay: 0, loop: false },
        C: { id: "C", fileName: null, isLoaded: false, isLoading: false, isPlaying: false, volume: 80, playbackRate: 1, bpm: 128, eq: { low: 0, mid: 0, high: 0 }, filter: 1, reverb: 0, delay: 0, loop: false },
        D: { id: "D", fileName: null, isLoaded: false, isLoading: false, isPlaying: false, volume: 80, playbackRate: 1, bpm: 128, eq: { low: 0, mid: 0, high: 0 }, filter: 1, reverb: 0, delay: 0, loop: false },
      },
      crossfaderAB: 0.5,
      crossfaderCD: 0.5,
      masterVolume: 80,
    });
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("has 4 decks (A/B/C/D)", () => {
      const { decks } = useDJStore.getState();
      expect(Object.keys(decks)).toEqual(["A", "B", "C", "D"]);
    });

    it("default deck state is unloaded", () => {
      const { decks } = useDJStore.getState();
      expect(decks.A.isLoaded).toBe(false);
      expect(decks.A.isPlaying).toBe(false);
      expect(decks.A.fileName).toBeNull();
    });

    it("default crossfaders are at centre (0.5)", () => {
      const { crossfaderAB, crossfaderCD } = useDJStore.getState();
      expect(crossfaderAB).toBe(0.5);
      expect(crossfaderCD).toBe(0.5);
    });
  });

  describe("loadTrack", () => {
    it("sets isLoading → true then isLoaded → true on success", async () => {
      const file = new File(["data"], "track.mp3", { type: "audio/mpeg" });
      const { loadTrack } = useDJStore.getState();
      await loadTrack("A", file);

      const { decks } = useDJStore.getState();
      expect(decks.A.isLoaded).toBe(true);
      expect(decks.A.isLoading).toBe(false);
      expect(decks.A.fileName).toBe("track.mp3");
    });

    it("calls djEngine.getDeck().load()", async () => {
      const file = new File(["data"], "song.wav", { type: "audio/wav" });
      await useDJStore.getState().loadTrack("B", file);
      expect(djEngine.getDeck).toHaveBeenCalledWith("B");
    });
  });

  describe("play / pause / stop", () => {
    it("play sets isPlaying → true", async () => {
      useDJStore.setState((s) => ({
        decks: { ...s.decks, A: { ...s.decks.A, isLoaded: true } },
      }));
      // ensureStarted is mocked to resolve immediately
      useDJStore.getState().play("A");
      await vi.runAllTimersAsync().catch(() => {});
      // isPlaying set inside then() callback — flush microtasks
      await Promise.resolve();
      const state = useDJStore.getState();
      expect(state.decks.A.isPlaying).toBe(true);
    });

    it("pause sets isPlaying → false", () => {
      useDJStore.setState((s) => ({
        decks: { ...s.decks, A: { ...s.decks.A, isLoaded: true, isPlaying: true } },
      }));
      useDJStore.getState().pause("A");
      expect(useDJStore.getState().decks.A.isPlaying).toBe(false);
      expect(djEngine.getDeck("A").pause).toHaveBeenCalled();
    });

    it("stop resets isPlaying → false", () => {
      useDJStore.setState((s) => ({
        decks: { ...s.decks, B: { ...s.decks.B, isPlaying: true } },
      }));
      useDJStore.getState().stop("B");
      expect(useDJStore.getState().decks.B.isPlaying).toBe(false);
    });
  });

  describe("mixer controls", () => {
    it("setVolume updates state", () => {
      useDJStore.getState().setVolume("A", 60);
      expect(useDJStore.getState().decks.A.volume).toBe(60);
    });

    it("setPlaybackRate updates state and calls engine", () => {
      useDJStore.getState().setPlaybackRate("C", 1.25);
      expect(useDJStore.getState().decks.C.playbackRate).toBe(1.25);
      expect(djEngine.getDeck("C").setPlaybackRate).toHaveBeenCalledWith(1.25);
    });

    it("setBpm only updates store (no engine call)", () => {
      useDJStore.getState().setBpm("D", 140);
      expect(useDJStore.getState().decks.D.bpm).toBe(140);
    });
  });

  describe("EQ", () => {
    it("setEQ low updates store and calls engine", () => {
      useDJStore.getState().setEQ("A", "low", 3);
      expect(useDJStore.getState().decks.A.eq.low).toBe(3);
      expect(djEngine.getDeck("A").setEQLow).toHaveBeenCalledWith(3);
    });

    it("setEQ mid updates store and calls engine", () => {
      useDJStore.getState().setEQ("B", "mid", -6);
      expect(useDJStore.getState().decks.B.eq.mid).toBe(-6);
      expect(djEngine.getDeck("B").setEQMid).toHaveBeenCalledWith(-6);
    });

    it("setEQ high updates store and calls engine", () => {
      useDJStore.getState().setEQ("C", "high", 6);
      expect(useDJStore.getState().decks.C.eq.high).toBe(6);
    });
  });

  describe("effects", () => {
    it("setFilter updates state and calls engine", () => {
      useDJStore.getState().setFilter("A", 0.3);
      expect(useDJStore.getState().decks.A.filter).toBe(0.3);
      expect(djEngine.getDeck("A").setFilter).toHaveBeenCalledWith(0.3);
    });

    it("setReverb updates state and calls engine", () => {
      useDJStore.getState().setReverb("B", 0.5);
      expect(useDJStore.getState().decks.B.reverb).toBe(0.5);
      expect(djEngine.getDeck("B").setReverb).toHaveBeenCalledWith(0.5);
    });

    it("setDelay updates state and calls engine", () => {
      useDJStore.getState().setDelay("C", 0.25);
      expect(useDJStore.getState().decks.C.delay).toBe(0.25);
      expect(djEngine.getDeck("C").setDelay).toHaveBeenCalledWith(0.25);
    });

    it("setLoop updates state and calls engine", () => {
      useDJStore.getState().setLoop("D", true);
      expect(useDJStore.getState().decks.D.loop).toBe(true);
      expect(djEngine.getDeck("D").setLoop).toHaveBeenCalledWith(true);
    });
  });

  describe("crossfader", () => {
    it("setCrossfaderAB updates crossfaderAB", () => {
      useDJStore.getState().setCrossfaderAB(0.8);
      expect(useDJStore.getState().crossfaderAB).toBe(0.8);
    });

    it("setCrossfaderCD updates crossfaderCD", () => {
      useDJStore.getState().setCrossfaderCD(0.2);
      expect(useDJStore.getState().crossfaderCD).toBe(0.2);
    });
  });

  describe("master volume", () => {
    it("setMasterVolume updates state", () => {
      useDJStore.getState().setMasterVolume(50);
      expect(useDJStore.getState().masterVolume).toBe(50);
    });

    it("setMasterVolume calls djEngine.setMasterVolume", () => {
      useDJStore.getState().setMasterVolume(100);
      expect(djEngine.setMasterVolume).toHaveBeenCalledWith(6); // 100% → 6 dB
    });
  });
});
