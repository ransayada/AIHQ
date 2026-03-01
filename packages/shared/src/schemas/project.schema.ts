import { z } from "zod";
import { MidiNoteSchema } from "./note.schema";

// Step sequencer pattern for drum tracks (16 steps)
export const StepPatternSchema = z.object({
  steps: z.array(z.boolean()).length(16),
  velocities: z.array(z.number().int().min(0).max(127)).length(16),
});

// Synthesizer oscillator + envelope + filter preset
export const SynthPresetSchema = z.object({
  oscillator: z.object({
    type: z.enum(["sine", "square", "sawtooth", "triangle", "fatsawtooth"]),
    detune: z.number().min(-100).max(100).default(0),
    count: z.number().int().min(1).max(8).default(1),
  }),
  envelope: z.object({
    attack: z.number().min(0.001).max(2).default(0.01),
    decay: z.number().min(0.001).max(2).default(0.1),
    sustain: z.number().min(0).max(1).default(0.5),
    release: z.number().min(0.001).max(5).default(0.5),
  }),
  filter: z.object({
    type: z.enum(["lowpass", "highpass", "bandpass", "notch"]).default("lowpass"),
    frequency: z.number().min(20).max(20000).default(2000),
    rolloff: z.number().int().default(-24),
    Q: z.number().min(0).max(20).default(1),
    envelopeAmount: z.number().min(0).max(1).default(0),
  }),
});

// A single effect in the effects chain
export const EffectSchema = z.object({
  id: z.string(),
  type: z.enum(["reverb", "delay", "eq3", "compressor", "distortion", "chorus", "phaser"]),
  enabled: z.boolean().default(true),
  params: z.record(z.string(), z.number()),
});

// A single audio/MIDI clip in the arrangement
export const ClipSchema = z.object({
  id: z.string(),
  name: z.string(),
  startBeat: z.number().nonnegative(),
  lengthBeats: z.number().positive(),
  notes: z.array(MidiNoteSchema),
  sampleId: z.string().optional(),
  color: z.string().optional(),
});

// A single track in the project
export const TrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["synth", "drum", "audio", "midi"]),
  color: z.string().default("#7c4dff"),
  volume: z.number().min(-60).max(6).default(0),
  pan: z.number().min(-1).max(1).default(0),
  muted: z.boolean().default(false),
  soloed: z.boolean().default(false),
  armed: z.boolean().default(false),
  synthPreset: SynthPresetSchema.optional(),
  stepPattern: StepPatternSchema.optional(),
  drumSampleIds: z.record(z.string(), z.string()).optional(), // padIndex -> sampleId
  clips: z.array(ClipSchema).default([]),
  effectChain: z.array(EffectSchema).default([]),
  sendLevels: z.record(z.string(), z.number()).default({}),
});

// Full serializable project state stored in the DB
export const ProjectDataSchema = z.object({
  version: z.literal("1"),
  bpm: z.number().int().min(40).max(300).default(120),
  timeSignatureNumerator: z.number().int().min(2).max(12).default(4),
  timeSignatureDenominator: z.number().int().min(2).max(16).default(4),
  key: z.string().default("C"),
  scale: z.enum(["major", "minor", "dorian", "mixolydian", "pentatonic"]).default("major"),
  tracks: z.array(TrackSchema).default([]),
  masterVolume: z.number().min(0).max(1).default(0.8),
  masterPan: z.number().min(-1).max(1).default(0),
  sampleIds: z.array(z.string()).default([]),
  viewState: z
    .object({
      scrollX: z.number().default(0),
      scrollY: z.number().default(0),
      zoom: z.number().min(0.1).max(10).default(1),
    })
    .default({}),
});

export const ProjectMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  bpm: z.number().int(),
  key: z.string(),
  scale: z.string(),
  thumbnailUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastOpenedAt: z.coerce.date(),
});

// API schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const SaveProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  data: ProjectDataSchema,
});

export type StepPattern = z.infer<typeof StepPatternSchema>;
export type SynthPreset = z.infer<typeof SynthPresetSchema>;
export type Effect = z.infer<typeof EffectSchema>;
export type Clip = z.infer<typeof ClipSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type ProjectData = z.infer<typeof ProjectDataSchema>;
export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type SaveProject = z.infer<typeof SaveProjectSchema>;
