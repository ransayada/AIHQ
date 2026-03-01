import { describe, it, expect, beforeEach, vi } from "vitest";
import { Sequencer } from "../sequencer/Sequencer";

describe("Sequencer", () => {
  let sequencer: Sequencer;

  beforeEach(() => {
    sequencer = new Sequencer();
    vi.clearAllMocks();
  });

  describe("addTrack", () => {
    it("creates an empty 16-step pattern", () => {
      const cb = vi.fn();
      sequencer.addTrack("track-1", cb);
      const pattern = sequencer.getPattern("track-1");
      expect(pattern).toHaveLength(16);
      expect(pattern.every((s) => s === false)).toBe(true);
    });

    it("is idempotent (calling addTrack twice does not duplicate)", () => {
      const cb = vi.fn();
      sequencer.addTrack("track-1", cb);
      sequencer.addTrack("track-1", cb);
      // Pattern should still be length 16
      expect(sequencer.getPattern("track-1")).toHaveLength(16);
    });
  });

  describe("setStep", () => {
    it("activates a step", () => {
      sequencer.addTrack("track-1", vi.fn());
      sequencer.setStep("track-1", 0, true);
      expect(sequencer.getPattern("track-1")[0]).toBe(true);
    });

    it("deactivates a step", () => {
      sequencer.addTrack("track-1", vi.fn());
      sequencer.setStep("track-1", 0, true);
      sequencer.setStep("track-1", 0, false);
      expect(sequencer.getPattern("track-1")[0]).toBe(false);
    });

    it("can set the last step (index 15)", () => {
      sequencer.addTrack("track-1", vi.fn());
      sequencer.setStep("track-1", 15, true);
      expect(sequencer.getPattern("track-1")[15]).toBe(true);
    });

    it("ignores invalid step index", () => {
      sequencer.addTrack("track-1", vi.fn());
      sequencer.setStep("track-1", 16, true); // out of bounds
      sequencer.setStep("track-1", -1, true); // out of bounds
      expect(sequencer.getPattern("track-1").every((s) => s === false)).toBe(true);
    });

    it("does nothing for unknown track", () => {
      // Should not throw
      expect(() => sequencer.setStep("unknown", 0, true)).not.toThrow();
    });
  });

  describe("setPattern", () => {
    it("loads a full pattern", () => {
      sequencer.addTrack("track-1", vi.fn());
      const newPattern = new Array(16).fill(false) as boolean[];
      newPattern[0] = true;
      newPattern[4] = true;
      newPattern[8] = true;
      newPattern[12] = true;
      sequencer.setPattern("track-1", newPattern);

      const result = sequencer.getPattern("track-1");
      expect(result[0]).toBe(true);
      expect(result[4]).toBe(true);
      expect(result[8]).toBe(true);
      expect(result[12]).toBe(true);
      expect(result[1]).toBe(false);
    });
  });

  describe("clearPattern", () => {
    it("resets all steps to false", () => {
      sequencer.addTrack("track-1", vi.fn());
      sequencer.setStep("track-1", 0, true);
      sequencer.setStep("track-1", 8, true);
      sequencer.clearPattern("track-1");
      expect(sequencer.getPattern("track-1").every((s) => s === false)).toBe(true);
    });
  });

  describe("removeTrack", () => {
    it("removes the track", () => {
      sequencer.addTrack("track-1", vi.fn());
      sequencer.removeTrack("track-1");
      // Pattern should be empty default
      expect(sequencer.getPattern("track-1")).toHaveLength(16);
    });
  });

  describe("getVelocities", () => {
    it("returns default velocities of 100", () => {
      sequencer.addTrack("track-1", vi.fn());
      const vels = sequencer.getVelocities("track-1");
      expect(vels).toHaveLength(16);
      expect(vels.every((v) => v === 100)).toBe(true);
    });

    it("updates velocity", () => {
      sequencer.addTrack("track-1", vi.fn());
      sequencer.setVelocity("track-1", 0, 64);
      expect(sequencer.getVelocities("track-1")[0]).toBe(64);
    });

    it("clamps velocity to 1-127", () => {
      sequencer.addTrack("track-1", vi.fn());
      sequencer.setVelocity("track-1", 0, 200);
      expect(sequencer.getVelocities("track-1")[0]).toBe(127);
      sequencer.setVelocity("track-1", 0, -5);
      expect(sequencer.getVelocities("track-1")[0]).toBe(1);
    });
  });
});
