import * as Tone from "tone";
import { parsePosition, formatPosition } from "../utils/timeUtils";

export type TransportState = "started" | "stopped" | "paused";

export type PositionChangeCallback = (position: string, formatted: string) => void;

export class TransportEngine {
  private metronomeEnabled = false;
  private metronomeSynth: Tone.MetalSynth | null = null;
  private positionCallbacks = new Set<PositionChangeCallback>();
  private tickScheduleId: number | null = null;

  play(): void {
    Tone.getTransport().start();
    this.startPositionTracking();
  }

  stop(): void {
    Tone.getTransport().stop();
    this.stopPositionTracking();
    this.notifyPosition("0:0:0");
  }

  pause(): void {
    Tone.getTransport().pause();
    this.stopPositionTracking();
  }

  getState(): TransportState {
    return Tone.getTransport().state as TransportState;
  }

  getPosition(): string {
    return Tone.getTransport().position as string;
  }

  setBpm(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  getBpm(): number {
    return Tone.getTransport().bpm.value;
  }

  setTimeSignature(numerator: number, denominator: number): void {
    Tone.getTransport().timeSignature = [numerator, denominator];
  }

  enableMetronome(enabled: boolean): void {
    this.metronomeEnabled = enabled;

    if (enabled && !this.metronomeSynth) {
      this.metronomeSynth = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).toDestination();

      Tone.getTransport().scheduleRepeat((time) => {
        if (this.metronomeEnabled) {
          this.metronomeSynth?.triggerAttackRelease("32n", time);
        }
      }, "4n");
    }

    if (!enabled && this.metronomeSynth) {
      this.metronomeSynth.dispose();
      this.metronomeSynth = null;
    }
  }

  onPositionChange(cb: PositionChangeCallback): () => void {
    this.positionCallbacks.add(cb);
    return () => this.positionCallbacks.delete(cb);
  }

  private startPositionTracking(): void {
    const update = () => {
      if (Tone.getTransport().state === "started") {
        const pos = this.getPosition();
        this.notifyPosition(pos);
        this.tickScheduleId = requestAnimationFrame(update);
      }
    };
    this.tickScheduleId = requestAnimationFrame(update);
  }

  private stopPositionTracking(): void {
    if (this.tickScheduleId !== null) {
      cancelAnimationFrame(this.tickScheduleId);
      this.tickScheduleId = null;
    }
  }

  private notifyPosition(pos: string): void {
    const formatted = formatPosition(pos);
    this.positionCallbacks.forEach((cb) => cb(pos, formatted));
  }

  dispose(): void {
    this.stopPositionTracking();
    this.metronomeSynth?.dispose();
    this.positionCallbacks.clear();
  }
}
