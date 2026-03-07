"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Square, Circle, Minus, Plus, Music } from "lucide-react";
import { useTransportStore } from "@/stores/transportStore";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { Avatar, cn } from "@aihq/ui";
import { formatPosition } from "@aihq/audio-engine";
import { Logo } from "@/components/layout/Logo";

interface TransportBarProps {
  className?: string;
}

export function TransportBar({ className }: TransportBarProps) {
  const { play, stop, setBpm, toggleMetronome } = useAudioEngine();
  const {
    isPlaying,
    isRecording,
    bpm,
    metronomeEnabled,
    position,
    timeSignatureNumerator,
    timeSignatureDenominator,
    setRecording,
  } = useTransportStore();

  const [bpmInput, setBpmInput] = React.useState(String(bpm));
  const [isEditingBpm, setIsEditingBpm] = React.useState(false);

  React.useEffect(() => {
    if (!isEditingBpm) setBpmInput(String(bpm));
  }, [bpm, isEditingBpm]);

  const handleBpmCommit = () => {
    const val = parseInt(bpmInput, 10);
    if (!isNaN(val) && val >= 40 && val <= 300) {
      setBpm(val);
    } else {
      setBpmInput(String(bpm));
    }
    setIsEditingBpm(false);
  };

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(40, Math.min(300, bpm + delta));
    setBpm(newBpm);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 bg-[var(--color-studio-800)] border-b border-[var(--color-studio-600)] select-none",
        className
      )}
      data-testid="transport-bar"
    >
      {/* Logo — links back to dashboard */}
      <Logo href="/dashboard" size="sm" className="mr-2" />

      {/* Transport controls */}
      <div className="flex items-center gap-1">
        {/* Play/Stop */}
        <button
          onClick={() => (isPlaying ? stop() : void play())}
          className={cn(
            "w-9 h-9 rounded flex items-center justify-center transition-all",
            isPlaying
              ? "bg-[var(--color-accent-cyan)] text-[var(--color-studio-900)]"
              : "bg-[var(--color-studio-600)] text-[var(--color-studio-100)] hover:bg-[var(--color-studio-500)] hover:text-white"
          )}
          aria-label={isPlaying ? "Stop" : "Play"}
          data-testid="transport-play-stop"
        >
          {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Record */}
        <button
          onClick={() => setRecording(!isRecording)}
          className={cn(
            "w-9 h-9 rounded flex items-center justify-center transition-all",
            isRecording
              ? "bg-[var(--color-accent-red)] text-white"
              : "bg-[var(--color-studio-600)] text-[var(--color-studio-100)] hover:bg-[var(--color-studio-500)]"
          )}
          aria-label={isRecording ? "Stop recording" : "Arm recording"}
          aria-pressed={isRecording}
        >
          <Circle className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--color-studio-600)]" />

      {/* Position display */}
      <div
        className="daw-readout text-sm tabular-nums text-[var(--color-accent-cyan)] bg-[var(--color-studio-900)] px-3 py-1 rounded border border-[var(--color-studio-600)] min-w-[72px] text-center"
        data-testid="transport-position"
      >
        {formatPosition(position)}
      </div>

      {/* Time signature */}
      <div className="daw-readout text-xs text-[var(--color-studio-200)]">
        {timeSignatureNumerator}/{timeSignatureDenominator}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--color-studio-600)]" />

      {/* BPM control */}
      <div className="flex items-center gap-1" data-testid="bpm-control">
        <button
          onClick={() => adjustBpm(-1)}
          className="w-5 h-5 rounded flex items-center justify-center text-[var(--color-studio-300)] hover:text-white hover:bg-[var(--color-studio-600)]"
          aria-label="Decrease BPM"
        >
          <Minus className="w-3 h-3" />
        </button>

        <div className="flex flex-col items-center">
          {isEditingBpm ? (
            <input
              type="number"
              value={bpmInput}
              onChange={(e) => setBpmInput(e.target.value)}
              onBlur={handleBpmCommit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBpmCommit();
                if (e.key === "Escape") {
                  setBpmInput(String(bpm));
                  setIsEditingBpm(false);
                }
              }}
              className="daw-readout w-12 text-center text-sm bg-[var(--color-studio-600)] text-white border border-[var(--color-accent-purple)] rounded outline-none py-0.5"
              autoFocus
              min={40}
              max={300}
            />
          ) : (
            <button
              onClick={() => setIsEditingBpm(true)}
              className="daw-readout text-sm font-medium text-white hover:text-[var(--color-accent-cyan)] tabular-nums w-12 text-center"
              aria-label={`BPM: ${bpm}`}
              data-testid="bpm-value"
            >
              {bpm}
            </button>
          )}
          <span className="text-[9px] text-[var(--color-studio-300)] tracking-widest uppercase">
            BPM
          </span>
        </div>

        <button
          onClick={() => adjustBpm(1)}
          className="w-5 h-5 rounded flex items-center justify-center text-[var(--color-studio-300)] hover:text-white hover:bg-[var(--color-studio-600)]"
          aria-label="Increase BPM"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--color-studio-600)]" />

      {/* Metronome */}
      <button
        onClick={toggleMetronome}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all",
          metronomeEnabled
            ? "bg-[var(--color-accent-cyan)] text-[var(--color-studio-900)]"
            : "bg-[var(--color-studio-600)] text-[var(--color-studio-200)] hover:bg-[var(--color-studio-500)]"
        )}
        aria-label="Toggle metronome"
        aria-pressed={metronomeEnabled}
      >
        <Music className="w-3 h-3" />
        CLICK
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Keyboard shortcut hint + user */}
      <div className="flex items-center gap-4">
        <div className="text-[10px] text-[var(--color-studio-400)]">
          <kbd className="px-1 rounded border border-[var(--color-studio-500)]">Space</kbd> Play/Stop
        </div>
        <Link
          href="/account"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Avatar name="Dev User" email="dev@aihq.local" size="xs" showStatus status="online" />
          <span className="text-[11px] text-[var(--color-studio-300)]">Dev User</span>
        </Link>
      </div>
    </div>
  );
}
