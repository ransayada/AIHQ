"use client";

import { useEffect } from "react";
import {
  audioEngine,
  PolySynthInstrument,
  ensureTrackRegistered,
  cleanupTrack,
  getSynthInstrument,
  getEffectsChain,
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
      // Register new tracks
      state.tracks.forEach((t) => ensureTrackRegistered(t, resolveDrumPadIndex));

      // Sync mixer changes (volume, pan, mute) for all tracks
      state.tracks.forEach((track) => {
        const ch = audioEngine.mixer.getChannel(track.id);
        if (!ch) return;
        const prev = prevState.tracks.find((t) => t.id === track.id);
        if (!prev) return;
        if (prev.volume !== track.volume) ch.setVolume(track.volume);
        if (prev.pan !== track.pan) ch.setPan(track.pan);
        if (prev.muted !== track.muted) ch.setMuted(track.muted);
        if (prev.soloed !== track.soloed) audioEngine.mixer.setSolo(track.id, track.soloed);

        // Sync synth preset changes
        if (
          track.type === "synth" &&
          track.synthPreset &&
          prev.synthPreset !== track.synthPreset
        ) {
          const inst = getSynthInstrument(track.id);
          if (inst instanceof PolySynthInstrument) {
            inst.applyPreset(track.synthPreset);
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
