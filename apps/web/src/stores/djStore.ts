"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { djEngine } from "@aihq/audio-engine";
import type { DeckId } from "@aihq/audio-engine";
import { log } from "@/lib/logger";

// ── Types ─────────────────────────────────────────────────────────────────────

export type { DeckId };

export interface DeckState {
  id:           DeckId;
  fileName:     string | null;
  isLoaded:     boolean;
  isLoading:    boolean;
  isPlaying:    boolean;
  /** 0–100 (user-visible percentage) */
  volume:       number;
  /** Playback rate: 0.25–4.0 */
  playbackRate: number;
  /** User-set base BPM */
  bpm:          number;
  eq:           { low: number; mid: number; high: number }; // -15 to +6 dB
  /** 0–1: 0 = fully filtered, 1 = wide open */
  filter:       number;
  /** 0–1 wet */
  reverb:       number;
  /** 0–1 wet */
  delay:        number;
  loop:         boolean;
}

interface DJState {
  decks:          Record<DeckId, DeckState>;
  /** 0 = full Deck A, 1 = full Deck B */
  crossfaderAB:   number;
  /** 0 = full Deck C, 1 = full Deck D */
  crossfaderCD:   number;
  /** 0–100 master volume percentage */
  masterVolume:   number;

  loadTrack:      (deckId: DeckId, file: File) => Promise<void>;
  play:           (deckId: DeckId) => void;
  pause:          (deckId: DeckId) => void;
  stop:           (deckId: DeckId) => void;
  cue:            (deckId: DeckId) => void;
  setVolume:      (deckId: DeckId, value: number) => void;
  setPlaybackRate:(deckId: DeckId, rate: number)  => void;
  setBpm:         (deckId: DeckId, bpm: number)   => void;
  setEQ:          (deckId: DeckId, band: keyof DeckState["eq"], db: number) => void;
  setFilter:      (deckId: DeckId, value: number) => void;
  setReverb:      (deckId: DeckId, value: number) => void;
  setDelay:       (deckId: DeckId, value: number) => void;
  setLoop:        (deckId: DeckId, loop: boolean) => void;
  setCrossfaderAB:(value: number) => void;
  setCrossfaderCD:(value: number) => void;
  setMasterVolume:(value: number) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function defaultDeck(id: DeckId): DeckState {
  return {
    id, fileName: null, isLoaded: false, isLoading: false, isPlaying: false,
    volume: 80, playbackRate: 1.0, bpm: 128,
    eq: { low: 0, mid: 0, high: 0 },
    filter: 1, reverb: 0, delay: 0, loop: false,
  };
}

/** Convert 0-100 volume percentage to dB: 0→-60, 100→6 */
function volToDB(vol: number): number {
  if (vol <= 0) return -60;
  return (vol / 100) * 66 - 60;
}

/** Compute crossfader-adjusted effective volume for a deck */
function effectiveVol(
  deckId: DeckId,
  decks: Record<DeckId, DeckState>,
  xfAB: number,
  xfCD: number,
  master: number
): number {
  const raw = decks[deckId].volume;
  const masterScale = master / 100;
  if (deckId === "A") return raw * (1 - xfAB) * masterScale;
  if (deckId === "B") return raw *      xfAB  * masterScale;
  if (deckId === "C") return raw * (1 - xfCD) * masterScale;
  return                      raw *      xfCD  * masterScale;
}

function applyDeckVolume(
  deckId: DeckId,
  decks: Record<DeckId, DeckState>,
  xfAB: number,
  xfCD: number,
  master: number
) {
  const vol = effectiveVol(deckId, decks, xfAB, xfCD, master);
  try {
    djEngine.getDeck(deckId).setVolume(volToDB(vol));
  } catch (err) {
    log.error("djStore: setVolume failed", { deckId, error: String(err) });
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDJStore = create<DJState>()(
  devtools(
    (set, get) => ({
      decks: {
        A: defaultDeck("A"),
        B: defaultDeck("B"),
        C: defaultDeck("C"),
        D: defaultDeck("D"),
      },
      crossfaderAB:  0.5,
      crossfaderCD:  0.5,
      masterVolume:  80,

      // ── Load ──────────────────────────────────────────────────────────────
      loadTrack: async (deckId, file) => {
        log.info("djStore: loading track", { deck: deckId, file: file.name, size: file.size });
        set((s) => ({
          decks: { ...s.decks, [deckId]: { ...s.decks[deckId], isLoading: true } },
        }));

        const url = URL.createObjectURL(file);
        try {
          await djEngine.getDeck(deckId).load(url);
          log.info("djStore: track loaded", { deck: deckId, file: file.name });
          set((s) => ({
            decks: {
              ...s.decks,
              [deckId]: { ...s.decks[deckId], fileName: file.name, isLoaded: true, isLoading: false },
            },
          }));
        } catch (err) {
          log.error("djStore: load failed", {
            deck:  deckId,
            file:  file.name,
            error: err instanceof Error ? err.message : String(err),
          });
          set((s) => ({
            decks: { ...s.decks, [deckId]: { ...s.decks[deckId], isLoading: false } },
          }));
          URL.revokeObjectURL(url); // Only revoke on failure — keep alive while playing
        }
      },

      // ── Transport ─────────────────────────────────────────────────────────
      play: (deckId) => {
        try {
          void djEngine.ensureStarted().then(() => {
            djEngine.getDeck(deckId).play();
            log.info("djStore: play", { deck: deckId });
            set((s) => ({
              decks: { ...s.decks, [deckId]: { ...s.decks[deckId], isPlaying: true } },
            }));
          });
        } catch (err) {
          log.error("djStore: play failed", { deck: deckId, error: String(err) });
        }
      },

      pause: (deckId) => {
        try {
          djEngine.getDeck(deckId).pause();
          log.info("djStore: pause", { deck: deckId });
          set((s) => ({
            decks: { ...s.decks, [deckId]: { ...s.decks[deckId], isPlaying: false } },
          }));
        } catch (err) {
          log.error("djStore: pause failed", { deck: deckId, error: String(err) });
        }
      },

      stop: (deckId) => {
        try {
          djEngine.getDeck(deckId).stop();
          log.info("djStore: stop", { deck: deckId });
          set((s) => ({
            decks: { ...s.decks, [deckId]: { ...s.decks[deckId], isPlaying: false } },
          }));
        } catch (err) {
          log.error("djStore: stop failed", { deck: deckId, error: String(err) });
        }
      },

      cue: (deckId) => {
        try {
          void djEngine.ensureStarted().then(() => {
            djEngine.getDeck(deckId).cue();
            set((s) => ({
              decks: { ...s.decks, [deckId]: { ...s.decks[deckId], isPlaying: true } },
            }));
          });
        } catch (err) {
          log.error("djStore: cue failed", { deck: deckId, error: String(err) });
        }
      },

      // ── Mixer controls ────────────────────────────────────────────────────
      setVolume: (deckId, value) => {
        set((s) => {
          const next = { ...s.decks, [deckId]: { ...s.decks[deckId], volume: value } };
          applyDeckVolume(deckId, next, s.crossfaderAB, s.crossfaderCD, s.masterVolume);
          return { decks: next };
        });
      },

      setPlaybackRate: (deckId, rate) => {
        try {
          djEngine.getDeck(deckId).setPlaybackRate(rate);
          set((s) => ({
            decks: { ...s.decks, [deckId]: { ...s.decks[deckId], playbackRate: rate } },
          }));
        } catch (err) {
          log.error("djStore: setPlaybackRate failed", { deckId, rate, error: String(err) });
        }
      },

      setBpm: (deckId, bpm) => {
        set((s) => ({
          decks: { ...s.decks, [deckId]: { ...s.decks[deckId], bpm } },
        }));
      },

      // ── EQ ────────────────────────────────────────────────────────────────
      setEQ: (deckId, band, db) => {
        try {
          const deck = djEngine.getDeck(deckId);
          if (band === "low")  deck.setEQLow(db);
          if (band === "mid")  deck.setEQMid(db);
          if (band === "high") deck.setEQHigh(db);
          set((s) => ({
            decks: {
              ...s.decks,
              [deckId]: { ...s.decks[deckId], eq: { ...s.decks[deckId].eq, [band]: db } },
            },
          }));
        } catch (err) {
          log.error("djStore: setEQ failed", { deckId, band, db, error: String(err) });
        }
      },

      // ── Effects ───────────────────────────────────────────────────────────
      setFilter: (deckId, value) => {
        try {
          djEngine.getDeck(deckId).setFilter(value);
          set((s) => ({
            decks: { ...s.decks, [deckId]: { ...s.decks[deckId], filter: value } },
          }));
        } catch (err) {
          log.error("djStore: setFilter failed", { deckId, value, error: String(err) });
        }
      },

      setReverb: (deckId, value) => {
        try {
          djEngine.getDeck(deckId).setReverb(value);
          set((s) => ({
            decks: { ...s.decks, [deckId]: { ...s.decks[deckId], reverb: value } },
          }));
        } catch (err) {
          log.error("djStore: setReverb failed", { deckId, value, error: String(err) });
        }
      },

      setDelay: (deckId, value) => {
        try {
          djEngine.getDeck(deckId).setDelay(value);
          set((s) => ({
            decks: { ...s.decks, [deckId]: { ...s.decks[deckId], delay: value } },
          }));
        } catch (err) {
          log.error("djStore: setDelay failed", { deckId, value, error: String(err) });
        }
      },

      setLoop: (deckId, loop) => {
        try {
          djEngine.getDeck(deckId).setLoop(loop);
          set((s) => ({
            decks: { ...s.decks, [deckId]: { ...s.decks[deckId], loop } },
          }));
        } catch (err) {
          log.error("djStore: setLoop failed", { deckId, loop, error: String(err) });
        }
      },

      // ── Crossfader ────────────────────────────────────────────────────────
      setCrossfaderAB: (value) => {
        set((s) => {
          const next = { crossfaderAB: value };
          applyDeckVolume("A", s.decks, value, s.crossfaderCD, s.masterVolume);
          applyDeckVolume("B", s.decks, value, s.crossfaderCD, s.masterVolume);
          return next;
        });
      },

      setCrossfaderCD: (value) => {
        set((s) => {
          const next = { crossfaderCD: value };
          applyDeckVolume("C", s.decks, s.crossfaderAB, value, s.masterVolume);
          applyDeckVolume("D", s.decks, s.crossfaderAB, value, s.masterVolume);
          return next;
        });
      },

      setMasterVolume: (value) => {
        try {
          djEngine.setMasterVolume(volToDB(value));
          set({ masterVolume: value });
        } catch (err) {
          log.error("djStore: setMasterVolume failed", { value, error: String(err) });
        }
      },
    }),
    { name: "DJStore" }
  )
);
