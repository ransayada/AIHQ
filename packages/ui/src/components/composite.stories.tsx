/**
 * Composite stories — show multiple components working together
 * in realistic DAW-like layouts, without importing Tone.js or app-level stores.
 */
import type { Meta } from "@storybook/react";
import { useState } from "react";
import { Button }        from "./button";
import { Knob }          from "./knob";
import { Slider, Fader } from "./slider";
import { Panel }         from "./panel";
import { Avatar }        from "./avatar";
import { DJDeckCard }    from "./dj-deck-card";
import { getTrackColor } from "../tokens/colors";

const meta: Meta = {
  title: "Composite/DAW Layouts",
  parameters: { backgrounds: { default: "dark", values: [{ name: "dark", value: "#0d0d0f" }] } },
};

export default meta;

// ── Mixer Channel Strip ───────────────────────────────────────────────────────
function ChannelStrip({ name, color, index }: { name: string; color: string; index: number }) {
  const [vol, setVol]   = useState(0);     // dB
  const [pan, setPan]   = useState(0.5);   // 0=L, 1=R
  const [muted, setMuted] = useState(false);
  void index;

  return (
    <div
      className="flex flex-col items-center gap-2 p-2 rounded-lg"
      style={{ width: 56, background: "#111115", border: `1px solid ${color}44` }}
    >
      <span style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: "0.05em" }}>
        {name}
      </span>

      {/* Meter placeholder */}
      <div style={{ width: 8, height: 60, background: "#26262f", borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", background: `linear-gradient(to top, ${color}aa, ${color}44)`, borderRadius: 3 }} />
      </div>

      {/* Fader */}
      <Fader value={vol} onChange={setVol} className="h-20" label={name} />

      {/* Pan knob */}
      <Knob
        value={pan}
        onChange={setPan}
        size="sm"
        label="PAN"
        color={color}
        defaultValue={0.5}
      />

      {/* Mute */}
      <Button
        size="xs"
        variant={muted ? "destructive" : "ghost"}
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? "M" : "M"}
      </Button>
    </div>
  );
}

export const MixerView = {
  name: "Mixer — Channel Strips",
  render: () => {
    const channels = ["Kick", "Snare", "HH", "Bass", "Lead", "Pad", "FX", "Vox"];
    return (
      <Panel title="Mixer" className="w-fit p-3">
        <div className="flex gap-2">
          {channels.map((name, i) => (
            <ChannelStrip key={name} name={name} color={getTrackColor(i)} index={i} />
          ))}
        </div>
      </Panel>
    );
  },
};

// ── Synth Preset Bank ─────────────────────────────────────────────────────────
type Bank = "EDM" | "Strings" | "Wind" | "Keys";
const BANKS: Record<Bank, string[]> = {
  EDM:     ["Supersaw", "Sub Bass", "Pluck", "Pad", "Acid", "Bell"],
  Strings: ["Violin", "Viola", "Cello", "Ensemble", "Pizzicato", "Tremolo"],
  Wind:    ["Flute", "Clarinet", "Oboe", "Trumpet", "French Horn", "Alto Sax"],
  Keys:    ["Piano", "E.Piano", "Organ", "Harpsichord", "Marimba", "Vibraphone"],
};
const BANK_COLORS: Record<Bank, string> = {
  EDM:     "#7c4dff",
  Strings: "#f59e0b",
  Wind:    "#00d4ff",
  Keys:    "#00e676",
};

