import * as Tone from "tone";

export type DeckId = "A" | "B" | "C" | "D";

/**
 * DJDeck — single deck audio engine.
 *
 * Signal chain:
 *   Player → channel (volume/pan)
 *          → eq3    (3-band EQ)
 *          → filter (low-pass kill filter)
 *          → reverb (send effect)
 *          → delay  (send effect)
 *          → analyser (waveform visualiser)
 *          → masterOut
 *
 * All methods are safe to call before a track is loaded (they no-op).
 */
export class DJDeck {
  readonly id: DeckId;

  private channel:  Tone.Channel;
  private eq3:      Tone.EQ3;
  private filter:   Tone.Filter;
  private reverb:   Tone.Reverb;
  private delay:    Tone.FeedbackDelay;
  private analyser: Tone.Analyser;
  private player:   Tone.Player | null = null;

  // Pause/resume position tracking
  private _pauseOffset  = 0;   // seconds into the track at the last pause
  private _playStart    = 0;   // Tone.now() at which the last play() began
  private _isPlaying    = false;
  private _loop         = false;

  constructor(id: DeckId, masterOut: Tone.Channel) {
    this.id = id;

    this.eq3      = new Tone.EQ3({ low: 0, mid: 0, high: 0 });
    this.filter   = new Tone.Filter({ frequency: 20000, type: "lowpass", rolloff: -12 });
    this.reverb   = new Tone.Reverb({ decay: 2, wet: 0 });
    this.delay    = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.3, wet: 0 });
    this.analyser = new Tone.Analyser("waveform", 128);
    this.channel  = new Tone.Channel({ volume: 0, pan: 0 });

    // Build the signal chain
    this.channel.connect(this.eq3);
    this.eq3.connect(this.filter);
    this.filter.connect(this.reverb);
    this.reverb.connect(this.delay);
    this.delay.connect(this.analyser);
    (this.analyser as unknown as { connect: (dst: Tone.Channel) => void }).connect(masterOut);
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  async load(url: string): Promise<void> {
    // Dispose previous player
    if (this.player) {
      try { this.player.stop(); } catch (_) { /* already stopped */ }
      this.player.disconnect();
      this.player.dispose();
      this.player = null;
    }

    this._pauseOffset = 0;
    this._playStart   = 0;
    this._isPlaying   = false;

    this.player = new Tone.Player({ url, loop: this._loop });
    await this.player.load(url);
    this.player.connect(this.channel);
  }

  // ── State getters ──────────────────────────────────────────────────────────

  get isLoaded(): boolean {
    return this.player !== null && this.player.loaded;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get duration(): number {
    return this.player?.buffer?.duration ?? 0;
  }

  /** Current playback position in seconds. */
  get currentPosition(): number {
    if (!this._isPlaying) return this._pauseOffset;
    const elapsed = Tone.now() - this._playStart;
    const raw     = this._pauseOffset + elapsed;
    return this.duration > 0 ? raw % this.duration : raw;
  }

  // ── Transport ──────────────────────────────────────────────────────────────

  play(): void {
    if (!this.player?.loaded || this._isPlaying) return;
    const offset = this.duration > 0
      ? Math.min(this._pauseOffset, this.duration - 0.01)
      : 0;
    this.player.start("+0", offset);
    this._playStart  = Tone.now();
    this._isPlaying  = true;
  }

  pause(): void {
    if (!this._isPlaying || !this.player) return;
    const elapsed     = Tone.now() - this._playStart;
    this._pauseOffset = this._pauseOffset + elapsed;
    if (this.duration > 0) this._pauseOffset %= this.duration;
    try { this.player.stop(); } catch (_) { /* already stopped */ }
    this._isPlaying = false;
  }

  stop(): void {
    if (this.player) {
      try { this.player.stop(); } catch (_) { /* already stopped */ }
    }
    this._pauseOffset = 0;
    this._playStart   = 0;
    this._isPlaying   = false;
  }

  /** Jump to the cue point (position 0) and play immediately. */
  cue(): void {
    this.stop();
    this.play();
  }

  // ── Mixer controls ─────────────────────────────────────────────────────────

  /** Volume in dB, range -60 to 6. */
  setVolume(db: number): void {
    this.channel.volume.value = Math.max(-60, Math.min(6, db));
  }

  /** Playback rate, 0.25–4.0 (1.0 = original pitch/speed). */
  setPlaybackRate(rate: number): void {
    if (this.player) {
      this.player.playbackRate = Math.max(0.25, Math.min(4, rate));
    }
  }

  setLoop(loop: boolean): void {
    this._loop = loop;
    if (this.player) this.player.loop = loop;
  }

  // ── EQ ─────────────────────────────────────────────────────────────────────

  setEQLow(db: number):  void { this.eq3.low.value  = Math.max(-15, Math.min(6, db)); }
  setEQMid(db: number):  void { this.eq3.mid.value  = Math.max(-15, Math.min(6, db)); }
  setEQHigh(db: number): void { this.eq3.high.value = Math.max(-15, Math.min(6, db)); }

  // ── Effects ────────────────────────────────────────────────────────────────

  /**
   * Filter kill knob. 0 = fully filtered (200 Hz low-pass), 1 = wide open (20 kHz).
   * Exponential frequency scale maps to the classic DJ filter sweep.
   */
  setFilter(value: number): void {
    const v    = Math.max(0, Math.min(1, value));
    const freq = 200 * Math.pow(100, v); // 200 Hz → 20 kHz
    this.filter.frequency.rampTo(freq, 0.02);
  }

  /** Reverb wet mix, 0–1. */
  setReverb(wet: number): void {
    this.reverb.wet.value = Math.max(0, Math.min(1, wet));
  }

  /** Delay wet mix, 0–1. */
  setDelay(wet: number): void {
    this.delay.wet.value = Math.max(0, Math.min(1, wet));
  }

  // ── Visualiser ─────────────────────────────────────────────────────────────

  /** Real-time waveform samples (-1 to 1). Call every animation frame. */
  getWaveformData(): Float32Array {
    const val = this.analyser.getValue();
    return val instanceof Float32Array ? val : new Float32Array(128);
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  dispose(): void {
    try { this.player?.stop(); } catch (_) { /* already stopped */ }
    this.player?.dispose();
    this.eq3.dispose();
    this.filter.dispose();
    this.reverb.dispose();
    this.delay.dispose();
    this.analyser.dispose();
    this.channel.dispose();
  }
}
