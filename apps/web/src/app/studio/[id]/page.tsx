"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { TransportBar } from "@/components/daw/transport/TransportBar";
import { StepSequencer } from "@/components/daw/sequencer/StepSequencer";
import { PianoRoll } from "@/components/daw/piano-roll/PianoRoll";
import { Mixer } from "@/components/daw/mixer/Mixer";
import { AIPanel } from "@/components/daw/ai-panel/AIPanel";
import { SessionView } from "@/components/daw/session/SessionView";
import { SynthPanel } from "@/components/daw/synth/SynthPanel";
import { EffectsRack } from "@/components/daw/effects/EffectsRack";
import { useUIStore } from "@/stores/uiStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useAudioSync } from "@/hooks/useAudioSync";
import { cn } from "@aihq/ui";
import { Bot, Music, Layers, Cpu, Wand2, Zap } from "lucide-react";

function PanelTab({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all",
        active
          ? "text-white border-b-2 border-[var(--color-accent-purple)]"
          : "text-[var(--color-studio-300)] hover:text-white"
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

export default function StudioPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const {
    activeBottomPanel,
    isAIPanelOpen,
    setBottomPanel,
    toggleAIPanel,
  } = useUIStore();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Wire Zustand stores → audio engine (instruments, sequencer, mixer)
  useAudioSync();

  // Auto-save project state
  useAutoSave(projectId);

  return (
    <div className="flex h-screen flex-col bg-[var(--color-studio-900)] text-white overflow-hidden">
      {/* Transport bar — always visible at top */}
      <TransportBar className="h-14 flex-shrink-0" />

      {/* Main DAW body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Session view + Bottom panel */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Session view (arrangement) */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <SessionView />
          </div>

          {/* Bottom panel (sequencer, piano roll, mixer, synth) */}
          <div className="flex flex-col border-t border-[var(--color-studio-600)] flex-shrink-0" style={{ height: "40%" }}>
            {/* Panel tabs */}
            <div className="flex items-center border-b border-[var(--color-studio-600)] bg-[var(--color-studio-800)]">
              <PanelTab
                id="sequencer"
                label="Sequencer"
                icon={Cpu}
                active={activeBottomPanel === "sequencer"}
                onClick={() => setBottomPanel("sequencer")}
              />
              <PanelTab
                id="piano-roll"
                label="Piano Roll"
                icon={Music}
                active={activeBottomPanel === "piano-roll"}
                onClick={() => setBottomPanel("piano-roll")}
              />
              <PanelTab
                id="mixer"
                label="Mixer"
                icon={Layers}
                active={activeBottomPanel === "mixer"}
                onClick={() => setBottomPanel("mixer")}
              />
              <PanelTab
                id="synth"
                label="Synth"
                icon={Wand2}
                active={activeBottomPanel === "synth"}
                onClick={() => setBottomPanel("synth")}
              />
              <PanelTab
                id="effects"
                label="Effects"
                icon={Zap}
                active={activeBottomPanel === "effects"}
                onClick={() => setBottomPanel("effects")}
              />

              {/* Right side: AI panel toggle */}
              <div className="ml-auto">
                <button
                  onClick={toggleAIPanel}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all mr-1",
                    isAIPanelOpen
                      ? "text-[var(--color-accent-purple)]"
                      : "text-[var(--color-studio-300)] hover:text-white"
                  )}
                >
                  <Bot className="w-3 h-3" />
                  AI
                </button>
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeBottomPanel === "sequencer" && <StepSequencer />}
              {activeBottomPanel === "piano-roll" && <PianoRoll />}
              {activeBottomPanel === "mixer" && <Mixer />}
              {activeBottomPanel === "synth" && <SynthPanel />}
              {activeBottomPanel === "effects" && <EffectsRack />}
            </div>
          </div>
        </div>

        {/* Right: AI Panel (collapsible) */}
        {isAIPanelOpen && (
          <div
            className="flex-shrink-0 border-l border-[var(--color-studio-600)]"
            style={{ width: 280 }}
          >
            <AIPanel />
          </div>
        )}
      </div>
    </div>
  );
}
