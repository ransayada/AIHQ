"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { ChannelStrip } from "./ChannelStrip";
import { useTracksStore } from "@/stores/tracksStore";

export function Mixer() {
  const { tracks, selectedTrackId, selectTrack, addTrack } = useTracksStore();

  return (
    <div className="h-full flex flex-col bg-[var(--color-studio-800)] border-t border-[var(--color-studio-600)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-studio-600)] bg-[var(--color-studio-700)]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-studio-200)]">
          Mixer
        </h2>
        <button
          onClick={() => addTrack("synth")}
          className="flex items-center gap-1 text-xs text-[var(--color-studio-300)] hover:text-white"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Channel
        </button>
      </div>

      {/* Channel strips */}
      <div className="flex-1 flex overflow-x-auto">
        {tracks.map((track) => (
          <ChannelStrip
            key={track.id}
            track={track}
            isSelected={selectedTrackId === track.id}
            onClick={() => selectTrack(track.id)}
          />
        ))}

        {/* Master channel */}
        <div className="flex flex-col items-center gap-1.5 px-2 py-2 w-16 bg-[var(--color-studio-800)] border-l-2 border-[var(--color-studio-400)] ml-auto">
          <div className="w-full flex flex-col items-center gap-0.5">
            <div className="w-8 h-1 rounded-full bg-[var(--color-accent-cyan)]" />
            <span className="text-[9px] text-[var(--color-studio-200)] text-center">MASTER</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-[var(--color-studio-400)]">
            <div className="text-[9px] text-center">0 dB</div>
          </div>
        </div>
      </div>
    </div>
  );
}
