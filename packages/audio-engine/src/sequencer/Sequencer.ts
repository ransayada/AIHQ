import * as Tone from "tone";

export type StepCallback = (time: number, step: number) => void;

/**
 * 16-step drum sequencer.
 *
 * Uses a single shared Tone.Sequence that fires all registered track callbacks
 * on each step tick, reducing audio-thread scheduling objects from N to 1.
 * With 16 tracks previously = 16 Tone.Sequence instances; now always = 1.
 */
export class Sequencer {
  private sharedSeq: Tone.Sequence<number> | null = null;
  private patterns = new Map<string, boolean[]>();
  private velocities = new Map<string, number[]>();
  private callbacks = new Map<string, StepCallback>();

  /**
   * Register a track with the sequencer.
   */
  addTrack(trackId: string, onStep: StepCallback): void {
    if (this.callbacks.has(trackId)) return;

    this.patterns.set(trackId, new Array(16).fill(false) as boolean[]);
    this.velocities.set(trackId, new Array(16).fill(100) as number[]);
    this.callbacks.set(trackId, onStep);

    // Create the single shared sequence on first track registration
    if (!this.sharedSeq) {
      this.sharedSeq = new Tone.Sequence<number>(
        (time, stepIndex) => {
          this.callbacks.forEach((cb, id) => {
            if (this.patterns.get(id)?.[stepIndex]) {
              cb(time, stepIndex);
            }
          });
        },
        Array.from({ length: 16 }, (_, i) => i),
        "16n"
      );
      this.sharedSeq.start(0);
    }
  }

  removeTrack(trackId: string): void {
    this.patterns.delete(trackId);
    this.velocities.delete(trackId);
    this.callbacks.delete(trackId);

    // Dispose the shared sequence when the last track is removed
    if (this.callbacks.size === 0 && this.sharedSeq) {
      this.sharedSeq.stop();
      this.sharedSeq.dispose();
      this.sharedSeq = null;
    }
  }

  setStep(trackId: string, step: number, active: boolean): void {
    const pattern = this.patterns.get(trackId);
    if (pattern && step >= 0 && step < 16) {
      pattern[step] = active;
    }
  }

  setVelocity(trackId: string, step: number, velocity: number): void {
    const vels = this.velocities.get(trackId);
    if (vels && step >= 0 && step < 16) {
      vels[step] = Math.max(1, Math.min(127, velocity));
    }
  }

  setPattern(trackId: string, steps: boolean[], velocities?: number[]): void {
    const pattern = this.patterns.get(trackId);
    if (pattern) {
      for (let i = 0; i < 16; i++) {
        pattern[i] = steps[i] ?? false;
      }
    }
    if (velocities) {
      const vels = this.velocities.get(trackId);
      if (vels) {
        for (let i = 0; i < 16; i++) {
          vels[i] = velocities[i] ?? 100;
        }
      }
    }
  }

  getPattern(trackId: string): boolean[] {
    return [...(this.patterns.get(trackId) ?? new Array(16).fill(false))];
  }

  getVelocities(trackId: string): number[] {
    return [...(this.velocities.get(trackId) ?? new Array(16).fill(100))];
  }

  clearPattern(trackId: string): void {
    const pattern = this.patterns.get(trackId);
    if (pattern) pattern.fill(false);
  }

  dispose(): void {
    if (this.sharedSeq) {
      this.sharedSeq.stop();
      this.sharedSeq.dispose();
      this.sharedSeq = null;
    }
    this.patterns.clear();
    this.velocities.clear();
    this.callbacks.clear();
  }
}
