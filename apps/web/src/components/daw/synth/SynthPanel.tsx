"use client";

import * as React from "react";
import { Knob, cn } from "@aihq/ui";
import { useTracksStore } from "@/stores/tracksStore";
import { getSynthInstrument } from "@/hooks/useAudioSync";
import { audioEngine } from "@aihq/audio-engine";
import type { SynthPreset } from "@aihq/shared";

const DEFAULT_PRESET: SynthPreset = {
  oscillator: { type: "sawtooth", detune: 0, count: 1 },
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 },
  filter: { type: "lowpass", frequency: 2000, rolloff: -24, Q: 1, envelopeAmount: 0 },
};

const OSC_TYPES: SynthPreset["oscillator"]["type"][] = [
  "sine",
  "triangle",
  "sawtooth",
  "square",
  "fatsawtooth",
];

const EDM_PRESETS: Array<{ name: string; preset: SynthPreset }> = [
  {
    name: "Supersaw",
    preset: {
      oscillator: { type: "fatsawtooth", detune: 25, count: 7 },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.8 },
      filter: { type: "lowpass", frequency: 8000, rolloff: -24, Q: 2, envelopeAmount: 0 },
    },
  },
  {
    name: "Sub Bass",
    preset: {
      oscillator: { type: "sine", detune: 0, count: 1 },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.9, release: 0.3 },
      filter: { type: "lowpass", frequency: 300, rolloff: -24, Q: 1, envelopeAmount: 0 },
    },
  },
  {
    name: "Pluck",
    preset: {
      oscillator: { type: "sawtooth", detune: 0, count: 1 },
      envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.4 },
      filter: { type: "lowpass", frequency: 3500, rolloff: -24, Q: 4, envelopeAmount: 0 },
    },
  },
  {
    name: "Pad",
    preset: {
      oscillator: { type: "fatsawtooth", detune: 15, count: 3 },
      envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.5 },
      filter: { type: "lowpass", frequency: 5000, rolloff: -12, Q: 1, envelopeAmount: 0 },
    },
  },
  {
    name: "Acid",
    preset: {
      oscillator: { type: "square", detune: 0, count: 1 },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.15 },
      filter: { type: "bandpass", frequency: 1000, rolloff: -24, Q: 10, envelopeAmount: 0 },
    },
  },
  {
    name: "Bell",
    preset: {
      oscillator: { type: "triangle", detune: 0, count: 1 },
      envelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 1.2 },
      filter: { type: "lowpass", frequency: 12000, rolloff: -12, Q: 1, envelopeAmount: 0 },
    },
  },
];

const FILTER_TYPES: SynthPreset["filter"]["type"][] = [
  "lowpass",
  "highpass",
  "bandpass",
  "notch",
];

// --- Mini piano keyboard for note preview ---
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11]; // semitones in octave
const BLACK_KEY_OFFSETS: Record<number, number> = { 1: 0.6, 3: 1.6, 6: 3.6, 8: 4.6, 10: 5.6 };

