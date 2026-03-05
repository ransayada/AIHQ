"use client";

import * as React from "react";
import { NoteGrid } from "./NoteGrid";
import { useTracksStore } from "@/stores/tracksStore";
import { audioEngine, noteNumberToName, isBlackKey, getSynthInstrument, ensureTrackRegistered } from "@aihq/audio-engine";
import { cn } from "@aihq/ui";

const PIXELS_PER_BEAT = 80;
const PIXELS_PER_SEMITONE = 14;
const VISIBLE_BEATS = 16;
const VISIBLE_SEMITONES = 88;

// Standard "piano on QWERTY" keyboard layout — C4 (midi 60) on 'a'
const KEYBOARD_MAP: Record<string, number> = {
  a: 60, w: 61, s: 62, e: 63, d: 64,
  f: 65, t: 66, g: 67, y: 68, h: 69,
  u: 70, j: 71, k: 72,
};

const QUANTIZE_OPTIONS = [
  { label: "1/4",  value: 4  },
  { label: "1/8",  value: 8  },
  { label: "1/16", value: 16 },
  { label: "1/32", value: 32 },
];

function PianoKeys({ onNoteOn }: { onNoteOn: (pitch: number) => void }) {
  const keys = Array.from({ length: VISIBLE_SEMITONES }, (_, i) => i + 21); // A0–C8

  return (
    <div className="relative w-14 flex-shrink-0 bg-[var(--color-studio-900)]">
      {keys.reverse().map((midi) => {
        const isBlack = isBlackKey(midi);
        const name = noteNumberToName(midi);
        const isC = midi % 12 === 0;

        return (
          <div
            key={midi}
            className={cn(
              "border-b flex items-center justify-end pr-1 cursor-pointer select-none",
              isBlack
                ? "bg-[var(--color-studio-900)] border-[var(--color-studio-700)] z-10"
                : "bg-[var(--color-studio-700)] border-[var(--color-studio-600)]",
              "hover:bg-[var(--color-accent-purple)]"
            )}
            style={{ height: `${PIXELS_PER_SEMITONE}px` }}
            onPointerDown={() => onNoteOn(midi)}
          >
            {isC && (
              <span className="text-[9px] text-[var(--color-studio-300)] font-mono">{name}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PianoRoll() {
  const { selectedTrackId, selectedClipId, tracks, addNote } = useTracksStore();
  const [zoom, setZoom]           = React.useState(1);
  const [stepRecord, setStepRecord] = React.useState(false);
  const [cursorBeat, setCursorBeat] = React.useState(0);
  const [quantize, setQuantize]   = React.useState(16);

  const track = tracks.find((t) => t.id === selectedTrackId);
  const clip  = track?.clips.find((c) => c.id === selectedClipId);

  // Refs so the stable keyboard handler always sees the latest values
  const stepRecordRef    = React.useRef(stepRecord);
  stepRecordRef.current  = stepRecord;
  const cursorBeatRef    = React.useRef(cursorBeat);
  cursorBeatRef.current  = cursorBeat;
  const quantizeRef      = React.useRef(quantize);
  quantizeRef.current    = quantize;
  const clipRef          = React.useRef({ trackId: selectedTrackId, clipId: selectedClipId });
  clipRef.current        = { trackId: selectedTrackId, clipId: selectedClipId };
  const trackRef         = React.useRef(track);
  trackRef.current       = track;

  /** Preview a note through the synth without recording */
  const playNote = React.useCallback(async (pitch: number) => {
    await audioEngine.initialize();
    const tr = trackRef.current;
    if (!tr || tr.type !== "synth") return;
    ensureTrackRegistered(tr, () => -1);
    const inst = getSynthInstrument(tr.id);
    if (inst) inst.noteOnOff(pitch, 100, "8n");
  }, []); // stable — only reads trackRef

  /** Record a note at the cursor and advance it (only when Step Rec is on) */
  const recordNote = React.useCallback((pitch: number) => {
    if (!stepRecordRef.current) return;
    const { trackId, clipId } = clipRef.current;
    if (!trackId || !clipId) return;
    const stepSize = 4 / quantizeRef.current;
    addNote(trackId, clipId, {
      pitch,
      velocity: 100,
      startBeat: cursorBeatRef.current,
      durationBeats: stepSize,
    });
    setCursorBeat((b) => b + stepSize);
  }, [addNote]); // stable — only reads refs

  /** Called by piano key clicks */
  const handleNoteOn = React.useCallback(
    (pitch: number) => {
      void playNote(pitch);
      recordNote(pitch);
    },
    [playNote, recordNote]
  );

  // Computer keyboard handler — registered once per selected track
  React.useEffect(() => {
    if (!selectedTrackId) return;

    let octaveShift = 0; // persists across keystrokes within this effect's lifetime

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const el = e.target as HTMLElement;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return;

      if (e.key === "z") { octaveShift = Math.max(-3, octaveShift - 1); return; }
      if (e.key === "x") { octaveShift = Math.min(3, octaveShift + 1);  return; }

      const base = KEYBOARD_MAP[e.key.toLowerCase()];
      if (base === undefined) return;

      const pitch = Math.max(0, Math.min(127, base + octaveShift * 12));
      void playNote(pitch);
      recordNote(pitch);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedTrackId, playNote, recordNote]);

  // Reset cursor and step-rec when a different clip is opened
  React.useEffect(() => {
    setCursorBeat(0);
    setStepRecord(false);
  }, [selectedClipId]);

  const pxPerBeat = PIXELS_PER_BEAT * zoom;
  const stepSize  = 4 / quantize;

  if (!track || !clip) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--color-studio-800)] text-[var(--color-studio-300)] text-sm">
        Select a clip to edit in the Piano Roll
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-studio-800)] border-t border-[var(--color-studio-600)]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--color-studio-600)] bg-[var(--color-studio-700)] flex-wrap">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-studio-200)] mr-1">
          Piano Roll — {track.name} / {clip.name}
        </h2>

        <div className="flex-1" />

        {/* Step Record toggle */}
        <button
          onClick={() => setStepRecord((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors",
            stepRecord
              ? "bg-[var(--color-accent-red)] border-[var(--color-accent-red)] text-white"
              : "border-[var(--color-studio-500)] text-[var(--color-studio-300)] hover:text-white hover:border-[var(--color-studio-400)]"
          )}
          title="Step record — click piano keys or press keyboard to add notes at the cursor position"
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              stepRecord ? "bg-white animate-pulse" : "bg-[var(--color-studio-400)]"
            )}
          />
          Step Rec
        </button>

        {/* Cursor controls — only visible when recording */}
        {stepRecord && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCursorBeat((b) => Math.max(0, b - stepSize))}
              className="w-5 h-5 flex items-center justify-center text-[var(--color-studio-300)] hover:text-white rounded hover:bg-[var(--color-studio-500)] text-sm leading-none"
              title="Back one step"
            >‹</button>
            <span className="text-xs text-[var(--color-accent-cyan)] font-mono tabular-nums w-16 text-center select-none">
              Beat {(cursorBeat + 1).toFixed(2)}
            </span>
            <button
              onClick={() => setCursorBeat((b) => b + stepSize)}
              className="w-5 h-5 flex items-center justify-center text-[var(--color-studio-300)] hover:text-white rounded hover:bg-[var(--color-studio-500)] text-sm leading-none"
              title="Forward one step"
            >›</button>
            <button
              onClick={() => setCursorBeat(0)}
              className="text-[9px] px-1.5 h-5 flex items-center text-[var(--color-studio-400)] hover:text-white rounded hover:bg-[var(--color-studio-500)]"
              title="Reset cursor to beat 1"
            >↩</button>
          </div>
        )}

        {/* Step / note length */}
        <div className="flex items-center gap-1 text-xs text-[var(--color-studio-300)]">
          <span>Q:</span>
          <select
            value={quantize}
            onChange={(e) => setQuantize(Number(e.target.value))}
            className="bg-[var(--color-studio-600)] text-white text-xs rounded px-1.5 py-0.5 border border-[var(--color-studio-500)] outline-none cursor-pointer"
          >
            {QUANTIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 text-xs text-[var(--color-studio-300)]">
          <span>Zoom:</span>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.25}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-16 accent-[var(--color-accent-purple)]"
          />
        </div>
      </div>

      {/* Piano keys + note grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <PianoKeys onNoteOn={handleNoteOn} />

        <div className="flex-1 overflow-auto">
          <NoteGrid
            trackId={selectedTrackId!}
            clipId={selectedClipId!}
            pixelsPerBeat={pxPerBeat}
            pixelsPerSemitone={PIXELS_PER_SEMITONE}
            beatsVisible={VISIBLE_BEATS * zoom}
            quantizeDivision={quantize}
            recordCursorBeat={stepRecord ? cursorBeat : undefined}
          />
        </div>
      </div>

      {/* Keyboard shortcut hint bar */}
      {stepRecord && (
        <div className="px-3 py-1 border-t border-[var(--color-studio-700)] bg-[var(--color-studio-900)] text-[9px] text-[var(--color-studio-400)] flex flex-wrap gap-x-4">
          <span>
            White keys: <span className="text-[var(--color-studio-200)] font-mono">a s d f g h j k</span>
          </span>
          <span>
            Black keys: <span className="text-[var(--color-studio-200)] font-mono">w e t y u</span>
          </span>
          <span>
            Octave: <span className="text-[var(--color-studio-200)] font-mono">z ↓ &nbsp; x ↑</span>
          </span>
        </div>
      )}
    </div>
  );
}
