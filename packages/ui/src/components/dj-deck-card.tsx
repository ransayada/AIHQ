/**
 * DJDeckCard — pure visual component used in Storybook.
 * No audio-engine dependency; all state passed as props.
 */
import * as React from "react";
// cn is not needed in this component — removed

export type DeckId = "A" | "B" | "C" | "D";

export interface DJDeckCardProps {
  deckId:       DeckId;
  fileName?:    string;
  isLoaded?:    boolean;
  isPlaying?:   boolean;
  isLoading?:   boolean;
  volume?:      number;   // 0-100
  playbackRate?: number;  // 0.5-2.0
  bpm?:         number;
  eqLow?:       number;   // -15 to +6 dB
  eqMid?:       number;
  eqHigh?:      number;
  filter?:      number;   // 0-1
  reverb?:      number;   // 0-1
  delay?:       number;   // 0-1
  loop?:        boolean;
  onPlay?:      () => void;
  onPause?:     () => void;
  onStop?:      () => void;
  onCue?:       () => void;
  onLoadClick?: () => void;
}

const DECK_COLORS: Record<DeckId, string> = {
  A: "#7c3aed",
  B: "#06b6d4",
  C: "#f59e0b",
  D: "#10b981",
};

function KnobRow({
  items,
}: {
  items: Array<{ label: string; value: number; min: number; max: number; color: string; format?: (v: number) => string }>;
}) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map(({ label, value, min, max, color, format }) => {
        const pct = ((value - min) / (max - min)) * 100;
        const text = format ? format(value) : value.toFixed(1);
        return (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {label}
            </span>
            <div
              style={{
                width: "100%",
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(to right, ${color} ${pct}%, #374151 ${pct}%)`,
              }}
            />
            <span style={{ fontSize: 9, color: "#9ca3af" }}>{text}</span>
          </div>
        );
      })}
    </div>
  );
}

// Simple waveform placeholder
function WaveformPlaceholder({ color, isPlaying }: { color: string; isPlaying: boolean }) {
  const bars = Array.from({ length: 32 }, (_, i) => {
    const h = 20 + Math.sin(i * 0.8) * 14 + Math.sin(i * 2.1) * 8;
    return Math.max(4, h);
  });

  return (
    <div
      className="flex items-center justify-center gap-px rounded overflow-hidden"
      style={{ height: 40, background: "rgba(0,0,0,0.5)" }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            background: isPlaying ? color : "#374151",
            borderRadius: 1,
            opacity: isPlaying ? 0.8 + Math.sin(i * 0.5) * 0.2 : 0.4,
            transition: "height 0.1s ease",
          }}
        />
      ))}
    </div>
  );
}

export function DJDeckCard({
  deckId,
  fileName,
  isLoaded   = false,
  isPlaying  = false,
  isLoading  = false,
  volume     = 80,
  playbackRate = 1.0,
  bpm        = 128,
  eqLow      = 0,
  eqMid      = 0,
  eqHigh     = 0,
  filter     = 1,
  reverb     = 0,
  delay      = 0,
  loop       = false,
  onPlay,
  onPause,
  onStop,
  onCue,
  onLoadClick,
}: DJDeckCardProps) {
  const color = DECK_COLORS[deckId];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        borderRadius: 12,
        border: `1px solid ${color}44`,
        background: "#0f0f17",
        minWidth: 160,
        fontFamily: "monospace",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontSize: 11, fontWeight: 700, padding: "2px 6px",
            borderRadius: 4, background: color, color: "#fff",
          }}
        >
          {deckId}
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {fileName ?? "No track loaded"}
        </span>
        <button
          onClick={onLoadClick}
          style={{
            fontSize: 9, padding: "2px 6px", borderRadius: 4,
            background: "transparent", border: "1px solid #374151",
            color: "#9ca3af", cursor: "pointer",
          }}
        >
          {isLoading ? "…" : "LOAD"}
        </button>
      </div>

      {/* Waveform */}
      <WaveformPlaceholder color={color} isPlaying={isPlaying} />

      {/* Transport */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[
          { label: "CUE", fn: onCue,  disabled: !isLoaded },
          { label: isPlaying ? "⏸" : "▶",  fn: isPlaying ? onPause : onPlay, disabled: !isLoaded, active: isPlaying },
          { label: "■",  fn: onStop, disabled: !isLoaded },
        ].map(({ label, fn, disabled, active }) => (
          <button
            key={label}
            onClick={fn}
            disabled={disabled}
            style={{
              padding: "3px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700,
              border: `1px solid ${active ? color : "#374151"}`,
              color:  active ? color : "#9ca3af",
              background: "transparent", cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.3 : 1,
            }}
          >
            {label}
          </button>
        ))}

        <button
          style={{
            padding: "3px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700,
            border: `1px solid ${loop ? "#06b6d4" : "#374151"}`,
            color: loop ? "#06b6d4" : "#9ca3af",
            background: "transparent", cursor: "pointer",
          }}
        >
          ↺
        </button>

        <span style={{ marginLeft: "auto", fontSize: 10, color: "#6b7280" }}>
          {bpm} BPM
        </span>
      </div>

      {/* Volume + Rate */}
      <KnobRow
        items={[
          { label: "VOL",  value: volume,       min: 0,   max: 100, color,      format: (v) => `${Math.round(v)}%` },
          { label: "RATE", value: playbackRate, min: 0.5, max: 2.0, color,      format: (v) => `${v.toFixed(2)}×` },
        ]}
      />

      {/* EQ */}
      <div>
        <p style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>EQ</p>
        <KnobRow
          items={[
            { label: "L",  value: eqLow,  min: -15, max: 6, color, format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}` },
            { label: "M",  value: eqMid,  min: -15, max: 6, color, format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}` },
            { label: "H",  value: eqHigh, min: -15, max: 6, color, format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}` },
          ]}
        />
      </div>

      {/* FX */}
      <div>
        <p style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>FX</p>
        <KnobRow
          items={[
            { label: "FILT",  value: filter, min: 0, max: 1, color: "#f59e0b", format: (v) => v < 0.5 ? "LP" : v > 0.5 ? "HP" : "—" },
            { label: "REVERB", value: reverb, min: 0, max: 1, color: "#06b6d4", format: (v) => `${Math.round(v * 100)}%` },
            { label: "DELAY",  value: delay,  min: 0, max: 1, color: "#10b981", format: (v) => `${Math.round(v * 100)}%` },
          ]}
        />
      </div>
    </div>
  );
}
