import * as Tone from "tone";
import type { SynthPreset } from "@aihq/shared";

/**
 * Polyphonic synthesizer wrapping Tone.PolySynth.
 * Supports runtime parameter changes via setParam().
 */
export class PolySynthInstrument {
  private synth: Tone.PolySynth;
  private channel: Tone.Channel;

  constructor(channel: Tone.Channel) {
    this.channel = channel;
    this.synth = new Tone.PolySynth(Tone.Synth);
    this.synth.set({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 },
    } as Parameters<typeof this.synth.set>[0]);
    this.synth.connect(this.channel);
  }

  noteOn(pitch: number, velocity: number): void {
    const freq = Tone.Frequency(pitch, "midi").toFrequency();
    const vel = velocity / 127;
    this.synth.triggerAttack(freq, Tone.now(), vel);
  }

  noteOff(pitch: number): void {
    const freq = Tone.Frequency(pitch, "midi").toFrequency();
    this.synth.triggerRelease(freq, Tone.now());
  }

  noteOnOff(pitch: number, velocity: number, duration: Tone.Unit.Time, time?: Tone.Unit.Time): void {
    const freq = Tone.Frequency(pitch, "midi").toFrequency();
    const vel = velocity / 127;
    this.synth.triggerAttackRelease(freq, duration, time, vel);
  }

  applyPreset(preset: SynthPreset): void {
    this.synth.set({
      oscillator: { type: preset.oscillator.type },
      envelope: {
        attack: preset.envelope.attack,
        decay: preset.envelope.decay,
        sustain: preset.envelope.sustain,
        release: preset.envelope.release,
      },
    } as Parameters<typeof this.synth.set>[0]);
  }

  setParam(path: string, value: number): void {
    const parts = path.split(".");
    if (parts[0] === "envelope" && parts[1]) {
      this.synth.set({ envelope: { [parts[1]]: value } });
    } else if (parts[0] === "oscillator" && parts[1]) {
      this.synth.set({ oscillator: { [parts[1]]: value } });
    }
  }

  dispose(): void {
    this.synth.dispose();
  }
}
