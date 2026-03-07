/**
 * MIDIManager — wraps the Web MIDI API.
 *
 * - Detects connected MIDI devices.
 * - Listens for CC (control change) and note messages.
 * - Routes CC values to registered parameter handlers.
 * - Supports "learn mode": the next incoming CC is captured and mapped.
 */

export interface MIDIDevice {
  id:           string;
  name:         string;
  manufacturer: string;
  type:         "input" | "output";
}

export interface MIDIMapping {
  id:        string;
  label:     string;
  channel:   number; // 0 = any
  cc:        number;
  min:       number;
  max:       number;
  onValue:   (value: number) => void;
}

export type MIDIStatus = "unavailable" | "prompt" | "granted" | "denied";

class MIDIManagerClass {
  private access:   MIDIAccess | null = null;
  private mappings: Map<string, MIDIMapping> = new Map();
  private learnTarget: string | null = null;
  private statusListeners: Array<(s: MIDIStatus) => void> = [];
  private deviceListeners: Array<(d: MIDIDevice[]) => void> = [];

  status: MIDIStatus = "unavailable";
  devices: MIDIDevice[] = [];

  /** Request MIDI access. Returns false if Web MIDI is unavailable. */
  async init(): Promise<boolean> {
    if (!navigator.requestMIDIAccess) {
      this.status = "unavailable";
      this.notifyStatus();
      return false;
    }
    this.status = "prompt";
    this.notifyStatus();

    try {
      this.access = await navigator.requestMIDIAccess({ sysex: false });
      this.status = "granted";
      this.notifyStatus();
      this.refresh();
      this.access.onstatechange = () => this.refresh();
      return true;
    } catch {
      this.status = "denied";
      this.notifyStatus();
      return false;
    }
  }

  private refresh() {
    if (!this.access) return;
    const devs: MIDIDevice[] = [];

    this.access.inputs.forEach((port) => {
      devs.push({ id: port.id, name: port.name ?? "MIDI Input", manufacturer: port.manufacturer ?? "", type: "input" });
      port.onmidimessage = (evt) => this.handleMessage(evt);
    });

    this.access.outputs.forEach((port) => {
      devs.push({ id: port.id, name: port.name ?? "MIDI Output", manufacturer: port.manufacturer ?? "", type: "output" });
    });

    this.devices = devs;
    this.notifyDevices();
  }

  private handleMessage(evt: MIDIMessageEvent) {
    const data = evt.data;
    if (!data || data.length < 3) return;

    const status  = (data[0]! & 0xf0);
    const channel = ((data[0]! & 0x0f)) + 1;
    const byte1   = data[1]!;
    const byte2   = data[2]!;

    // CC message
    if (status === 0xb0) {
      const cc    = byte1 as number;
      const raw   = byte2 as number;

      // Learn mode: capture next CC
      if (this.learnTarget !== null) {
        const mapping = this.mappings.get(this.learnTarget);
        if (mapping) {
          mapping.channel = channel;
          mapping.cc      = cc;
        }
        this.learnTarget = null;
        this.notifyDevices(); // trigger UI refresh
        return;
      }

      // Route to registered handlers
      for (const mapping of this.mappings.values()) {
        const chanMatch = mapping.channel === 0 || mapping.channel === channel;
        if (chanMatch && mapping.cc === cc) {
          const norm  = raw / 127;
          const value = mapping.min + norm * (mapping.max - mapping.min);
          mapping.onValue(value);
        }
      }
    }

    // Note On (can be used for performance pads)
    if (status === 0x90 && (byte2 as number) > 0) {
      // Emit as a custom event so the performance view can listen
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("midi:noteon", { detail: { channel, note: byte1, velocity: byte2 } }));
      }
    }
  }

  /** Register a parameter to receive CC values. */
  registerMapping(mapping: MIDIMapping) {
    this.mappings.set(mapping.id, mapping);
  }

  unregisterMapping(id: string) {
    this.mappings.delete(id);
  }

  getMapping(id: string): MIDIMapping | undefined {
    return this.mappings.get(id);
  }

  getAllMappings(): MIDIMapping[] {
    return Array.from(this.mappings.values());
  }

  /** Activate learn mode — next incoming CC will be assigned to this mapping id. */
  startLearn(mappingId: string) {
    this.learnTarget = mappingId;
  }

  cancelLearn() {
    this.learnTarget = null;
  }

  get learningId(): string | null { return this.learnTarget; }

  onStatus(fn: (s: MIDIStatus) => void)         { this.statusListeners.push(fn); }
  onDevices(fn: (d: MIDIDevice[]) => void)       { this.deviceListeners.push(fn); }
  offStatus(fn: (s: MIDIStatus) => void)         { this.statusListeners = this.statusListeners.filter((l) => l !== fn); }
  offDevices(fn: (d: MIDIDevice[]) => void)      { this.deviceListeners = this.deviceListeners.filter((l) => l !== fn); }

  private notifyStatus() { this.statusListeners.forEach((fn) => fn(this.status)); }
  private notifyDevices() { this.deviceListeners.forEach((fn) => fn(this.devices)); }
}

// Singleton
export const midiManager = typeof window !== "undefined" ? new MIDIManagerClass() : null!;
export type { MIDIManagerClass };
