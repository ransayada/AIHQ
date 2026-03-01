import { describe, it, expect } from "vitest";
import {
  noteNumberToName,
  noteNameToNumber,
  quantizeToGrid,
  midiToFrequency,
  isBlackKey,
  getScaleNotes,
} from "../utils/midiUtils";

describe("noteNumberToName", () => {
  it("converts middle C (60) to C4", () => {
    expect(noteNumberToName(60)).toBe("C4");
  });

  it("converts A4 (69) correctly", () => {
    expect(noteNumberToName(69)).toBe("A4");
  });

  it("converts C0 (0) correctly", () => {
    expect(noteNumberToName(0)).toBe("C-1");
  });

  it("converts G9 (127) correctly", () => {
    expect(noteNumberToName(127)).toBe("G9");
  });

  it("handles sharp notes correctly", () => {
    expect(noteNumberToName(61)).toBe("C#4");
  });
});

describe("noteNameToNumber", () => {
  it("converts C4 to 60", () => {
    expect(noteNameToNumber("C4")).toBe(60);
  });

  it("converts A4 to 69", () => {
    expect(noteNameToNumber("A4")).toBe(69);
  });

  it("round-trips: name → number → name", () => {
    for (let midi = 0; midi <= 127; midi++) {
      const name = noteNumberToName(midi);
      expect(noteNameToNumber(name)).toBe(midi);
    }
  });

  it("throws on invalid note name", () => {
    expect(() => noteNameToNumber("Z9")).toThrow();
    expect(() => noteNameToNumber("invalid")).toThrow();
  });
});

describe("quantizeToGrid", () => {
  it("snaps to quarter notes (division=4)", () => {
    expect(quantizeToGrid(0.4, 4)).toBe(0); // rounds to 0
    expect(quantizeToGrid(0.6, 4)).toBe(1); // rounds to 1 beat
    expect(quantizeToGrid(1.4, 4)).toBe(1); // stays at 1
  });

  it("snaps to 16th notes (division=16)", () => {
    const gridSize = 1 / 4; // 16th note = 0.25 beats
    expect(quantizeToGrid(0.1, 16)).toBe(0);
    expect(quantizeToGrid(0.15, 16)).toBeCloseTo(gridSize);
  });

  it("snaps to 32nd notes without error", () => {
    const result = quantizeToGrid(0.05, 32);
    expect(typeof result).toBe("number");
    expect(isFinite(result)).toBe(true);
  });
});

describe("midiToFrequency", () => {
  it("A4 (69) = 440 Hz", () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 1);
  });

  it("A3 (57) = 220 Hz", () => {
    expect(midiToFrequency(57)).toBeCloseTo(220, 1);
  });

  it("C4 (60) ≈ 261.63 Hz", () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 0);
  });
});

describe("isBlackKey", () => {
  it("C is a white key", () => expect(isBlackKey(60)).toBe(false));
  it("C# is a black key", () => expect(isBlackKey(61)).toBe(true));
  it("D is a white key", () => expect(isBlackKey(62)).toBe(false));
  it("D# is a black key", () => expect(isBlackKey(63)).toBe(true));
  it("E is a white key", () => expect(isBlackKey(64)).toBe(false));
  it("F is a white key", () => expect(isBlackKey(65)).toBe(false));
  it("F# is a black key", () => expect(isBlackKey(66)).toBe(true));
});

describe("getScaleNotes", () => {
  it("major scale has 7 unique pitch classes", () => {
    const notes = getScaleNotes(0, "major");
    const pitchClasses = new Set(notes.map((n) => n % 12));
    expect(pitchClasses.size).toBe(7);
  });

  it("pentatonic scale has 5 unique pitch classes", () => {
    const notes = getScaleNotes(0, "pentatonic");
    const pitchClasses = new Set(notes.map((n) => n % 12));
    expect(pitchClasses.size).toBe(5);
  });

  it("all notes are within MIDI range", () => {
    const notes = getScaleNotes(60, "minor");
    expect(notes.every((n) => n >= 0 && n <= 127)).toBe(true);
  });
});
