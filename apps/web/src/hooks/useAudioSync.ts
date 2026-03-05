"use client";

import { useEffect } from "react";
import {
  audioEngine,
  PolySynthInstrument,
  ensureTrackRegistered,
  cleanupTrack,
  getSynthInstrument,
  getEffectsChain,
  syncSynthClips,
} from "@aihq/audio-engine";
import { useTracksStore } from "@/stores/tracksStore";

// Re-export for use by SynthPanel and EffectsRack
export { getSynthInstrument, getEffectsChain };

/**
 * Main hook — call once in StudioPage.
 * Keeps audio engine in sync with the tracks Zustand store.
 */
export function useAudioSync(): void {
  useEffect(() => {
    function resolveDrumPadIndex(trackId: string): number {
      const drumTracks = useTracksStore
        .getState()
        .tracks.filter((t) => t.type === "drum");
      return drumTracks.findIndex((t) => t.id === trackId);
    }

    // Process any tracks that already exist (e.g. loaded project)
    useTracksStore.getState().tracks.forEach((t) => ensureTrackRegistered(t, resolveDrumPadIndex));

    const unsub = useTracksStore.subscribe((state, prevState) => {
      // Build an O(1) lookup map from previous state
      const prevTrackMap = new Map(prevState.tracks.map((t) => [t.id, t]));

      // Register only newly added tracks
      state.tracks.forEach((t) => {
        if (!prevTrackMap.has(t.id)) {
          ensureTrackRegistered(t, resolveDrumPadIndex);
        }
      });

      // Sync mixer / synth changes for existing tracks
      state.tracks.forEach((track) => {
        const ch = audioEngine.mixer.getChannel(track.id);
        if (!ch) return;
        const prev = prevTrackMap.get(track.id);
        if (!prev) return;

        if (prev.volume !== track.volume) ch.setVolume(track.volume);
        if (prev.pan !== track.pan) ch.setPan(track.pan);
        if (prev.muted !== track.muted) ch.setMuted(track.muted);
        if (prev.soloed !== track.soloed) audioEngine.mixer.setSolo(track.id, track.soloed);

        if (track.type === "synth") {
          // Sync preset changes
          if (track.synthPreset && prev.synthPreset !== track.synthPreset) {
            const inst = getSynthInstrument(track.id);
            if (inst instanceof PolySynthInstrument) {
              inst.applyPreset(track.synthPreset);
            }
          }
          // Re-schedule Tone.Part whenever notes/clips change (Immer creates new ref on any mutation)
          if (prev.clips !== track.clips) {
            syncSynthClips(track);
          }
        }
      });

      // Clean up removed tracks
      const currentIds = new Set(state.tracks.map((t) => t.id));
      prevState.tracks.forEach((t) => {
        if (!currentIds.has(t.id)) cleanupTrack(t.id);
      });
    });

    return unsub;
  }, []);
}
