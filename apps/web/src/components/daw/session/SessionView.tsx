"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useTracksStore } from "@/stores/tracksStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@aihq/ui";

const BARS_VISIBLE = 32;
const PIXELS_PER_BAR = 80;
const TRACK_HEIGHT = 48;

export function SessionView() {
  const { tracks, selectedTrackId, selectedClipId, selectTrack, selectClip, addTrack, addClip, updateClip } =
    useTracksStore();
  const { setBottomPanel } = useUIStore();

  const handleAddSynthTrack = () => addTrack("synth");
  const handleAddDrumTrack = () => addTrack("drum");

  const handleClipClick = (trackId: string, clipId: string) => {
    selectTrack(trackId);
    selectClip(clipId);
    const track = tracks.find((t) => t.id === trackId);
    if (track?.type === "drum") {
      setBottomPanel("sequencer");
    } else {
      setBottomPanel("piano-roll");
    }
  };

  const handleTrackClick = (trackId: string) => {
    selectTrack(trackId);
    const track = tracks.find((t) => t.id === trackId);
    if (track?.type === "drum") {
      setBottomPanel("sequencer");
    } else {
      setBottomPanel("piano-roll");
    }
  };

  const handleAddClip = (trackId: string) => {
    addClip(trackId, {
      name: "New Clip",
      startBeat: 0,
      lengthBeats: 16,
      notes: [],
    });
  };

  return (
    <div className="flex h-full flex-col bg-[var(--color-studio-900)]">
      {/* Timeline ruler */}
      <div className="flex flex-shrink-0 border-b border-[var(--color-studio-600)]">
        <div
          className="flex-shrink-0 bg-[var(--color-studio-800)] border-r border-[var(--color-studio-600)]"
          style={{ width: 200 }}
        />
        <div className="flex overflow-hidden">
          {Array.from({ length: BARS_VISIBLE }, (_, i) => (
            <div
              key={i}
              className={cn(
                "flex-shrink-0 border-r text-[9px] pl-1 flex items-end pb-0.5",
                i % 4 === 0
                  ? "border-[var(--color-studio-500)] text-[var(--color-studio-200)]"
                  : "border-[var(--color-studio-700)] text-[var(--color-studio-500)]"
              )}
              style={{ width: PIXELS_PER_BAR, height: 24 }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Tracks */}
      <div className="flex-1 overflow-auto">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-studio-400)] gap-4">
            <p className="text-sm">No tracks yet. Add a track to start making music.</p>
            <div className="flex gap-3">
              <button
                onClick={handleAddSynthTrack}
                className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--color-studio-500)] text-sm hover:bg-[var(--color-studio-700)] hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Synth Track
              </button>
              <button
                onClick={handleAddDrumTrack}
                className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--color-studio-500)] text-sm hover:bg-[var(--color-studio-700)] hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Drum Track
              </button>
            </div>
          </div>
        ) : (
          tracks.map((track) => (
            <div
              key={track.id}
              className={cn(
                "flex border-b border-[var(--color-studio-700)]",
                selectedTrackId === track.id && "bg-[var(--color-studio-800)]"
              )}
              style={{ height: TRACK_HEIGHT }}
            >
              {/* Track header */}
              <div
                className="flex-shrink-0 flex items-center gap-2 px-3 border-r border-[var(--color-studio-600)] cursor-pointer hover:bg-[var(--color-studio-700)] transition-colors"
                style={{ width: 200 }}
                onClick={() => handleTrackClick(track.id)}
              >
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: track.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{track.name}</p>
                  <p className="text-[9px] text-[var(--color-studio-400)] uppercase">
                    {track.type}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddClip(track.id);
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center text-[var(--color-studio-400)] hover:text-white hover:bg-[var(--color-studio-500)]"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Clip area */}
              <div
                className="flex-1 relative overflow-hidden bg-[var(--color-studio-800)] bg-opacity-30"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  try {
                    const data = JSON.parse(e.dataTransfer.getData("application/json"));
                    // calculate relative drop location
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const beats = Math.floor(x / (PIXELS_PER_BAR / 4));

                    if (data.trackId === track.id) {
                      updateClip(track.id, data.clipId, { startBeat: Math.max(0, beats) });
                    }
                  } catch (err) { }
                }}
              >
                {track.clips.map((clip) => {
                  const left = clip.startBeat * (PIXELS_PER_BAR / 4);
                  const width = clip.lengthBeats * (PIXELS_PER_BAR / 4);
                  const isSelected = selectedClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({ trackId: track.id, clipId: clip.id, startBeat: clip.startBeat })
                        );
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className={cn(
                        "absolute top-1 bottom-1 rounded cursor-pointer transition-all",
                        isSelected ? "ring-1 ring-white" : "hover:brightness-110"
                      )}
                      style={{
                        left,
                        width,
                        backgroundColor: `${track.color}88`,
                        borderLeft: `2px solid ${track.color}`,
                      }}
                      onClick={() => handleClipClick(track.id, clip.id)}
                    >
                      <div className="px-1.5 py-0.5">
                        <p className="text-[9px] text-white truncate font-medium">{clip.name}</p>
                        <p className="text-[9px] text-white/60">{clip.notes.length} notes</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer — Add track buttons */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-[var(--color-studio-600)] bg-[var(--color-studio-800)]">
        <button
          onClick={handleAddSynthTrack}
          className="flex items-center gap-1.5 text-xs text-[var(--color-studio-300)] hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Synth
        </button>
        <button
          onClick={handleAddDrumTrack}
          className="flex items-center gap-1.5 text-xs text-[var(--color-studio-300)] hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Drum
        </button>
        <button
          onClick={() => addTrack("audio")}
          className="flex items-center gap-1.5 text-xs text-[var(--color-studio-300)] hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Audio
        </button>
      </div>
    </div>
  );
}
