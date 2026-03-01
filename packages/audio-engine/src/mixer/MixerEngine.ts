import * as Tone from "tone";

export interface ChannelConfig {
  volume: number; // dB
  pan: number; // -1 to 1
  muted: boolean;
  soloed: boolean;
}

export class AudioChannel {
  private toneChannel: Tone.Channel;
  private _muted = false;
  private analyser: AnalyserNode | null = null;

  constructor() {
    this.toneChannel = new Tone.Channel().toDestination();
  }

  get input(): Tone.Channel {
    return this.toneChannel;
  }

  setVolume(db: number): void {
    this.toneChannel.volume.value = Math.max(-60, Math.min(6, db));
  }

  setPan(pan: number): void {
    this.toneChannel.pan.value = Math.max(-1, Math.min(1, pan));
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    this.toneChannel.mute = muted;
  }

  setSoloed(soloed: boolean): void {
    this.toneChannel.solo = soloed;
  }

  get muted(): boolean {
    return this._muted;
  }

  dispose(): void {
    this.toneChannel.dispose();
  }
}

export class MixerEngine {
  private channels = new Map<string, AudioChannel>();

  createChannel(id: string): AudioChannel {
    if (this.channels.has(id)) return this.channels.get(id)!;
    const channel = new AudioChannel();
    this.channels.set(id, channel);
    return channel;
  }

  getChannel(id: string): AudioChannel | undefined {
    return this.channels.get(id);
  }

  removeChannel(id: string): void {
    const channel = this.channels.get(id);
    channel?.dispose();
    this.channels.delete(id);
  }

  setChannelVolume(id: string, db: number): void {
    this.channels.get(id)?.setVolume(db);
  }

  setChannelPan(id: string, pan: number): void {
    this.channels.get(id)?.setPan(pan);
  }

  setChannelMuted(id: string, muted: boolean): void {
    this.channels.get(id)?.setMuted(muted);
  }

  /**
   * Handle solo logic: when a channel is soloed, mute all others.
   */
  setSolo(id: string, soloed: boolean): void {
    const channel = this.channels.get(id);
    if (!channel) return;
    channel.setSoloed(soloed);

    if (soloed) {
      // Mute all channels except this one
      this.channels.forEach((ch, chId) => {
        if (chId !== id) ch.setMuted(true);
      });
    } else {
      // Check if any channel is still soloed
      const anyStillSoloed = [...this.channels.values()].some((ch) => ch.input.solo);
      if (!anyStillSoloed) {
        // Restore all mutes
        this.channels.forEach((ch) => {
          if (!ch.muted) ch.setMuted(false);
        });
      }
    }
  }

  dispose(): void {
    this.channels.forEach((ch) => ch.dispose());
    this.channels.clear();
  }
}
