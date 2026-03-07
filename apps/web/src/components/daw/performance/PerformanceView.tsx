"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Maximize2, Minimize2, Play, Square, Volume2 } from "lucide-react";
import { useTransportStore } from "@/stores/transportStore";
import { audioEngine } from "@aihq/audio-engine";
import { useTracksStore } from "@/stores/tracksStore";

interface PerformanceViewProps {
  onClose: () => void;
}

const PAD_COLORS = [
  "#7c3aed", "#06b6d4", "#f59e0b", "#10b981",
  "#ef4444", "#8b5cf6", "#f97316", "#14b8a6",
];

export function PerformanceView({ onClose }: PerformanceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeKeys, setActiveKeys]     = useState<Set<string>>(new Set());
  const { bpm, isPlaying }  = useTransportStore();
  const play  = useCallback(() => audioEngine.transport.play(),  []);
  const stop  = useCallback(() => audioEngine.transport.stop(),  []);
  const tracks = useTracksStore((s) => s.tracks);

  // Fullscreen API
  async function enterFullscreen() {
    await containerRef.current?.requestFullscreen?.();
    setIsFullscreen(true);
  }
  async function exitFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    setIsFullscreen(false);
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keyboard → pad trigger
  const padKeys = useMemo(() => ["q","w","e","r","a","s","d","f"], []);

  const triggerPad = useCallback((idx: number) => {
    const track = tracks[idx];
    if (!track) return;
    // Play first step of this track's instrument
    audioEngine.transport.onPositionChange(() => {}); // ensure started
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.add(String(idx));
      return next;
    });
    setTimeout(() => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(String(idx));
        return next;
      });
    }, 150);
  }, [tracks]);

  useEffect(() => {
    function down(e: KeyboardEvent) {
      const idx = padKeys.indexOf(e.key.toLowerCase());
      if (idx >= 0) triggerPad(idx);
      if (e.code === "Space") { e.preventDefault(); isPlaying ? stop() : play(); }
    }
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [padKeys, triggerPad, isPlaying, play, stop]);

  // MIDI note-on events from MIDIManager
  useEffect(() => {
    function onMidiNote(e: Event) {
      const { note } = (e as CustomEvent<{ note: number; velocity: number }>).detail;
      const idx = note % 8;
      triggerPad(idx);
    }
    window.addEventListener("midi:noteon", onMidiNote);
    return () => window.removeEventListener("midi:noteon", onMidiNote);
  }, [triggerPad]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--color-studio-900)] text-white"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-studio-700)]">
        <span className="font-bold tracking-tight">
          <span className="text-[var(--color-accent-purple)]">AI</span>HQ — Live Performance
        </span>

        <div className="flex items-center gap-4">
          {/* Transport */}
          <button
            onClick={isPlaying ? stop : play}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              isPlaying
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-[var(--color-accent-purple)] hover:opacity-90 text-white"
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Stop" : "Play"}
          </button>

          <div className="flex items-center gap-2 bg-[var(--color-studio-800)] rounded-lg px-3 py-1.5">
            <Volume2 className="w-4 h-4 text-[var(--color-studio-400)]" />
            <span className="font-mono text-[var(--color-accent-cyan)] text-sm font-bold">{bpm} BPM</span>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="p-2 rounded-lg bg-[var(--color-studio-800)] text-[var(--color-studio-300)] hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-[var(--color-studio-600)] text-[var(--color-studio-300)] hover:text-white text-sm"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Main pad grid */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-[var(--color-studio-500)] text-sm mb-2">
          Press Q W E R / A S D F to trigger pads · Space = Play/Stop
        </p>

        <div className="grid grid-cols-4 gap-4 w-full max-w-3xl">
          {Array.from({ length: 8 }, (_, i) => {
            const track   = tracks[i];
            const color   = PAD_COLORS[i % PAD_COLORS.length];
            const keyHint = padKeys[i]?.toUpperCase() ?? "";
            const active  = activeKeys.has(String(i));

            return (
              <button
                key={i}
                onMouseDown={() => triggerPad(i)}
                className={`flex flex-col items-start justify-end p-4 rounded-2xl font-bold transition-all select-none`}
                style={{
                  height: 120,
                  background: active ? color : `${color}33`,
                  border:     `2px solid ${active ? color : `${color}66`}`,
                  transform:  active ? "scale(0.96)" : "scale(1)",
                  boxShadow:  active ? `0 0 24px ${color}88` : "none",
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono opacity-60">{keyHint}</span>
                  {track && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${color}44`, color }}>
                      {track.type === "drum" ? "DRUM" : "SYNTH"}
                    </span>
                  )}
                </div>
                <span className="text-white text-sm truncate w-full mt-auto">
                  {track?.name ?? `Pad ${i + 1}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Track strip */}
        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          {tracks.slice(0, 8).map((track, i) => (
            <div
              key={track.id}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-1 h-12 rounded-full bg-[var(--color-studio-700)] relative overflow-hidden"
              >
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
                  style={{ height: `${(track.volume ?? 80)}%`, background: PAD_COLORS[i % PAD_COLORS.length] }}
                />
              </div>
              <span className="text-[8px] text-[var(--color-studio-500)] truncate max-w-[40px] text-center">
                {track.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
