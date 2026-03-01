/**
 * MagentaEngine — lazy-loaded Magenta.js wrapper.
 *
 * Magenta model bundles are ~15MB WASM files and must be loaded lazily.
 * Call `init()` once when the user opens the AI panel.
 */

export interface GeneratedDrumPattern {
  steps: boolean[];
  velocities: number[];
}

export interface GeneratedMelody {
  pitches: number[];
  durations: number[];
  velocities: number[];
}

// Minimal Magenta types we need
interface NoteSequenceNote {
  pitch?: number;
  startTime?: number;
  endTime?: number;
  velocity?: number;
  quantizedStartStep?: number;
  quantizedEndStep?: number;
  isDrum?: boolean;
}

interface NoteSequence {
  notes?: NoteSequenceNote[];
  totalQuantizedSteps?: number;
  quantizationInfo?: { stepsPerQuarter?: number };
}

interface MusicRNN {
  initialize: () => Promise<void>;
  continueSequence: (
    seq: NoteSequence,
    steps: number,
    temperature: number
  ) => Promise<NoteSequence>;
}

const DRUMS_CHECKPOINT =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn";
const MELODY_CHECKPOINT =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn";

export class MagentaEngine {
  private drumRnn: MusicRNN | null = null;
  private melodyRnn: MusicRNN | null = null;
  private loadingPromise: Promise<void> | null = null;

  get isLoaded(): boolean {
    return this.drumRnn !== null && this.melodyRnn !== null;
  }

  async init(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      // Dynamic import — keeps initial bundle small
      const { MusicRNN } = await import("@magenta/music/es6/music_rnn");

      this.drumRnn = new MusicRNN(DRUMS_CHECKPOINT) as MusicRNN;
      this.melodyRnn = new MusicRNN(MELODY_CHECKPOINT) as MusicRNN;

      await Promise.all([this.drumRnn.initialize(), this.melodyRnn.initialize()]);
    })();

    return this.loadingPromise;
  }

  /**
   * Generate a 16-step drum pattern.
   * @param temperature - Controls randomness (0.5 = conservative, 1.5 = creative)
   */
  async generateDrums(temperature = 1.0): Promise<GeneratedDrumPattern> {
    if (!this.drumRnn) throw new Error("Magenta not loaded. Call init() first.");

    // Seed: simple 4/4 kick pattern
    const seed: NoteSequence = {
      notes: [
        { pitch: 36, startTime: 0, endTime: 0.5, isDrum: true, velocity: 80 },
        { pitch: 36, startTime: 1, endTime: 1.5, isDrum: true, velocity: 80 },
      ],
      totalQuantizedSteps: 16,
      quantizationInfo: { stepsPerQuarter: 4 },
    };

    const result = await this.drumRnn.continueSequence(seed, 16, temperature);
    return this.noteSequenceToDrumPattern(result);
  }

  /**
   * Generate a melody continuation from a seed.
   */
  async generateMelody(
    seedPitches: number[] = [60, 64, 67],
    temperature = 1.1
  ): Promise<GeneratedMelody> {
    if (!this.melodyRnn) throw new Error("Magenta not loaded. Call init() first.");

    const seed: NoteSequence = {
      notes: seedPitches.map((pitch, i) => ({
        pitch,
        quantizedStartStep: i,
        quantizedEndStep: i + 1,
        velocity: 80,
      })),
      totalQuantizedSteps: seedPitches.length,
      quantizationInfo: { stepsPerQuarter: 4 },
    };

    const result = await this.melodyRnn.continueSequence(seed, 32, temperature);
    return this.noteSequenceToMelody(result);
  }

  private noteSequenceToDrumPattern(seq: NoteSequence): GeneratedDrumPattern {
    const steps = new Array(16).fill(false) as boolean[];
    const velocities = new Array(16).fill(80) as number[];

    seq.notes?.forEach((note) => {
      const stepIndex = note.quantizedStartStep ?? 0;
      if (stepIndex < 16) {
        steps[stepIndex] = true;
        velocities[stepIndex] = note.velocity ?? 80;
      }
    });

    return { steps, velocities };
  }

  private noteSequenceToMelody(seq: NoteSequence): GeneratedMelody {
    const pitches: number[] = [];
    const durations: number[] = [];
    const velocities: number[] = [];

    seq.notes?.forEach((note) => {
      pitches.push(note.pitch ?? 60);
      const start = note.quantizedStartStep ?? 0;
      const end = note.quantizedEndStep ?? start + 1;
      durations.push((end - start) * 0.25); // quarter beats
      velocities.push(note.velocity ?? 80);
    });

    return { pitches, durations, velocities };
  }
}
