"use client";

import * as React from "react";
import { Plus, Trash2, Volume2 } from "lucide-react";
import { StepButton } from "./StepButton";
import { useTracksStore } from "@/stores/tracksStore";
import { useTransportStore } from "@/stores/transportStore";
import { audioEngine } from "@aihq/audio-engine";
import { cn } from "@aihq/ui";

// Current playhead step (driven by Tone.Transport position)
function useCurrentStep(bpm: number, isPlaying: boolean): number {
  const [step, setStep] = React.useState(-1);

  React.useEffect(() => {
    if (!isPlaying) {
      setStep(-1);
      return;
    }

    const interval = setInterval(() => {
      const transport = audioEngine.transport;
      const pos = transport.getPosition();
      // Parse "bar:beat:16th" and compute 16th step
      const parts = pos.split(":").map(Number);
      const bars = parts[0] ?? 0;
      const beats = parts[1] ?? 0;
      const sixteenths = parts[2] ?? 0;
      const totalSixteenths = bars * 16 + beats * 4 + Math.floor(sixteenths / 48);
      setStep(totalSixteenths % 16);
    }, 30); // Update at ~33Hz (well above 16th note at 300 BPM)

    return () => clearInterval(interval);
  }, [isPlaying, bpm]);

  return step;
}

export function StepSequencer() {
  const { tracks, addTrack, removeTrack, setStepActive } = useTracksStore();
  const { isPlaying, bpm } = useTransportStore();

  const drumTracks = tracks.filter((t) => t.type === "drum");
  const currentStep = useCurrentStep(bpm, isPlaying);

  // Audio wiring is handled by useAudioSync (called in StudioPage)

  const handleAddDrumTrack = () => {
    addTrack("drum");
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-studio-800)] border-t border-[var(--color-studio-600)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-studio-600)]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-studio-200)]">
          Step Sequencer
        </h2>
        <div className="flex items-center gap-2">
          {/* Step number header */}
          <div className="flex items-center gap-0.5 ml-2">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "w-8 text-center text-[9px] tabular-nums",
                  i === currentStep
                    ? "text-[var(--color-accent-cyan)]"
                    : i % 4 === 0
                    ? "text-[var(--color-studio-200)]"
                    : "text-[var(--color-studio-400)]"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Track rows */}
      <div className="flex-1 overflow-y-auto">
        {drumTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-studio-300)] gap-3">
            <p className="text-sm">No drum tracks. Add one to get started.</p>
            <button
              onClick={handleAddDrumTrack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border border-[var(--color-studio-500)] hover:bg-[var(--color-studio-600)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Drum Track
            </button>
          </div>
        ) : (
          drumTracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center border-b border-[var(--color-studio-700)] hover:bg-[var(--color-studio-750)]"
            >
              {/* Track label */}
              <div className="w-[var(--daw-track-header-width)] flex-shrink-0 flex items-center gap-2 px-3 py-1.5">
                <div
                  className="w-2 h-7 rounded-full flex-shrink-0"
                  style={{ backgroundColor: track.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{track.name}</p>
                  <p className="text-[9px] text-[var(--color-studio-300)]">Drum</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="text-[var(--color-studio-300)] hover:text-white p-0.5 rounded">
                    <Volume2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="text-[var(--color-studio-400)] hover:text-[var(--color-accent-red)] p-0.5 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="flex items-center gap-0.5 px-2 py-1.5">
                {Array.from({ length: 16 }, (_, stepIdx) => (
                  <StepButton
                    key={stepIdx}
                    step={stepIdx}
                    isActive={track.stepPattern?.steps[stepIdx] ?? false}
                    isCurrentStep={currentStep === stepIdx && isPlaying}
                    color={track.color}
                    onClick={() => {
                      const current = track.stepPattern?.steps[stepIdx] ?? false;
                      setStepActive(track.id, stepIdx, !current);
                      audioEngine.sequencer.setStep(track.id, stepIdx, !current);
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-[var(--color-studio-600)]">
        <button
          onClick={handleAddDrumTrack}
          className="flex items-center gap-1.5 text-xs text-[var(--color-studio-300)] hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add drum track
        </button>
      </div>
    </div>
  );
}
