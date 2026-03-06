"use client";

import * as React from "react";
import { Knob, Fader, cn } from "@aihq/ui";
import { useTracksStore } from "@/stores/tracksStore";
import { audioEngine } from "@aihq/audio-engine";
import type { Track } from "@aihq/shared";

interface ChannelStripProps {
  track: Track;
  isSelected: boolean;
  onClick: () => void;
}

export function ChannelStrip({ track, isSelected, onClick }: ChannelStripProps) {
  const { setVolume, setPan, setMuted, setSoloed } = useTracksStore();

  const handleVolume = (db: number) => {
    setVolume(track.id, db);
    audioEngine.mixer.setChannelVolume(track.id, db);
  };

  const handlePan = (pan: number) => {
    // Knob returns 0-1, map to -1..+1
    const panValue = pan * 2 - 1;
    setPan(track.id, panValue);
    audioEngine.mixer.setChannelPan(track.id, panValue);
  };

  const handleMute = () => {
    const muted = !track.muted;
    setMuted(track.id, muted);
    audioEngine.mixer.setChannelMuted(track.id, muted);
  };

  const handleSolo = () => {
    const soloed = !track.soloed;
    setSoloed(track.id, soloed);
    audioEngine.mixer.setSolo(track.id, soloed);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 px-2 py-2 w-16 border-r border-[var(--color-studio-600)] cursor-pointer transition-colors",
        isSelected
          ? "bg-[var(--color-studio-600)]"
          : "bg-[var(--color-studio-700)] hover:bg-[var(--color-studio-650)]"
      )}
    >
      {/* Track color + name */}
      <div className="w-full flex flex-col items-center gap-0.5">
        <div className="w-8 h-1 rounded-full" style={{ backgroundColor: track.color }} />
        <span className="text-[9px] text-[var(--color-studio-200)] text-center leading-tight truncate w-full">
          {track.name}
        </span>
      </div>

      {/* Pan knob */}
      <Knob
        value={(track.pan + 1) / 2}
        onChange={handlePan}
        label="PAN"
        defaultValue={0.5}
        size="sm"
        color="var(--color-accent-cyan)"
      />

      {/* VU Meter placeholder + Fader */}
      <div className="flex items-end gap-1">
        <div className="w-1.5 h-24 bg-[var(--color-studio-500)] rounded-sm overflow-hidden flex flex-col justify-end">
          <div
            className="w-full transition-all"
            style={{ height: `${((track.volume + 60) / 66) * 100}%`, backgroundColor: track.color }}
          />
        </div>
        <Fader value={track.volume} onChange={handleVolume} />
      </div>

      {/* Mute / Solo */}
      <div className="flex gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); handleMute(); }}
          className={cn(
            "w-6 h-5 rounded text-[9px] font-bold flex items-center justify-center transition-colors",
            track.muted
              ? "bg-[var(--color-accent-red)] text-white"
              : "bg-[var(--color-studio-500)] text-[var(--color-studio-200)] hover:bg-[var(--color-studio-400)]"
          )}
          aria-pressed={track.muted}
          aria-label="Mute"
        >
          M
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleSolo(); }}
          className={cn(
            "w-6 h-5 rounded text-[9px] font-bold flex items-center justify-center transition-colors",
            track.soloed
              ? "bg-[var(--color-accent-yellow)] text-black"
              : "bg-[var(--color-studio-500)] text-[var(--color-studio-200)] hover:bg-[var(--color-studio-400)]"
          )}
          aria-pressed={track.soloed}
          aria-label="Solo"
        >
          S
        </button>
      </div>

      {/* DB readout */}
      <span className="daw-readout text-[9px] text-[var(--color-studio-300)] tabular-nums">
        {track.volume === -60 ? "-∞" : track.volume > 0 ? `+${track.volume.toFixed(1)}` : track.volume.toFixed(1)}
      </span>
    </div>
  );
}
