import { describe, it, expect } from "vitest";
import {
  ProjectDataSchema,
  StepPatternSchema,
} from "../schemas/project.schema";
import { MidiNoteSchema } from "../schemas/note.schema";

describe("MidiNoteSchema", () => {
  it("parses a valid MIDI note", () => {
    const note = {
      id: "note-1",
      pitch: 60,
      velocity: 100,
      startBeat: 0,
      durationBeats: 1,
    };
    expect(() => MidiNoteSchema.parse(note)).not.toThrow();
  });

  it("rejects pitch above 127", () => {
    const note = { id: "n", pitch: 128, velocity: 100, startBeat: 0, durationBeats: 1 };
    expect(() => MidiNoteSchema.parse(note)).toThrow();
  });

  it("rejects zero velocity", () => {
    const note = { id: "n", pitch: 60, velocity: 0, startBeat: 0, durationBeats: 1 };
    expect(() => MidiNoteSchema.parse(note)).toThrow();
  });

  it("rejects negative startBeat", () => {
    const note = { id: "n", pitch: 60, velocity: 100, startBeat: -1, durationBeats: 1 };
    expect(() => MidiNoteSchema.parse(note)).toThrow();
  });
});

describe("StepPatternSchema", () => {
  it("parses a valid 16-step pattern", () => {
    const pattern = {
      steps: new Array(16).fill(false),
      velocities: new Array(16).fill(100),
    };
    expect(() => StepPatternSchema.parse(pattern)).not.toThrow();
  });

  it("rejects patterns with wrong step count", () => {
    const pattern = {
      steps: new Array(8).fill(false),
      velocities: new Array(8).fill(100),
    };
    expect(() => StepPatternSchema.parse(pattern)).toThrow();
  });
});

describe("ProjectDataSchema", () => {
  const validProject = {
    version: "1" as const,
    bpm: 120,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    key: "C",
    scale: "major" as const,
    tracks: [],
    masterVolume: 0.8,
    masterPan: 0,
    sampleIds: [],
    viewState: { scrollX: 0, scrollY: 0, zoom: 1 },
  };

  it("parses a valid project", () => {
    expect(() => ProjectDataSchema.parse(validProject)).not.toThrow();
  });

  it("applies defaults for optional fields", () => {
    const minimal = { version: "1" as const };
    const result = ProjectDataSchema.parse(minimal);
    expect(result.bpm).toBe(120);
    expect(result.tracks).toEqual([]);
    expect(result.masterVolume).toBe(0.8);
  });

  it("rejects BPM below 40", () => {
    expect(() => ProjectDataSchema.parse({ ...validProject, bpm: 30 })).toThrow();
  });

  it("rejects BPM above 300", () => {
    expect(() => ProjectDataSchema.parse({ ...validProject, bpm: 400 })).toThrow();
  });

  it("rejects invalid scale", () => {
    expect(() => ProjectDataSchema.parse({ ...validProject, scale: "blues" })).toThrow();
  });
});
