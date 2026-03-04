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

function PianoKeys({ onNoteOn }: { onNoteOn: (pitch: number) => Promise<void> | void }) {
  const keys = Array.from({ length: VISIBLE_SEMITONES }, (_, i) => i + 21); // A0 to C8

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
            onPointerDown={() => {
              void onNoteOn(midi);
            }}
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
  const { selectedTrackId, selectedClipId, tracks } = useTracksStore();
  const [zoom, setZoom] = React.useState(1);

  const track = tracks.find((t) => t.id === selectedTrackId);
  const clip = track?.clips.find((c) => c.id === selectedClipId);

  const handleNoteOn = async (pitch: number) => {
    if (!track || track.type !== "synth") return;

    // Ensure audio context is started (user gesture: piano key click)
    await audioEngine.initialize();

    // Ensure the instrument is registered — defensive fallback
    ensureTrackRegistered(track, () => -1);

    const inst = getSynthInstrument(track.id);
    if (!inst) return;

    // Short preview note
    inst.noteOnOff(pitch, 110, "8n");
  };

  if (!track || !clip) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--color-studio-800)] text-[var(--color-studio-300)] text-sm">
        Select a clip to edit in the Piano Roll
      </div>
    );
  }

  const pxPerBeat = PIXELS_PER_BEAT * zoom;

  return (
    <div className="h-full flex flex-col bg-[var(--color-studio-800)] border-t border-[var(--color-studio-600)]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-[var(--color-studio-600)] bg-[var(--color-studio-700)]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-studio-200)]">
          Piano Roll — {track.name} / {clip.name}
        </h2>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-[var(--color-studio-300)]">
          <span>Zoom:</span>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.25}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-20 accent-[var(--color-accent-purple)]"
          />
        </div>
      </div>

      {/* Piano + Grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <PianoKeys onNoteOn={handleNoteOn} />

        {/* Grid area */}
        <div className="flex-1 overflow-auto">
          <NoteGrid
            trackId={selectedTrackId!}
            clipId={selectedClipId!}
            pixelsPerBeat={pxPerBeat}
            pixelsPerSemitone={PIXELS_PER_SEMITONE}
            beatsVisible={VISIBLE_BEATS * zoom}
          />
        </div>
      </div>
    </div>
  );
}
