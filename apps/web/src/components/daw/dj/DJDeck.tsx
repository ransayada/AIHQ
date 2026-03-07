"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Square, SkipBack, Upload, RotateCcw, Loader2,
} from "lucide-react";
import { cn } from "@aihq/ui";
import { djEngine } from "@aihq/audio-engine";
import type { DeckId } from "@aihq/audio-engine";
import { useDJStore } from "@/stores/djStore";
import type { DeckState } from "@/stores/djStore";

// ── Colour accent per deck ─────────────────────────────────────────────────

const DECK_COLORS: Record<DeckId, string> = {
  A: "var(--color-accent-purple)",
  B: "var(--color-accent-cyan)",
  C: "#f59e0b",
  D: "#10b981",
};

// ── Waveform canvas ────────────────────────────────────────────────────────

function Waveform({ deckId, color }: { deckId: DeckId; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let data: Float32Array;
      try {
        data = djEngine.getDeck(deckId).getWaveformData();
      } catch {
        data = new Float32Array(128);
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, width, height);

      // Centre line
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const step = width / data.length;
      for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const y = ((data[i]! + 1) / 2) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [deckId, color]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={40}
      className="w-full h-10 rounded"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ── Small knob (labelled range slider) ────────────────────────────────────

function Knob({
  label, value, min, max, step = 0.01, onChange, color, format,
}: {
  label:    string;
  value:    number;
  min:      number;
  max:      number;
  step?:    number;
  onChange: (v: number) => void;
  color?:   string;
  format?:  (v: number) => string;
}) {
  const pct  = ((value - min) / (max - min)) * 100;
  const text = format ? format(value) : value.toFixed(2);

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <span className="text-[9px] font-medium text-[var(--color-studio-400)] uppercase tracking-wider truncate w-full text-center">
        {label}
      </span>
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 rounded appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color ?? "var(--color-accent-purple)"} ${pct}%, var(--color-studio-700) ${pct}%)`,
          }}
        />
      </div>
      <span className="text-[9px] daw-readout text-[var(--color-studio-400)]">
        {text}
      </span>
    </div>
  );
}

// ── DJ Deck ────────────────────────────────────────────────────────────────

export function DJDeck({ deckId }: { deckId: DeckId }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const store   = useDJStore();
  const deck: DeckState = store.decks[deckId];
  const color   = DECK_COLORS[deckId];

  // File load handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void store.loadTrack(deckId, file);
      e.target.value = "";
    },
    [deckId, store]
  );

  return (
    <div
      className="flex flex-col gap-1.5 p-2 rounded-xl border bg-[var(--color-studio-900)] min-w-0"
      style={{ borderColor: `${color}44` }}
    >
      {/* ── Deck header ── */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: color, color: "#fff" }}
        >
          {deckId}
        </span>
        <span className="text-[11px] text-[var(--color-studio-300)] truncate flex-1 min-w-0">
          {deck.fileName ?? "No track loaded"}
        </span>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={deck.isLoading}
          className="flex-shrink-0 p-1 rounded text-[var(--color-studio-400)] hover:text-white transition-colors disabled:opacity-50"
          title="Load audio file"
        >
          {deck.isLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Upload className="w-3.5 h-3.5" />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* ── Waveform ── */}
      <Waveform deckId={deckId} color={color} />

      {/* ── Transport ── */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => store.cue(deckId)}
          disabled={!deck.isLoaded}
          className="flex items-center justify-center w-7 h-7 rounded text-[var(--color-studio-400)] hover:text-white disabled:opacity-30 transition-colors border border-[var(--color-studio-700)] hover:border-[var(--color-studio-500)] text-[9px] font-bold"
          title="Cue (jump to start)"
        >
          <SkipBack className="w-3 h-3" />
        </button>

        <button
          onClick={() => deck.isPlaying ? store.pause(deckId) : store.play(deckId)}
          disabled={!deck.isLoaded}
          className={cn(
            "flex items-center justify-center w-8 h-7 rounded font-bold transition-colors disabled:opacity-30 border",
            deck.isPlaying
              ? "border-[var(--color-accent-purple)] text-[var(--color-accent-purple)]"
              : "border-[var(--color-studio-700)] text-[var(--color-studio-400)] hover:text-white"
          )}
          title={deck.isPlaying ? "Pause" : "Play"}
        >
          {deck.isPlaying
            ? <Pause className="w-3.5 h-3.5" />
            : <Play  className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => store.stop(deckId)}
          disabled={!deck.isLoaded}
          className="flex items-center justify-center w-7 h-7 rounded text-[var(--color-studio-400)] hover:text-red-400 disabled:opacity-30 transition-colors border border-[var(--color-studio-700)]"
          title="Stop"
        >
          <Square className="w-3 h-3" />
        </button>

        {/* Loop toggle */}
        <button
          onClick={() => store.setLoop(deckId, !deck.loop)}
          disabled={!deck.isLoaded}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded transition-colors border disabled:opacity-30",
            deck.loop
              ? "border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]"
              : "border-[var(--color-studio-700)] text-[var(--color-studio-400)] hover:text-white"
          )}
          title="Loop"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        {/* BPM */}
        <div className="ml-auto flex flex-col items-end">
          <input
            type="number"
            value={deck.bpm}
            min={60}
            max={200}
            onChange={(e) => store.setBpm(deckId, Number(e.target.value))}
            className="w-12 text-[10px] text-right daw-readout bg-transparent border border-[var(--color-studio-700)] rounded px-1 focus:outline-none focus:border-[var(--color-studio-500)]"
            title="Base BPM"
          />
          <span className="text-[8px] text-[var(--color-studio-500)]">BPM</span>
        </div>
      </div>

      {/* ── Volume & Rate sliders ── */}
      <div className="grid grid-cols-2 gap-1.5">
        <Knob
          label="VOL"
          value={deck.volume}
          min={0}
          max={100}
          step={1}
          onChange={(v) => store.setVolume(deckId, v)}
          color={color}
          format={(v) => `${Math.round(v)}%`}
        />
        <Knob
          label="RATE"
          value={deck.playbackRate}
          min={0.5}
          max={2.0}
          step={0.01}
          onChange={(v) => store.setPlaybackRate(deckId, v)}
          color={color}
          format={(v) => `${v.toFixed(2)}×`}
        />
      </div>

      {/* ── 3-Band EQ ── */}
      <div className="border-t border-[var(--color-studio-800)] pt-1.5">
        <p className="text-[9px] font-semibold text-[var(--color-studio-500)] uppercase tracking-widest mb-1">
          EQ
        </p>
        <div className="grid grid-cols-3 gap-1">
          {(["low", "mid", "high"] as const).map((band) => (
            <Knob
              key={band}
              label={band.toUpperCase()}
              value={deck.eq[band]}
              min={-15}
              max={6}
              step={0.5}
              onChange={(v) => store.setEQ(deckId, band, v)}
              color={color}
              format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}dB`}
            />
          ))}
        </div>
      </div>

      {/* ── Effects ── */}
      <div className="border-t border-[var(--color-studio-800)] pt-1.5">
        <p className="text-[9px] font-semibold text-[var(--color-studio-500)] uppercase tracking-widest mb-1">
          FX
        </p>
        <div className="grid grid-cols-3 gap-1">
          <Knob
            label="FILTER"
            value={deck.filter}
            min={0}
            max={1}
            onChange={(v) => store.setFilter(deckId, v)}
            color="#f59e0b"
            format={(v) => v < 0.5 ? "LP" : v > 0.5 ? "HP" : "FLAT"}
          />
          <Knob
            label="REVERB"
            value={deck.reverb}
            min={0}
            max={1}
            onChange={(v) => store.setReverb(deckId, v)}
            color="#06b6d4"
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Knob
            label="DELAY"
            value={deck.delay}
            min={0}
            max={1}
            onChange={(v) => store.setDelay(deckId, v)}
            color="#10b981"
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
}