function MiniPiano({ octave, onNoteOn, onNoteOff }: {
  octave: number;
  onNoteOn: (midi: number) => void;
  onNoteOff: (midi: number) => void;
}) {
  const base = octave * 12 + 12; // MIDI base for octave

  return (
    <div className="relative select-none" style={{ height: 52, width: 7 * 24 }}>
      {/* White keys */}
      {WHITE_KEYS.map((semi, i) => {
        const midi = base + semi;
        return (
          <button
            key={midi}
            onPointerDown={() => onNoteOn(midi)}
            onPointerUp={() => onNoteOff(midi)}
            onPointerLeave={() => onNoteOff(midi)}
            className="absolute top-0 border border-[var(--color-studio-600)] rounded-b-sm bg-white hover:bg-[#e8e8e8] active:bg-[#d0d0d0] transition-colors"
            style={{ left: i * 24, width: 23, height: 52, zIndex: 1 }}
          />
        );
      })}
      {/* Black keys */}
      {Object.entries(BLACK_KEY_OFFSETS).map(([semi, offset]) => {
        const midi = base + Number(semi);
        return (
          <button
            key={midi}
            onPointerDown={() => onNoteOn(midi)}
            onPointerUp={() => onNoteOff(midi)}
            onPointerLeave={() => onNoteOff(midi)}
            className="absolute top-0 rounded-b-sm bg-[#1a1a1a] hover:bg-[#333] active:bg-[#555] transition-colors"
            style={{ left: offset * 24 + 2, width: 14, height: 32, zIndex: 2 }}
          />
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--color-studio-400)]">
        {title}
      </p>
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
    </div>
  );
}

function KnobField({ label, value, min, max, onChange, decimals = 2 }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  decimals?: number;
}) {
  const norm = (value - min) / (max - min);
  return (
    <div className="flex flex-col items-center gap-1">
      <Knob
        value={norm}
        onChange={(n) => onChange(min + n * (max - min))}
        size="sm"
        color="var(--color-accent-purple)"
        defaultValue={norm}
      />
      <span className="text-[8px] text-[var(--color-studio-300)] tabular-nums">{value.toFixed(decimals)}</span>
      <span className="text-[7px] text-[var(--color-studio-500)] uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function SynthPanel() {
  const { tracks, selectedTrackId, setSynthPreset } = useTracksStore();
  const [octave, setOctave] = React.useState(4);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId && t.type === "synth");
  const preset: SynthPreset = selectedTrack?.synthPreset ?? DEFAULT_PRESET;

  if (!selectedTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--color-studio-400)] select-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
        <p className="text-sm">Select a synth track to edit</p>
        <p className="text-xs text-[var(--color-studio-500)]">Add a synth track from the session view</p>
      </div>
    );
  }

  function update(patch: Partial<SynthPreset> | ((p: SynthPreset) => SynthPreset)) {
    const next = typeof patch === "function" ? patch(preset) : { ...preset, ...patch };
    setSynthPreset(selectedTrack!.id, next);
  }

  function handleNoteOn(midi: number) {
    audioEngine.initialize().then(() => {
      getSynthInstrument(selectedTrack!.id)?.noteOn(midi, 100);
    });
  }

  function handleNoteOff(midi: number) {
    getSynthInstrument(selectedTrack!.id)?.noteOff(midi);
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-studio-800)] p-4 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-sm font-semibold text-white">{selectedTrack.name}</p>
          <p className="text-[10px] text-[var(--color-studio-400)]">Synthesizer</p>
        </div>
        {/* Mini piano */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOctave((o) => Math.max(1, o - 1))}
              className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--color-studio-600)] text-[var(--color-studio-300)] hover:text-white"
            >
              ◂
            </button>
            <span className="text-[9px] text-[var(--color-studio-400)] w-6 text-center tabular-nums">
              C{octave}
            </span>
            <button
              onClick={() => setOctave((o) => Math.min(7, o + 1))}
              className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--color-studio-600)] text-[var(--color-studio-300)] hover:text-white"
            >
              ▸
            </button>
          </div>
          <MiniPiano octave={octave} onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
        </div>
      </div>

      {/* EDM Presets */}
      <Section title="Presets">
        <div className="flex gap-1 flex-wrap">
          {EDM_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => update(p.preset)}
              className="px-2.5 py-1 rounded text-[9px] font-semibold transition-colors border border-[var(--color-studio-600)] text-[var(--color-studio-300)] hover:text-white hover:border-[var(--color-accent-purple)] hover:bg-[var(--color-studio-700)]"
            >
              {p.name}
            </button>
          ))}
        </div>
      </Section>

      {/* Oscillator */}
      <Section title="Oscillator">
        <div className="flex flex-col gap-1">
          <p className="text-[8px] text-[var(--color-studio-500)] uppercase tracking-wider">Type</p>
          <div className="flex gap-1 flex-wrap">
            {OSC_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => update((p) => ({ ...p, oscillator: { ...p.oscillator, type: t } }))}
                className={cn(
                  "px-2 py-1 rounded text-[9px] font-medium transition-colors border",
                  preset.oscillator.type === t
                    ? "bg-[var(--color-accent-purple)] border-[var(--color-accent-purple)] text-white"
                    : "border-[var(--color-studio-600)] text-[var(--color-studio-300)] hover:text-white hover:border-[var(--color-studio-400)]"
                )}
              >
                {t === "fatsawtooth" ? "fat saw" : t}
              </button>
            ))}
          </div>
        </div>
        <KnobField
          label="detune"
          value={preset.oscillator.detune}
          min={-100}
          max={100}
          onChange={(v) => update((p) => ({ ...p, oscillator: { ...p.oscillator, detune: Math.round(v) } }))}
          decimals={0}
        />
        <KnobField
          label="voices"
          value={preset.oscillator.count}
          min={1}
          max={8}
          onChange={(v) => update((p) => ({ ...p, oscillator: { ...p.oscillator, count: Math.round(v) } }))}
          decimals={0}
        />
      </Section>

      {/* Envelope */}
      <Section title="Envelope — ADSR">
        <KnobField
          label="attack"
          value={preset.envelope.attack}
          min={0.001}
          max={2}
          onChange={(v) => update((p) => ({ ...p, envelope: { ...p.envelope, attack: v } }))}
        />
        <KnobField
          label="decay"
          value={preset.envelope.decay}
          min={0.001}
          max={2}
          onChange={(v) => update((p) => ({ ...p, envelope: { ...p.envelope, decay: v } }))}
        />
        <KnobField
          label="sustain"
          value={preset.envelope.sustain}
          min={0}
          max={1}
          onChange={(v) => update((p) => ({ ...p, envelope: { ...p.envelope, sustain: v } }))}
        />
        <KnobField
          label="release"
          value={preset.envelope.release}
          min={0.001}
          max={5}
          onChange={(v) => update((p) => ({ ...p, envelope: { ...p.envelope, release: v } }))}
        />
      </Section>

      {/* Filter */}
      <Section title="Filter">
        <div className="flex flex-col gap-1">
          <p className="text-[8px] text-[var(--color-studio-500)] uppercase tracking-wider">Type</p>
          <div className="flex gap-1 flex-wrap">
            {FILTER_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => update((p) => ({ ...p, filter: { ...p.filter, type: t } }))}
                className={cn(
                  "px-2 py-1 rounded text-[9px] font-medium transition-colors border",
                  preset.filter.type === t
                    ? "bg-[var(--color-accent-cyan)] border-[var(--color-accent-cyan)] text-black"
                    : "border-[var(--color-studio-600)] text-[var(--color-studio-300)] hover:text-white hover:border-[var(--color-studio-400)]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <KnobField
          label="freq"
          value={preset.filter.frequency}
          min={20}
          max={20000}
          onChange={(v) => update((p) => ({ ...p, filter: { ...p.filter, frequency: Math.round(v) } }))}
          decimals={0}
        />
        <KnobField
          label="Q"
          value={preset.filter.Q}
          min={0.1}
          max={20}
          onChange={(v) => update((p) => ({ ...p, filter: { ...p.filter, Q: v } }))}
        />
        <KnobField
          label="env amt"
          value={preset.filter.envelopeAmount}
          min={0}
          max={1}
          onChange={(v) => update((p) => ({ ...p, filter: { ...p.filter, envelopeAmount: v } }))}
        />
      </Section>
    </div>
  );
}
