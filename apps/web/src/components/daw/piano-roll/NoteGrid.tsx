"use client";

import * as React from "react";
import { isBlackKey } from "@aihq/audio-engine";
import type { MidiNote } from "@aihq/shared";
import { useTracksStore } from "@/stores/tracksStore";

interface NoteGridProps {
  trackId: string;
  clipId: string;
  pixelsPerBeat: number;
  pixelsPerSemitone: number;
  beatsVisible: number;
  quantizeDivision?: number; // 4=quarter, 8=8th, 16=16th, 32=32nd
  className?: string;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelsPerBeat: number,
  pixelsPerSemitone: number,
  _beatsVisible: number
) {
  // Background with semitone lanes
  for (let semitone = 0; semitone <= 127; semitone++) {
    const y = height - (semitone + 1) * pixelsPerSemitone;
    if (y + pixelsPerSemitone < 0 || y > height) continue;

    ctx.fillStyle = isBlackKey(semitone) ? "#0e0e12" : "#111115";
    ctx.fillRect(0, y, width, pixelsPerSemitone);

    // C notes (octave boundaries)
    if (semitone % 12 === 0) {
      ctx.strokeStyle = "#2a2a38";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + pixelsPerSemitone);
      ctx.lineTo(width, y + pixelsPerSemitone);
      ctx.stroke();
    }
  }

  // Beat grid lines
  const beatStep = pixelsPerBeat / 4; // 16th notes
  for (let x = 0; x <= width; x += beatStep) {
    const beat = x / pixelsPerBeat;
    const isBar = beat % 4 === 0;
    const isBeat = beat % 1 === 0;
    ctx.strokeStyle = isBar ? "#2e2e42" : isBeat ? "#232332" : "#1a1a28";
    ctx.lineWidth = isBar ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawNotes(
  ctx: CanvasRenderingContext2D,
  notes: MidiNote[],
  height: number,
  pixelsPerBeat: number,
  pixelsPerSemitone: number
) {
  notes.forEach((note) => {
    const x = note.startBeat * pixelsPerBeat;
    const y = height - (note.pitch + 1) * pixelsPerSemitone;
    const w = Math.max(note.durationBeats * pixelsPerBeat - 1, 3);
    const h = pixelsPerSemitone - 1;

    const lightness = 40 + (note.velocity / 127) * 30;
    ctx.fillStyle = `hsl(260, 75%, ${lightness}%)`;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, 2);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.fill();

    // Note border
    ctx.strokeStyle = `hsl(260, 90%, ${lightness + 15}%)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });
}

export function NoteGrid({
  trackId,
  clipId,
  pixelsPerBeat,
  pixelsPerSemitone,
  beatsVisible,
  quantizeDivision = 16,
  className,
}: NoteGridProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDrawing = React.useRef(false);
  const dragState = React.useRef<{
    mode: "create" | "move";
    noteId?: string;
    startBeat: number;
    startPitch: number;
    originalNote?: MidiNote;
  } | null>(null);

  const notes = useTracksStore(
    (s) => s.tracks.find((t) => t.id === trackId)?.clips.find((c) => c.id === clipId)?.notes ?? []
  );
  const { addNote, removeNote } = useTracksStore();

  // Resize observer to handle canvas sizing
  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Redraw canvas when notes change
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    drawGrid(ctx, width, height, pixelsPerBeat, pixelsPerSemitone, beatsVisible);
    drawNotes(ctx, notes, height, pixelsPerBeat, pixelsPerSemitone);
  }, [notes, pixelsPerBeat, pixelsPerSemitone, beatsVisible]);

  // Convert canvas coordinates to musical values
  const canvasToMusical = React.useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const height = rect.height;

      const rawBeat = x / pixelsPerBeat;
      // Quantize to grid
      const gridSize = 4 / quantizeDivision;
      const beat = Math.round(rawBeat / gridSize) * gridSize;
      const pitch = Math.floor((height - y) / pixelsPerSemitone);

      return { beat: Math.max(0, beat), pitch: Math.max(0, Math.min(127, pitch)) };
    },
    [pixelsPerBeat, pixelsPerSemitone, quantizeDivision]
  );

  // Find note at position
  const getNoteAtPosition = React.useCallback(
    (beat: number, pitch: number): MidiNote | undefined => {
      return notes.find(
        (n) =>
          beat >= n.startBeat &&
          beat < n.startBeat + n.durationBeats &&
          pitch === n.pitch
      );
    },
    [notes]
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const { beat, pitch } = canvasToMusical(e.clientX, e.clientY, rect);

      if (e.button === 2) {
        // Right click = delete note
        const note = getNoteAtPosition(beat, pitch);
        if (note) removeNote(trackId, clipId, note.id);
        return;
      }

      const existingNote = getNoteAtPosition(beat, pitch);
      if (existingNote) {
        dragState.current = {
          mode: "move",
          noteId: existingNote.id,
          startBeat: beat,
          startPitch: pitch,
          originalNote: existingNote,
        };
      } else {
        isDrawing.current = true;
        addNote(trackId, clipId, {
          pitch,
          velocity: 100,
          startBeat: beat,
          durationBeats: 4 / quantizeDivision,
        });
        dragState.current = { mode: "create", startBeat: beat, startPitch: pitch };
      }
    },
    [
      canvasToMusical,
      getNoteAtPosition,
      addNote,
      removeNote,
      trackId,
      clipId,
      quantizeDivision,
    ]
  );

  const handlePointerUp = React.useCallback(() => {
    isDrawing.current = false;
    dragState.current = null;
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? "w-full h-full"}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
