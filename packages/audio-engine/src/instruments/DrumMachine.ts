import * as Tone from "tone";
import type { DrumPadConfig } from "@aihq/shared";

/**
 * Sample-based drum machine using Tone.Sampler.
 * Each pad can be assigned a sample URL.
 */
export class DrumMachine {
  private sampler: Tone.Sampler | null = null;
  private channel: Tone.Channel;
  private padConfigs: DrumPadConfig[];
  private isLoaded = false;

  constructor(channel: Tone.Channel, padConfigs: DrumPadConfig[]) {
    this.channel = channel;
    this.padConfigs = padConfigs;
  }

  async loadSamples(sampleMap: Record<number, string>): Promise<void> {
    return new Promise((resolve) => {
      this.sampler?.dispose();

      // Build Tone.Sampler URLs map from padIndex → URL
      const urlMap: Record<string, string> = {};
      for (const [padIndex, url] of Object.entries(sampleMap)) {
        const pad = this.padConfigs[Number(padIndex)];
        if (pad) {
          urlMap[pad.midiNote.toString()] = url;
        }
      }

      this.sampler = new Tone.Sampler(urlMap, {
        onload: () => {
          this.isLoaded = true;
          resolve();
        },
      }).connect(this.channel);
    });
  }

  triggerPad(padIndex: number, time?: number): void {
    if (!this.sampler || !this.isLoaded) return;
    const pad = this.padConfigs[padIndex];
    if (!pad) return;
    const t = time !== undefined ? time : Tone.now();
    // Convert MIDI note to note name string (e.g. 36 → "C2")
    const noteName = Tone.Frequency(pad.midiNote, "midi").toNote();
    this.sampler.triggerAttack(noteName, t);
  }

  dispose(): void {
    this.sampler?.dispose();
  }
}
