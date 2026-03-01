import * as Tone from "tone";

export type StepCallback = (time: number, step: number) => void;

/**
 * 16-step drum sequencer. Each track has its own Tone.Sequence.
 * The Sequencer is driven by Tone.Transport.
 */
export class Sequencer {
  private sequences = new Map<string, Tone.Sequence<number>>();
  private patterns = new Map<string, boolean[]>();
  private velocities = new Map<string, number[]>();
  private callbacks = new Map<string, StepCallback>();

  /**
   * Register a track with the sequencer.
   */
  addTrack(trackId: string, onStep: StepCallback): void {
    if (this.sequences.has(trackId)) return;

    const steps = new Array(16).fill(false) as boolean[];
    const vels = new Array(16).fill(100) as number[];
    this.patterns.set(trackId, steps);
    this.velocities.set(trackId, vels);
    this.callbacks.set(trackId, onStep);

    const seq = new Tone.Sequence<number>(
      (time, stepIndex) => {
        const pattern = this.patterns.get(trackId);
        if (pattern?.[stepIndex]) {
          const vel = this.velocities.get(trackId)?.[stepIndex] ?? 100;
          onStep(time, stepIndex);
          void vel; // velocity is passed via the callback's context
        }
      },
      Array.from({ length: 16 }, (_, i) => i),
      "16n"
    );

    this.sequences.set(trackId, seq);
    seq.start(0);
  }

  removeTrack(trackId: string): void {
    const seq = this.sequences.get(trackId);
    if (seq) {
      seq.stop();
      seq.dispose();
      this.sequences.delete(trackId);
    }
    this.patterns.delete(trackId);
    this.velocities.delete(trackId);
    this.callbacks.delete(trackId);
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
    this.sequences.forEach((seq) => {
      seq.stop();
      seq.dispose();
    });
    this.sequences.clear();
    this.patterns.clear();
    this.velocities.clear();
    this.callbacks.clear();
  }
}
