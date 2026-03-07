"use client";
import { useEffect, useState } from "react";
import { useMIDIStore } from "@/stores/midiStore";
import { Wifi, WifiOff, Plus, Trash2, Zap } from "lucide-react";

// We lazy-import MIDIManager only on client (it's browser-only)
async function getMIDIManager() {
  const mod = await import("@aihq/audio-engine");
  return (mod as unknown as { midiManager: import("@aihq/audio-engine").MIDIManagerClass }).midiManager;
}

const PRESET_TARGETS = [
  { label: "Transport BPM",     value: "transport:bpm",     min: 60,  max: 200 },
  { label: "Master Volume",     value: "master:volume",     min: 0,   max: 100 },
  { label: "Track 1 Volume",    value: "track:1:volume",    min: 0,   max: 100 },
  { label: "Track 1 Pan",       value: "track:1:pan",       min: -1,  max: 1   },
  { label: "Track 2 Volume",    value: "track:2:volume",    min: 0,   max: 100 },
  { label: "FX Reverb Wet",     value: "fx:reverb:wet",     min: 0,   max: 1   },
  { label: "FX Delay Wet",      value: "fx:delay:wet",      min: 0,   max: 1   },
  { label: "Filter Cutoff",     value: "fx:filter:cutoff",  min: 200, max: 20000 },
];

export function MIDIPanel() {
  const {
    status, deviceNames, mappings, learningId,
    setStatus, setDeviceNames, addMapping, removeMapping, startLearn, commitLearn, cancelLearn, setEnabled,
  } = useMIDIStore();

  const [initialized, setInitialized] = useState(false);

  async function initMIDI() {
    const manager = await getMIDIManager();
    if (!manager) return;

    const ok = await manager.init();
    setStatus(ok ? "granted" : "denied");
    setEnabled(ok);
    setInitialized(ok);

    manager.onStatus((s) => setStatus(s as Parameters<typeof setStatus>[0]));
    manager.onDevices((devs) => setDeviceNames(devs.filter((d) => d.type === "input").map((d) => d.name)));
  }

  // Register all mappings with MIDIManager when they change
  useEffect(() => {
    if (!initialized) return;
    getMIDIManager().then((manager) => {
      if (!manager) return;
      for (const m of mappings) {
        manager.registerMapping({
          id:      m.id,
          label:   m.label,
          channel: m.channel,
          cc:      m.cc,
          min:     m.min,
          max:     m.max,
          onValue: (v) => {
            // Dispatch to the correct target
            window.dispatchEvent(new CustomEvent("midi:cc", { detail: { target: m.target, value: v } }));
          },
        });
      }
    });
  }, [mappings, initialized]);

  function handleAddMapping() {
    const preset = PRESET_TARGETS[0]!;
    addMapping({ label: preset.label, channel: 0, cc: 1, min: preset.min, max: preset.max, target: preset.value });
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-studio-900)] text-white text-xs">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-studio-700)]">
        <Wifi className="w-4 h-4 text-[var(--color-accent-purple)]" />
        <span className="text-sm font-semibold flex-1">MIDI Controller</span>
        {status !== "granted" ? (
          <button
            onClick={initMIDI}
            className="px-3 py-1 rounded-lg bg-[var(--color-accent-purple)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
          >
            Connect
          </button>
        ) : (
          <span className="flex items-center gap-1 text-green-400 font-medium">
            <Wifi className="w-3 h-3" /> Active
          </span>
        )}
      </div>

      {/* Device list */}
      <div className="px-4 py-2 border-b border-[var(--color-studio-700)]">
        <p className="text-[10px] text-[var(--color-studio-400)] uppercase tracking-widest mb-1">Inputs</p>
        {deviceNames.length === 0 ? (
          <p className="text-[var(--color-studio-500)] italic">
            {status === "granted" ? "No MIDI devices found" : "Connect a MIDI device and click Connect"}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {deviceNames.map((name) => (
              <li key={name} className="flex items-center gap-2 text-[var(--color-studio-200)]">
                <WifiOff className="w-2.5 h-2.5 text-green-400" />
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mappings */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-studio-700)]">
        <p className="text-[10px] text-[var(--color-studio-400)] uppercase tracking-widest">CC Mappings</p>
        <button
          onClick={handleAddMapping}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-studio-700)] text-[var(--color-accent-purple)] hover:bg-[var(--color-studio-600)] transition-colors"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {mappings.length === 0 ? (
          <p className="text-center text-[var(--color-studio-500)] py-6 italic">
            No mappings yet. Click &quot;Add&quot; to map a CC to a parameter.
          </p>
        ) : (
          mappings.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-2.5 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <select
                  value={m.target}
                  onChange={(e) => {
                    const preset = PRESET_TARGETS.find((p) => p.value === e.target.value);
                    if (preset?.value) useMIDIStore.getState().updateMapping(m.id, { target: preset.value, label: preset.label, min: preset.min ?? 0, max: preset.max ?? 127 });
                  }}
                  className="flex-1 bg-[var(--color-studio-700)] border border-[var(--color-studio-600)] rounded px-1.5 py-1 text-[10px] text-white focus:outline-none"
                >
                  {PRESET_TARGETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <button
                  onClick={() => removeMapping(m.id)}
                  className="p-1 rounded text-[var(--color-studio-400)] hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[var(--color-studio-400)] w-14">Ch: {m.channel === 0 ? "Any" : m.channel}</span>
                <span className="text-[var(--color-studio-400)] flex-1">CC: {m.cc}</span>
                <button
                  onClick={() => learningId === m.id ? cancelLearn() : startLearn(m.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    learningId === m.id
                      ? "bg-[var(--color-accent-purple)] text-white animate-pulse"
                      : "bg-[var(--color-studio-700)] text-[var(--color-accent-purple)] hover:bg-[var(--color-studio-600)]"
                  }`}
                >
                  <Zap className="w-2.5 h-2.5" />
                  {learningId === m.id ? "Move a knob…" : "Learn"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
