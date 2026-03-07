"use client";

import { useDJStore } from "@/stores/djStore";
import { DJDeck } from "./DJDeck";
import type { DeckId } from "@aihq/audio-engine";

// ── Crossfader ─────────────────────────────────────────────────────────────

function Crossfader({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  label:      string;
  value:      number;
  onChange:   (v: number) => void;
  leftLabel:  string;
  rightLabel: string;
}) {
  const pct = value * 100;

  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <span className="text-[9px] font-semibold text-[var(--color-studio-400)] uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-2 w-full">
        <span className="text-[10px] font-bold text-[var(--color-accent-purple)]">{leftLabel}</span>
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 rounded appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right,
                var(--color-accent-purple) 0%,
                var(--color-accent-purple) ${pct}%,
                var(--color-accent-cyan) ${pct}%,
                var(--color-accent-cyan) 100%)`,
            }}
          />
        </div>
        <span className="text-[10px] font-bold text-[var(--color-accent-cyan)]">{rightLabel}</span>
      </div>
      {/* Centre reset */}
      <button
        onClick={() => onChange(0.5)}
        className="text-[9px] text-[var(--color-studio-500)] hover:text-white transition-colors"
      >
        centre
      </button>
    </div>
  );
}

// ── Master section ─────────────────────────────────────────────────────────

function MasterSection() {
  const { masterVolume, setMasterVolume } = useDJStore();
  const pct = masterVolume;

  return (
    <div className="flex flex-col items-center gap-1 px-3">
      <span className="text-[9px] font-semibold text-[var(--color-studio-400)] uppercase tracking-widest">
        MASTER
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={masterVolume}
        onChange={(e) => setMasterVolume(Number(e.target.value))}
        className="w-full h-1.5 rounded appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #10b981 ${pct}%, var(--color-studio-700) ${pct}%)`,
        }}
      />
      <span className="text-[9px] daw-readout text-[var(--color-studio-400)]">
        {masterVolume}%
      </span>
    </div>
  );
}

// ── DJ Mixer ───────────────────────────────────────────────────────────────

const DECKS: DeckId[] = ["A", "B", "C", "D"];

export function DJMixer() {
  const { crossfaderAB, crossfaderCD, setCrossfaderAB, setCrossfaderCD } = useDJStore();

  return (
    <div className="h-full flex flex-col bg-[var(--color-studio-900)] overflow-hidden">
      {/* Decks */}
      <div className="flex-1 grid grid-cols-4 gap-2 p-2 min-h-0 overflow-y-auto">
        {DECKS.map((id) => (
          <DJDeck key={id} deckId={id} />
        ))}
      </div>

      {/* Bottom bar: crossfaders + master */}
      <div
        className="flex-shrink-0 border-t border-[var(--color-studio-700)] bg-[var(--color-studio-850)] flex items-center px-2 py-2 gap-4"
        style={{ background: "var(--color-studio-800)" }}
      >
        {/* A-B crossfader */}
        <div className="flex-1">
          <Crossfader
            label="X-FADE A/B"
            value={crossfaderAB}
            onChange={setCrossfaderAB}
            leftLabel="A"
            rightLabel="B"
          />
        </div>

        {/* Master */}
        <div className="w-28">
          <MasterSection />
        </div>

        {/* C-D crossfader */}
        <div className="flex-1">
          <Crossfader
            label="X-FADE C/D"
            value={crossfaderCD}
            onChange={setCrossfaderCD}
            leftLabel="C"
            rightLabel="D"
          />
        </div>
      </div>
    </div>
  );
}
