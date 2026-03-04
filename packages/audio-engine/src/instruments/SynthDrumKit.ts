import * as Tone from "tone";

type DrumSynth = Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth;

/**
 * Fully synthesized drum kit — no sample URLs required.
 * 16 pads matching DEFAULT_DRUM_PADS order:
 *   0=Kick  1=Snare  2=HH-Closed  3=HH-Open  4=Tom1  5=Tom2  6=Crash  7=Ride  8=Clap
 *   9=808Kick  10=Rim  11=Shaker  12=TomHi  13=HHPedal  14=Stab  15=Cowbell
 */
export class SynthDrumKit {
  private synths: DrumSynth[] = [];
  private channel: Tone.Channel;

  constructor(channel: Tone.Channel) {
    this.channel = channel;
    this.createSynths();
  }

  private createSynths(): void {
    // 0 — Kick
    this.synths.push(
      new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 8,
        envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
      }).connect(this.channel)
    );

    // 1 — Snare
    this.synths.push(
      new Tone.NoiseSynth({
        noise: { type: "white" as const },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
      }).connect(this.channel)
    );

    // 2 — Hi-Hat Closed
    const hhClosed = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(this.channel);
    hhClosed.frequency.value = 400;
    this.synths.push(hhClosed);

    // 3 — Hi-Hat Open
    const hhOpen = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.5 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(this.channel);
    hhOpen.frequency.value = 400;
    this.synths.push(hhOpen);

    // 4 — Tom 1
    this.synths.push(
      new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
      }).connect(this.channel)
    );

    // 5 — Tom 2
    this.synths.push(
      new Tone.MembraneSynth({
        pitchDecay: 0.12,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 },
      }).connect(this.channel)
    );

    // 6 — Crash
    const crash = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 1.2 },
      harmonicity: 5.1,
      modulationIndex: 64,
      resonance: 4000,
      octaves: 2,
    }).connect(this.channel);
    crash.frequency.value = 300;
    this.synths.push(crash);

    // 7 — Ride
    const ride = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.6 },
      harmonicity: 8,
      modulationIndex: 32,
      resonance: 5000,
      octaves: 1.5,
    }).connect(this.channel);
    ride.frequency.value = 500;
    this.synths.push(ride);

    // 8 — Clap
    this.synths.push(
      new Tone.NoiseSynth({
        noise: { type: "white" as const },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.03 },
      }).connect(this.channel)
    );

    // 9 — 808 Sub Kick (long pitch sweep, deep sub)
    this.synths.push(
      new Tone.MembraneSynth({
        pitchDecay: 0.5,
        octaves: 14,
        envelope: { attack: 0.001, decay: 0.9, sustain: 0, release: 0.3 },
      }).connect(this.channel)
    );

    // 10 — Rim Shot
    this.synths.push(
      new Tone.NoiseSynth({
        noise: { type: "pink" as const },
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
      }).connect(this.channel)
    );

    // 11 — Shaker (very short hi noise)
    this.synths.push(
      new Tone.NoiseSynth({
        noise: { type: "white" as const },
        envelope: { attack: 0.005, decay: 0.06, sustain: 0, release: 0.02 },
      }).connect(this.channel)
    );

    // 12 — Tom Hi (high-pitched tom)
    this.synths.push(
      new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.06 },
      }).connect(this.channel)
    );

    // 13 — HH Pedal (very short closed hat variant)
    const hhPedal = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.04 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1,
    }).connect(this.channel);
    hhPedal.frequency.value = 600;
    this.synths.push(hhPedal);

    // 14 — Electronic Stab / Zap (bright metallic accent)
    const stab = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.12 },
      harmonicity: 12,
      modulationIndex: 16,
      resonance: 8000,
      octaves: 2,
    }).connect(this.channel);
    stab.frequency.value = 800;
    this.synths.push(stab);

    // 15 — Cowbell (EDM classic)
    const cowbell = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.6 },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 3000,
      octaves: 0.5,
    }).connect(this.channel);
    cowbell.frequency.value = 562;
    this.synths.push(cowbell);
  }

  triggerPad(padIndex: number, time?: number, velocity = 100): void {
    const synth = this.synths[padIndex];
    if (!synth) return;

    const t = time ?? Tone.now();
    const vel = Math.max(0, Math.min(1, velocity / 127));

    // Pad-specific note pitches for membrane synths
    const membranePitches: Record<number, string> = {
      0: "C1",  // Kick — very deep
      4: "G2",  // Tom 1
      5: "D2",  // Tom 2
      9: "C1",  // 808 Sub Kick — same pitch, bigger sweep
      12: "A3", // Tom Hi — higher pitched
    };

    if (synth instanceof Tone.MembraneSynth) {
      synth.triggerAttackRelease(membranePitches[padIndex] ?? "C1", "16n", t, vel);
    } else if (synth instanceof Tone.NoiseSynth) {
      synth.triggerAttackRelease("16n", t, vel);
    } else if (synth instanceof Tone.MetalSynth) {
      synth.triggerAttackRelease("16n", t, vel);
    }
  }

  dispose(): void {
    this.synths.forEach((s) => s.dispose());
    this.synths = [];
  }
}
