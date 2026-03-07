import * as Tone from "tone";
import { TransportEngine } from "./TransportEngine";
import { Sequencer } from "../sequencer/Sequencer";
import { MixerEngine } from "../mixer/MixerEngine";
import { MagentaEngine } from "../ai/MagentaEngine";

/**
 * AudioEngine — Singleton orchestrator for all audio subsystems.
 *
 * IMPORTANT: The AudioContext cannot be started without a user gesture.
 * Always call `initialize()` from a user interaction handler (e.g., click on Play).
 * Do NOT initialize in useEffect or component mount.
 *
 * Pattern:
 *   const engine = AudioEngine.getInstance();
 *   // In click handler:
 *   await engine.initialize();
 *   engine.transport.play();
 */
class AudioEngine {
  private static _instance: AudioEngine | null = null;
  private _initialized = false;

  readonly transport: TransportEngine;
  readonly sequencer: Sequencer;
  readonly mixer: MixerEngine;
  readonly magenta: MagentaEngine;

  private constructor() {
    this.transport = new TransportEngine();
    this.sequencer = new Sequencer();
    this.mixer = new MixerEngine();
    this.magenta = new MagentaEngine();
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine._instance) {
      AudioEngine._instance = new AudioEngine();
    }
    return AudioEngine._instance;
  }

  get isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Must be called from a user gesture (click/keydown) before any audio plays.
   * Idempotent — safe to call multiple times.
   */
  async initialize(): Promise<void> {
    // Always call Tone.start() — it is idempotent (only resumes if context is not already
    // running), so it also handles re-resuming after the browser suspends the AudioContext
    // on tab-switch or inactivity.
    await Tone.start();
    this._initialized = true;
  }

  setBpm(bpm: number): void {
    this.transport.setBpm(bpm);
  }

  setTimeSignature(numerator: number, denominator: number): void {
    this.transport.setTimeSignature(numerator, denominator);
  }

  /**
   * Reset all state — called when loading a new project.
   */
  reset(): void {
    this.transport.stop();
    this.sequencer.dispose();
    this.mixer.dispose();
  }

  /**
   * Destroy the singleton — only needed in tests.
   */
  static destroy(): void {
    AudioEngine._instance?.transport.dispose();
    AudioEngine._instance?.sequencer.dispose();
    AudioEngine._instance?.mixer.dispose();
    AudioEngine._instance = null;
  }
}

// Export singleton instance
export const audioEngine = AudioEngine.getInstance();
export { AudioEngine };
