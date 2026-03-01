"use client";

import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Loader2, Wand2, Music, MessageSquare } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { audioEngine } from "@aihq/audio-engine";
import { useAIStore } from "@/stores/aiStore";
import { useTracksStore } from "@/stores/tracksStore";
import { cn } from "@aihq/ui";
export function AIPanel() {
  const [isLoadingMagenta, setIsLoadingMagenta] = React.useState(false);
  const [magentaError, setMagentaError] = React.useState<string | null>(null);
  const [drumTemp, setDrumTemp] = React.useState(1.0);
  const [melodyTemp, setMelodyTemp] = React.useState(1.1);

  const { magentaLoaded, setMagentaLoaded, isGenerating, setGenerating } = useAIStore();
  const { tracks, setPattern } = useTracksStore();
  const loadMagenta = async () => {
    if (magentaLoaded || isLoadingMagenta) return;
    setIsLoadingMagenta(true);
    setMagentaError(null);
    try {
      await audioEngine.magenta.init();
      setMagentaLoaded(true);
    } catch (err) {
      setMagentaError("Failed to load AI models. Check your connection.");
      console.error("Magenta load error:", err);
    } finally {
      setIsLoadingMagenta(false);
    }
  };

  const generateDrums = async () => {
    if (!magentaLoaded || isGenerating) return;
    setGenerating(true);

    try {
      const pattern = await audioEngine.magenta.generateDrums(drumTemp);

      // Find first drum track and load the pattern
      const drumTrack = tracks.find((t) => t.type === "drum");
      if (drumTrack) {
        setPattern(drumTrack.id, pattern.steps, pattern.velocities);
        audioEngine.sequencer.setPattern(drumTrack.id, pattern.steps, pattern.velocities);
      }

      // Log usage on server (no-op without auth)
      await fetch("/api/ai/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "drum_pattern" }),
      }).catch(() => {}); // Non-critical
    } catch (err) {
      console.error("Drum generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const generateMelody = async () => {
    if (!magentaLoaded || isGenerating) return;
    setGenerating(true);

    try {
      const melody = await audioEngine.magenta.generateMelody([60, 64, 67], melodyTemp);
      // In full impl: load into piano roll
      console.warn("Generated melody:", melody);
    } catch (err) {
      console.error("Melody generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-studio-800)] border-l border-[var(--color-studio-600)]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--color-studio-600)] bg-[var(--color-studio-700)]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-purple)]">
          AI Panel
        </h2>
      </div>

      <Tabs.Root defaultValue="drums" className="flex flex-col flex-1 min-h-0">
        {/* Tab list */}
        <Tabs.List className="flex border-b border-[var(--color-studio-600)]">
          {[
            { value: "drums", label: "Drums", icon: Music },
            { value: "melody", label: "Melody", icon: Wand2 },
            { value: "chat", label: "Chat", icon: MessageSquare },
          ].map(({ value, label, icon: Icon }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                "data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-accent-purple)] data-[state=active]:-mb-px",
                "data-[state=inactive]:text-[var(--color-studio-300)] data-[state=inactive]:hover:text-white"
              )}
            >
              <Icon className="w-3 h-3" />
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Drums tab */}
        <Tabs.Content value="drums" className="flex-1 overflow-y-auto p-3 space-y-3">
          {!magentaLoaded ? (
            <div className="text-center">
              <p className="text-xs text-[var(--color-studio-300)] mb-3">
                Load AI models to generate drum patterns (requires internet)
              </p>
              <button
                onClick={loadMagenta}
                disabled={isLoadingMagenta}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded bg-[var(--color-accent-purple)] text-white text-sm hover:bg-[var(--color-accent-purple-dim)] disabled:opacity-50"
              >
                {isLoadingMagenta && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isLoadingMagenta ? "Loading models..." : "Load AI Models"}
              </button>
              {magentaError && (
                <p className="text-xs text-[var(--color-accent-red)] mt-2">{magentaError}</p>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] text-[var(--color-studio-300)] uppercase tracking-widest block mb-1">
                  Creativity (Temperature): {drumTemp.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={drumTemp}
                  onChange={(e) => setDrumTemp(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent-purple)]"
                />
                <div className="flex justify-between text-[9px] text-[var(--color-studio-400)]">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>

              <button
                onClick={generateDrums}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[var(--color-accent-purple)] text-white text-sm font-medium hover:bg-[var(--color-accent-purple-dim)] disabled:opacity-50 transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Music className="w-4 h-4" />
                )}
                Generate Drum Pattern
              </button>

              <p className="text-[10px] text-[var(--color-studio-400)]">
                Generates a 16-step drum pattern using Google Magenta&apos;s DrumsRNN model running
                locally in your browser.
              </p>
            </>
          )}
        </Tabs.Content>

        {/* Melody tab */}
        <Tabs.Content value="melody" className="flex-1 overflow-y-auto p-3 space-y-3">
          {!magentaLoaded ? (
            <div className="text-center">
              <p className="text-xs text-[var(--color-studio-300)] mb-3">Load AI models first</p>
              <button
                onClick={loadMagenta}
                disabled={isLoadingMagenta}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded bg-[var(--color-accent-purple)] text-white text-sm hover:bg-[var(--color-accent-purple-dim)] disabled:opacity-50"
              >
                {isLoadingMagenta && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isLoadingMagenta ? "Loading..." : "Load AI Models"}
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] text-[var(--color-studio-300)] uppercase tracking-widest block mb-1">
                  Temperature: {melodyTemp.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={melodyTemp}
                  onChange={(e) => setMelodyTemp(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent-purple)]"
                />
              </div>

              <button
                onClick={generateMelody}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[var(--color-accent-purple)] text-white text-sm font-medium hover:bg-[var(--color-accent-purple-dim)] disabled:opacity-50 transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Generate Melody
              </button>
            </>
          )}
        </Tabs.Content>

        {/* Chat tab */}
        <Tabs.Content value="chat" className="flex-1 min-h-0 flex flex-col">
          <ChatInterface />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