export const InstrumentPresetBanks = {
  name: "Synth — Instrument Preset Banks",
  render: () => {
    const [bank, setBank] = useState<Bank>("EDM");
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <Panel title="Synthesizer" className="w-72 p-3">
        {/* Bank tabs */}
        <div className="flex gap-1 mb-3">
          {(Object.keys(BANKS) as Bank[]).map((b) => (
            <button
              key={b}
              onClick={() => { setBank(b); setSelected(null); }}
              style={{
                padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                letterSpacing: "0.07em", textTransform: "uppercase",
                border: bank === b ? "none" : "1px solid #26262f",
                background: bank === b ? BANK_COLORS[b] : "transparent",
                color: bank === b ? "#000" : "#6b7280",
                cursor: "pointer",
              }}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1">
          {BANKS[bank].map((p) => (
            <button
              key={p}
              onClick={() => setSelected(p)}
              style={{
                padding: "4px 10px", borderRadius: 4, fontSize: 9, fontWeight: 600,
                border: selected === p ? `1px solid ${BANK_COLORS[bank]}` : "1px solid #26262f",
                background: selected === p ? `${BANK_COLORS[bank]}22` : "transparent",
                color: selected === p ? BANK_COLORS[bank] : "#9ca3af",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {selected && (
          <p style={{ marginTop: 12, fontSize: 10, color: "#6b7280" }}>
            Active: <span style={{ color: BANK_COLORS[bank], fontWeight: 600 }}>{selected}</span>
          </p>
        )}
      </Panel>
    );
  },
};

// ── Transport Bar ─────────────────────────────────────────────────────────────
export const TransportBarPreview = {
  name: "Transport Bar",
  render: () => {
    const [playing, setPlaying] = useState(false);
    const [bpm, setBpm]         = useState(128);

    return (
      <div
        className="flex items-center gap-4 px-4"
        style={{ height: 48, background: "#111115", borderRadius: 8, border: "1px solid #1e1e27" }}
      >
        {/* Logo */}
        <span style={{ fontWeight: 700, fontSize: 13, color: "#7c4dff" }}>AI</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#d4d4e0", marginLeft: -6 }}>HQ</span>

        {/* Play / Stop */}
        <Button
          variant={playing ? "transport-active" : "transport"}
          size="icon"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Stop" : "Play"}
        >
          {playing ? "■" : "▶"}
        </Button>

        {/* BPM */}
        <div
          className="flex items-center gap-1 px-2 rounded"
          style={{ background: "#17171d", border: "1px solid #26262f" }}
        >
          <button
            onClick={() => setBpm((b) => Math.max(40, b - 1))}
            style={{ color: "#6b7280", fontSize: 11, background: "none", border: "none", cursor: "pointer" }}
          >
            −
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#d4d4e0", fontFamily: "monospace", width: 36, textAlign: "center" }}>
            {bpm}
          </span>
          <button
            onClick={() => setBpm((b) => Math.min(300, b + 1))}
            style={{ color: "#6b7280", fontSize: 11, background: "none", border: "none", cursor: "pointer" }}
          >
            +
          </button>
        </div>

        {/* Position */}
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#44444f" }}>
          {playing ? "1.2.3" : "1.1.1"}
        </span>

        {/* Collab avatars */}
        <div className="ml-auto flex -space-x-1.5">
          {["Alice", "Bob"].map((n) => (
            <Avatar key={n} name={n} size="xs" showStatus status="online" />
          ))}
        </div>
      </div>
    );
  },
};

// ── Effects Rack ──────────────────────────────────────────────────────────────
export const EffectsRackPreview = {
  name: "Effects Rack",
  render: () => {
    const effects = [
      { name: "Reverb",     color: "#7c4dff", params: ["Decay", "Pre", "Wet"] },
      { name: "Delay",      color: "#00d4ff", params: ["Time", "Fdbk", "Wet"] },
      { name: "EQ",         color: "#00e676", params: ["Low", "Mid", "High"]  },
      { name: "Compressor", color: "#f59e0b", params: ["Thr", "Ratio", "Atk"] },
    ];

    return (
      <Panel title="Effects" className="w-96 p-3">
        <div className="flex flex-col gap-3">
          {effects.map((fx) => {
            const [active, setActive] = useState(true);
            return (
              <div
                key={fx.name}
                className="flex items-center gap-3 p-2 rounded"
                style={{ background: "#0d0d0f", border: `1px solid ${active ? fx.color + "44" : "#1e1e27"}` }}
              >
                <Button
                  size="xs"
                  variant={active ? "default" : "ghost"}
                  onClick={() => setActive((a) => !a)}
                  style={active ? { background: fx.color + "33", color: fx.color, border: `1px solid ${fx.color}66` } : {}}
                >
                  {fx.name}
                </Button>
                <div className="flex gap-2 ml-auto">
                  {fx.params.map((p) => {
                    const [v, setV] = useState(0.4);
                    return (
                      <div key={p} className="flex flex-col items-center gap-1">
                        <Knob value={v} onChange={setV} size="sm" label={p} color={fx.color} defaultValue={0.4} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    );
  },
};

// ── DJ Booth ──────────────────────────────────────────────────────────────────
export const DJBooth = {
  name: "DJ — Full Booth",
  render: () => {
    const [xfader, setXfader] = useState(0.5);
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-4">
          <DJDeckCard deckId="A" fileName="track_a.wav" isLoaded bpm={128} volume={80} />
          <DJDeckCard deckId="B" fileName="track_b.wav" isLoaded isPlaying bpm={132} volume={75} />
        </div>
        {/* Crossfader */}
        <div className="flex items-center gap-3" style={{ width: 360 }}>
          <span style={{ fontSize: 10, color: "#7c4dff", fontWeight: 700 }}>A</span>
          <Slider
            value={xfader}
            onChange={setXfader}
            orientation="horizontal"
            color="#ffffff"
            className="flex-1"
          />
          <span style={{ fontSize: 10, color: "#06b6d4", fontWeight: 700 }}>B</span>
        </div>
        <p style={{ fontSize: 10, color: "#6b7280" }}>
          Crossfader: {xfader < 0.4 ? "← A" : xfader > 0.6 ? "B →" : "Center"}
        </p>
      </div>
    );
  },
};
