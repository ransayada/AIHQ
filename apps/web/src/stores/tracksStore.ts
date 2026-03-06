"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { getTrackColor } from "@aihq/ui";
import type { Track, MidiNote, Clip, SynthPreset, StepPattern } from "@aihq/shared";

interface TracksState {
  tracks: Track[];
  selectedTrackId: string | null;
  selectedClipId: string | null;

  // Track actions
  addTrack: (type: Track["type"]) => string;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  selectTrack: (id: string | null) => void;
  selectClip: (clipId: string | null) => void;

  // Step sequencer
  setStepActive: (trackId: string, step: number, active: boolean) => void;
  setStepVelocity: (trackId: string, step: number, velocity: number) => void;
  setPattern: (trackId: string, steps: boolean[], velocities?: number[]) => void;
  clearPattern: (trackId: string) => void;

  // Clips & notes
  addClip: (trackId: string, clip: Omit<Clip, "id">) => string;
  updateClip: (trackId: string, clipId: string, updates: Partial<Clip>) => void;
  removeClip: (trackId: string, clipId: string) => void;
  addNote: (trackId: string, clipId: string, note: Omit<MidiNote, "id">) => string;
  removeNote: (trackId: string, clipId: string, noteId: string) => void;
  updateNote: (trackId: string, clipId: string, noteId: string, updates: Partial<MidiNote>) => void;

  // Mixer actions
  setVolume: (trackId: string, db: number) => void;
  setPan: (trackId: string, pan: number) => void;
  setMuted: (trackId: string, muted: boolean) => void;
  setSoloed: (trackId: string, soloed: boolean) => void;
  setArmed: (trackId: string, armed: boolean) => void;

  // Synth preset
  setSynthPreset: (trackId: string, preset: SynthPreset) => void;

  // Load full track state (from saved project)
  loadTracks: (tracks: Track[]) => void;
}

export const useTracksStore = create<TracksState>()(
  temporal(
  devtools(
    immer((set, _get) => ({
      tracks: [],
      selectedTrackId: null,
      selectedClipId: null,

      addTrack: (type) => {
        const id = crypto.randomUUID();
        set((state) => {
          const defaultStepPattern: StepPattern = {
            steps: new Array(16).fill(false) as boolean[],
            velocities: new Array(16).fill(100) as number[],
          };

          const track: Track = {
            id,
            name: `${type.charAt(0).toUpperCase()}${type.slice(1)} ${state.tracks.length + 1}`,
            type,
            color: getTrackColor(state.tracks.length),
            volume: 0,
            pan: 0,
            muted: false,
            soloed: false,
            armed: false,
            clips: [],
            effectChain: [],
            sendLevels: {},
            ...(type === "drum" ? { stepPattern: defaultStepPattern } : {}),
          };
          state.tracks.push(track);
        });
        return id;
      },

      removeTrack: (id) => {
        set((state) => {
          const idx = state.tracks.findIndex((t) => t.id === id);
          if (idx !== -1) state.tracks.splice(idx, 1);
          if (state.selectedTrackId === id) state.selectedTrackId = null;
        });
      },

      updateTrack: (id, updates) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === id);
          if (track) Object.assign(track, updates);
        });
      },

      selectTrack: (id) => set((state) => { state.selectedTrackId = id; }),
      selectClip: (clipId) => set((state) => { state.selectedClipId = clipId; }),

      setStepActive: (trackId, step, active) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track?.stepPattern) {
            track.stepPattern.steps[step] = active;
          }
        });
      },

      setStepVelocity: (trackId, step, velocity) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track?.stepPattern) {
            track.stepPattern.velocities[step] = velocity;
          }
        });
      },

      setPattern: (trackId, steps, velocities) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track?.stepPattern) {
            for (let i = 0; i < 16; i++) {
              track.stepPattern.steps[i] = steps[i] ?? false;
              if (velocities) track.stepPattern.velocities[i] = velocities[i] ?? 100;
            }
          }
        });
      },

      clearPattern: (trackId) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track?.stepPattern) {
            track.stepPattern.steps.fill(false);
          }
        });
      },

      addClip: (trackId, clipData) => {
        const clipId = crypto.randomUUID();
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) {
            track.clips.push({ id: clipId, ...clipData });
          }
        });
        return clipId;
      },

      updateClip: (trackId, clipId, updates) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          const clip = track?.clips.find((c) => c.id === clipId);
          if (clip) Object.assign(clip, updates);
        });
      },

      removeClip: (trackId, clipId) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) {
            const idx = track.clips.findIndex((c) => c.id === clipId);
            if (idx !== -1) track.clips.splice(idx, 1);
          }
        });
      },

      addNote: (trackId, clipId, noteData) => {
        const noteId = crypto.randomUUID();
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          const clip = track?.clips.find((c) => c.id === clipId);
          if (clip) {
            clip.notes.push({ id: noteId, ...noteData });
          }
        });
        return noteId;
      },

      removeNote: (trackId, clipId, noteId) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          const clip = track?.clips.find((c) => c.id === clipId);
          if (clip) {
            const idx = clip.notes.findIndex((n) => n.id === noteId);
            if (idx !== -1) clip.notes.splice(idx, 1);
          }
        });
      },

      updateNote: (trackId, clipId, noteId, updates) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          const clip = track?.clips.find((c) => c.id === clipId);
          const note = clip?.notes.find((n) => n.id === noteId);
          if (note) Object.assign(note, updates);
        });
      },

      setVolume: (trackId, db) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) track.volume = db;
        });
      },

      setPan: (trackId, pan) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) track.pan = pan;
        });
      },

      setMuted: (trackId, muted) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) track.muted = muted;
        });
      },

      setSoloed: (trackId, soloed) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) {
            track.soloed = soloed;
            // When a track is soloed, others hear nothing
            if (soloed) {
              state.tracks.forEach((t) => {
                if (t.id !== trackId) t.muted = true;
              });
            } else {
              // Restore: un-mute all non-soloed tracks
              const anyStillSoloed = state.tracks.some((t) => t.soloed && t.id !== trackId);
              if (!anyStillSoloed) {
                state.tracks.forEach((t) => { t.muted = false; });
              }
            }
          }
        });
      },

      setArmed: (trackId, armed) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) track.armed = armed;
        });
      },

      setSynthPreset: (trackId, preset) => {
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) track.synthPreset = preset;
        });
      },

      loadTracks: (tracks) => {
        set((state) => { state.tracks = tracks; });
      },
    })),
    { name: "TracksStore" }
  )
  )
);
