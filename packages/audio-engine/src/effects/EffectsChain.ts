import * as Tone from "tone";

export type EffectNode =
  | Tone.Reverb
  | Tone.FeedbackDelay
  | Tone.EQ3
  | Tone.Compressor
  | Tone.Distortion;

export interface EffectSlot {
  id: string;
  type: "reverb" | "delay" | "eq3" | "compressor" | "distortion";
  enabled: boolean;
  node: EffectNode;
}

/**
 * Ordered chain of audio effects.
 * Effects are connected in series: input → fx1 → fx2 → ... → output.
 */
export class EffectsChain {
  private slots: EffectSlot[] = [];
  private input: Tone.Channel;
  private output: Tone.Channel;

  constructor(input: Tone.Channel, output: Tone.Channel) {
    this.input = input;
    this.output = output;
    // Establish initial bypass connection (input → output, no effects)
    this.reconnect();
  }

  addEffect(
    id: string,
    type: EffectSlot["type"],
    params: Record<string, number> = {}
  ): EffectSlot {
    const node = this.createEffect(type, params);
    const slot: EffectSlot = { id, type, enabled: true, node };
    this.slots.push(slot);
    this.reconnect();
    return slot;
  }

  removeEffect(id: string): void {
    const idx = this.slots.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const slot = this.slots[idx]!;
    slot.node.dispose();
    this.slots.splice(idx, 1);
    this.reconnect();
  }

  setEnabled(id: string, enabled: boolean): void {
    const slot = this.slots.find((s) => s.id === id);
    if (slot) {
      slot.enabled = enabled;
      this.reconnect();
    }
  }

  setParam(id: string, key: string, value: number): void {
    const slot = this.slots.find((s) => s.id === id);
    if (!slot) return;

    const node = slot.node;
    if (node instanceof Tone.Reverb) {
      if (key === "wet") node.wet.value = value;
      if (key === "decay") node.decay = value;
    } else if (node instanceof Tone.FeedbackDelay) {
      if (key === "wet") node.wet.value = value;
      if (key === "feedback") node.feedback.value = value;
      if (key === "delayTime") node.delayTime.value = value;
    } else if (node instanceof Tone.EQ3) {
      if (key === "low") node.low.value = value;
      if (key === "mid") node.mid.value = value;
      if (key === "high") node.high.value = value;
    } else if (node instanceof Tone.Compressor) {
      if (key === "threshold") node.threshold.value = value;
      if (key === "ratio") node.ratio.value = value;
      if (key === "attack") node.attack.value = value;
      if (key === "release") node.release.value = value;
      if (key === "knee") node.knee.value = value;
    } else if (node instanceof Tone.Distortion) {
      if (key === "distortion") node.distortion = value;
      if (key === "wet") node.wet.value = value;
    }
  }

  private createEffect(type: EffectSlot["type"], params: Record<string, number>): EffectNode {
    switch (type) {
      case "reverb":
        return new Tone.Reverb({ decay: params["decay"] ?? 1.5, wet: params["wet"] ?? 0.3 });
      case "delay":
        return new Tone.FeedbackDelay({
          delayTime: params["delayTime"] ?? 0.25,
          feedback: params["feedback"] ?? 0.3,
          wet: params["wet"] ?? 0.3,
        });
      case "eq3":
        return new Tone.EQ3({
          low: params["low"] ?? 0,
          mid: params["mid"] ?? 0,
          high: params["high"] ?? 0,
        });
      case "compressor":
        return new Tone.Compressor({
          threshold: params["threshold"] ?? -24,
          ratio: params["ratio"] ?? 4,
          attack: params["attack"] ?? 0.003,
          release: params["release"] ?? 0.25,
          knee: params["knee"] ?? 10,
        });
      case "distortion":
        return new Tone.Distortion({
          distortion: params["distortion"] ?? 0.4,
          wet: params["wet"] ?? 0.3,
        });
    }
  }

  reconnect(): void {
    // Disconnect everything
    try {
      this.input.disconnect();
    } catch (_) {
      /* already disconnected */
    }
    this.slots.forEach((slot) => {
      try {
        slot.node.disconnect();
      } catch (_) {
        /* already disconnected */
      }
    });

    // Build chain from only enabled effects
    const chain: Array<Tone.Channel | EffectNode> = [
      this.input,
      ...this.slots.filter((s) => s.enabled).map((s) => s.node),
      this.output,
    ];

    for (let i = 0; i < chain.length - 1; i++) {
      const from = chain[i]!;
      const to = chain[i + 1]!;
      (from as { connect: (dst: unknown) => void }).connect(to);
    }
  }

  dispose(): void {
    this.slots.forEach((s) => s.node.dispose());
    this.slots = [];
  }
}
