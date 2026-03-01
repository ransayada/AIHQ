// DAW-specific audio types that don't belong in Zod schemas

export type TransportState = "started" | "stopped" | "paused";

export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle" | "fatsawtooth";

export type FilterType = "lowpass" | "highpass" | "bandpass" | "notch";

export type EffectType = "reverb" | "delay" | "eq3" | "compressor" | "distortion" | "chorus";

export interface TransportPosition {
  bar: number;
  beat: number;
  tick: number;
}

export interface NoteEvent {
  pitch: number; // 0-127 MIDI note number
  velocity: number; // 1-127
  time: number; // Tone.js time in seconds
  duration: number; // Duration in seconds
}

export interface DrumPadConfig {
  index: number; // 0-8
  name: string; // e.g. "Kick", "Snare", "Hi-Hat"
  midiNote: number;
  color: string;
}

export const DEFAULT_DRUM_PADS: DrumPadConfig[] = [
  { index: 0, name: "Kick", midiNote: 36, color: "#ff4757" },
  { index: 1, name: "Snare", midiNote: 38, color: "#ff6b81" },
  { index: 2, name: "Hi-Hat Closed", midiNote: 42, color: "#ffa502" },
  { index: 3, name: "Hi-Hat Open", midiNote: 46, color: "#ff7f50" },
  { index: 4, name: "Tom 1", midiNote: 45, color: "#2ed573" },
  { index: 5, name: "Tom 2", midiNote: 47, color: "#1e90ff" },
  { index: 6, name: "Crash", midiNote: 49, color: "#a29bfe" },
  { index: 7, name: "Ride", midiNote: 51, color: "#fd79a8" },
  { index: 8, name: "Clap", midiNote: 39, color: "#fdcb6e" },
];

export type NoteOnCallback = (pitch: number, velocity: number, time: number) => void;
export type NoteOffCallback = (pitch: number, time: number) => void;

export interface EffectParams {
  reverb: { decay: number; wet: number; preDelay: number };
  delay: { delayTime: number; feedback: number; wet: number };
  eq3: { low: number; mid: number; high: number; lowFrequency: number; highFrequency: number };
  compressor: { threshold: number; ratio: number; attack: number; release: number; knee: number };
  distortion: { distortion: number; wet: number };
  chorus: { frequency: number; depth: number; delayTime: number; feedback: number; wet: number };
}
