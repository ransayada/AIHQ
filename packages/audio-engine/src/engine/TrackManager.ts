import * as Tone from "tone";
import { SynthDrumKit } from "../instruments/SynthDrumKit";
import { PolySynthInstrument } from "../instruments/PolySynth";
import { EffectsChain } from "../effects/EffectsChain";
import { audioEngine } from "./AudioEngine";
import type { Track } from "@aihq/shared";

// Module-level registries so instruments survive React re-renders
const instrumentRegistry = new Map<string, SynthDrumKit | PolySynthInstrument>();
const effectsRegistry = new Map<string, EffectsChain>();
const instrChannelRegistry = new Map<string, Tone.Channel>();

/** Register a track with the audio engine (idempotent). */
export function ensureTrackRegistered(
  track: Track,
  resolveDrumPadIndex: (trackId: string) => number
): void {
  if (instrumentRegistry.has(track.id)) {
    // Already registered — keep sequencer pattern in sync
    if (track.type === "drum" && track.stepPattern) {
      audioEngine.sequencer.setPattern(
        track.id,
        track.stepPattern.steps,
        track.stepPattern.velocities
      );
    }
    return;
  }

  // 1. Create intermediate channel for the instrument's dry output
  const instrChannel = new Tone.Channel();
  instrChannelRegistry.set(track.id, instrChannel);

  // 2. Create mixer channel (goes to Destination)
  const mixerAudioChannel = audioEngine.mixer.createChannel(track.id);
  mixerAudioChannel.setVolume(track.volume);
  mixerAudioChannel.setPan(track.pan);
  if (track.muted) mixerAudioChannel.setMuted(true);

  // 3. Create effects chain: instrChannel → [fx] → mixerChannel
  const fx = new EffectsChain(instrChannel, mixerAudioChannel.input);
  effectsRegistry.set(track.id, fx);

  // 4. Create instrument
  if (track.type === "drum") {
    const drumKit = new SynthDrumKit(instrChannel);
    instrumentRegistry.set(track.id, drumKit);

    // Register with sequencer — callback fires per active step
    audioEngine.sequencer.addTrack(track.id, (time) => {
      const padIndex = resolveDrumPadIndex(track.id);
      if (padIndex !== -1) drumKit.triggerPad(padIndex, time);
    });

    if (track.stepPattern) {
      audioEngine.sequencer.setPattern(
        track.id,
        track.stepPattern.steps,
        track.stepPattern.velocities
      );
    }
  } else if (track.type === "synth") {
    const synth = new PolySynthInstrument(instrChannel);
    if (track.synthPreset) synth.applyPreset(track.synthPreset);
    instrumentRegistry.set(track.id, synth);
  }
}

/** Dispose everything for a removed track. */
export function cleanupTrack(id: string): void {
  instrumentRegistry.get(id)?.dispose();
  instrumentRegistry.delete(id);

  effectsRegistry.get(id)?.dispose();
  effectsRegistry.delete(id);

  instrChannelRegistry.get(id)?.dispose();
  instrChannelRegistry.delete(id);

  audioEngine.sequencer.removeTrack(id);
  audioEngine.mixer.removeChannel(id);
}

/** Get the PolySynthInstrument for a synth track (used by SynthPanel for preview). */
export function getSynthInstrument(trackId: string): PolySynthInstrument | null {
  const inst = instrumentRegistry.get(trackId);
  return inst instanceof PolySynthInstrument ? inst : null;
}

/** Get the EffectsChain for any track (used by EffectsRack). */
export function getEffectsChain(trackId: string): EffectsChain | null {
  return effectsRegistry.get(trackId) ?? null;
}
