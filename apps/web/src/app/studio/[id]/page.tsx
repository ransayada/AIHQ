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
import { useTracksStore } from "@/stores/tracksStore";
import { useTransportStore } from "@/stores/transportStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useAudioSync } from "@/hooks/useAudioSync";
import { cn } from "@aihq/ui";
import {
  Bot, Music, Layers, Cpu, Wand2, Zap, Disc3, Music2, Wifi,
  Sparkles, Puzzle, Clock, Download, Maximize2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { DJMixer } from "@/components/daw/dj/DJMixer";
import { SampleBrowser } from "@/components/daw/samples/SampleBrowser";
import { MIDIPanel } from "@/components/daw/midi/MIDIPanel";
import { MasteringPanel } from "@/components/daw/mastering/MasteringPanel";
import { PluginBrowser } from "@/components/daw/plugins/PluginBrowser";
import { VersionHistoryPanel } from "@/components/daw/version-history/VersionHistoryPanel";
import { CollabPresence } from "@/components/daw/collab/CollabPresence";
import { ExportDialog } from "@/components/daw/export/ExportDialog";
import { PerformanceView } from "@/components/daw/performance/PerformanceView";

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: "sequencer",  label: "Sequencer",  icon: Cpu,      shortcut: "1" },
  { id: "piano-roll", label: "Piano Roll", icon: Music,     shortcut: "2" },
  { id: "mixer",      label: "Mixer",       icon: Layers,    shortcut: "3" },
  { id: "synth",      label: "Synth",       icon: Wand2,     shortcut: "4" },
  { id: "effects",    label: "Effects",     icon: Zap,       shortcut: "5" },
  { id: "dj",         label: "DJ",          icon: Disc3,     shortcut: "6" },
  { id: "samples",    label: "Samples",     icon: Music2,    shortcut: "7" },
  { id: "midi",       label: "MIDI",        icon: Wifi,      shortcut: "8" },
  { id: "mastering",  label: "Master",      icon: Sparkles,  shortcut: "9" },
  { id: "plugins",    label: "Plugins",     icon: Puzzle,    shortcut: "0" },
  { id: "history",    label: "History",     icon: Clock,     shortcut: "" },
] as const;

type TabId = typeof TABS[number]["id"];

function PanelTab({
  label,
  icon: Icon,
  active,
  shortcut,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  shortcut: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0",
        active
          ? "text-white border-b-2 border-[var(--color-accent-purple)]"
          : "text-[var(--color-studio-300)] hover:text-white"
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
      {shortcut && (
        <span className="ml-0.5 text-[8px] opacity-40 font-mono">{shortcut}</span>
      )}
    </button>
  );
}

// ── Panel content — fade-in when panel changes ────────────────────────────────
function PanelContent({ panel, projectId }: { panel: TabId; projectId: string }) {
  const [key, setKey] = React.useState(0);
  const prevPanel = React.useRef(panel);

  if (prevPanel.current !== panel) {
    prevPanel.current = panel;
    setKey((k) => k + 1);
  }

  return (
    <div key={key} className="h-full animate-panel-in">
      {panel === "sequencer"  && <StepSequencer />}
      {panel === "piano-roll" && <PianoRoll />}
      {panel === "mixer"      && <Mixer />}
      {panel === "synth"      && <SynthPanel />}
      {panel === "effects"    && <EffectsRack />}
      {panel === "dj"         && <DJMixer />}
      {panel === "samples"    && <SampleBrowser />}
      {panel === "midi"       && <MIDIPanel />}
      {panel === "mastering"  && <MasteringPanel />}
      {panel === "plugins"    && <PluginBrowser />}
      {panel === "history"    && <VersionHistoryPanel projectId={projectId} />}
    </div>
  );
}

// ── Main studio page ──────────────────────────────────────────────────────────
export default function StudioPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const {
    activeBottomPanel,
    isAIPanelOpen,
    setBottomPanel,
    toggleAIPanel,
  } = useUIStore();

  const [showExport,      setShowExport]      = React.useState(false);
  const [showPerformance, setShowPerformance] = React.useState(false);

  // Resizable bottom panel — suggestion #2
  const [bottomHeight, setBottomHeight] = React.useState(40); // percent
  const isDragging    = React.useRef(false);
  const dragStartY    = React.useRef(0);
  const dragStartH    = React.useRef(0);

  const handleDragStart = React.useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current  = true;
    dragStartY.current  = e.clientY;
    dragStartH.current  = bottomHeight;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [bottomHeight]);

  const handleDragMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const container  = (e.currentTarget as HTMLElement).parentElement!;
    const totalH     = container.clientHeight;
    const deltaY     = dragStartY.current - e.clientY;
    const deltaPct   = (deltaY / totalH) * 100;
    const newH       = Math.max(20, Math.min(80, dragStartH.current + deltaPct));
    setBottomHeight(newH);
  }, []);

  const handleDragEnd = React.useCallback(() => {
    isDragging.current = false;
  }, []);

  // Resizable AI panel — suggestion #10
  const [aiPanelWidth, setAiPanelWidth] = React.useState(280);
  const isDraggingAI   = React.useRef(false);
  const dragStartAIX   = React.useRef(0);
  const dragStartAIW   = React.useRef(0);

  const handleAIDragStart = React.useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingAI.current  = true;
    dragStartAIX.current  = e.clientX;
    dragStartAIW.current  = aiPanelWidth;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [aiPanelWidth]);

  const handleAIDragMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDraggingAI.current) return;
    const delta = dragStartAIX.current - e.clientX;
    const newW  = Math.max(220, Math.min(480, dragStartAIW.current + delta));
    setAiPanelWidth(newW);
  }, []);

  const handleAIDragEnd = React.useCallback(() => {
    isDraggingAI.current = false;
  }, []);

  // Scrollable tab bar — suggestion #1
  const tabBarRef   = React.useRef<HTMLDivElement>(null);
  const scrollTabs  = (dir: "left" | "right") => {
    if (tabBarRef.current) {
      tabBarRef.current.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
    }
  };
  const [canScrollLeft,  setCanScrollLeft]  = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollIndicators = React.useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener("scroll", updateScrollIndicators);
    const ro = new ResizeObserver(updateScrollIndicators);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateScrollIndicators); ro.disconnect(); };
  }, [updateScrollIndicators]);

  useKeyboardShortcuts();
  useAudioSync();

  React.useEffect(() => {
    if (!projectId || projectId === "new") return;
    let mounted = true;
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((body) => {
        if (!mounted) return;
        const project = body.data?.project;
        if (project && project.data && Array.isArray(project.data.tracks)) {
          useTracksStore.getState().loadTracks(project.data.tracks);
          if (project.bpm) useTransportStore.getState().setBpm(project.bpm);
        }
      })
      .catch((err) => console.error("Failed to load project:", err));
    return () => { mounted = false; };
  }, [projectId]);

  useAutoSave(projectId);

  return (
    <div
      className="flex h-screen flex-col bg-[var(--color-studio-900)] text-white overflow-hidden"
      onPointerMove={(e) => { handleDragMove(e); handleAIDragMove(e); }}
      onPointerUp={() => { handleDragEnd(); handleAIDragEnd(); }}
    >
      {/* Transport bar */}
      <TransportBar className="h-14 flex-shrink-0" />

      {/* Main DAW body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Session view + Bottom panel */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Session view */}
          <div className="flex-1 min-h-0 overflow-hidden" style={{ height: `${100 - bottomHeight}%` }}>
            <SessionView />
          </div>

          {/* Bottom panel */}
          <div
            className="flex flex-col border-t border-[var(--color-studio-600)] flex-shrink-0"
            style={{ height: `${bottomHeight}%` }}
          >
            {/* Drag handle — suggestion #2 */}
            <div
              className="flex-shrink-0 h-1 bg-[var(--color-studio-600)] hover:bg-[var(--color-accent-purple)] cursor-row-resize transition-colors group"
              onPointerDown={handleDragStart}
              title="Drag to resize panel"
            >
              <div className="h-full w-12 mx-auto rounded-full group-hover:bg-[var(--color-accent-purple)] transition-colors" />
            </div>

            {/* Tab bar — suggestion #1: scrollable with arrow buttons */}
            <div className="flex items-center border-b border-[var(--color-studio-600)] bg-[var(--color-studio-800)] flex-shrink-0">
              {/* Left scroll arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollTabs("left")}
                  className="flex-shrink-0 px-1 h-full flex items-center text-[var(--color-studio-400)] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Scrollable tabs */}
              <div
                ref={tabBarRef}
                className="flex items-center overflow-x-auto flex-1 scrollbar-none"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {TABS.map((tab) => (
                  <PanelTab
                    key={tab.id}
                    label={tab.label}
                    icon={tab.icon}
                    active={activeBottomPanel === tab.id}
                    shortcut={tab.shortcut}
                    onClick={() => setBottomPanel(tab.id as Parameters<typeof setBottomPanel>[0])}
                  />
                ))}
              </div>

              {/* Right scroll arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollTabs("right")}
                  className="flex-shrink-0 px-1 h-full flex items-center text-[var(--color-studio-400)] hover:text-white transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Right side controls */}
              <div className="flex items-center flex-shrink-0 border-l border-[var(--color-studio-700)] ml-auto">
                <CollabPresence projectId={projectId ?? ""} userId="dev-user" userName="Dev User" />

                <button
                  onClick={() => setShowExport(true)}
                  title="Export audio (E)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-studio-300)] hover:text-[var(--color-accent-cyan)] transition-all whitespace-nowrap"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>

                <button
                  onClick={() => setShowPerformance(true)}
                  title="Live performance mode (P)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-studio-300)] hover:text-[var(--color-accent-purple)] transition-all whitespace-nowrap"
                >
                  <Maximize2 className="w-3 h-3" />
                  Perform
                </button>

                <button
                  onClick={toggleAIPanel}
                  title="AI Assistant (A)"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all mr-1 whitespace-nowrap",
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

            {/* Panel content — suggestion #4: fade-in transition */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <PanelContent
                panel={activeBottomPanel as TabId}
                projectId={projectId ?? ""}
              />
            </div>
          </div>
        </div>

        {/* Right: AI Panel — suggestion #10: resizable */}
        {isAIPanelOpen && (
          <div
            className="flex-shrink-0 border-l border-[var(--color-studio-600)] relative flex"
            style={{ width: aiPanelWidth }}
          >
            {/* Drag handle on left edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--color-accent-purple)] transition-colors z-10"
              onPointerDown={handleAIDragStart}
              title="Drag to resize AI panel"
            />
            <div className="flex-1 min-w-0">
              <AIPanel />
            </div>
          </div>
        )}
      </div>

      {showExport     && <ExportDialog onClose={() => setShowExport(false)} />}
      {showPerformance && <PerformanceView onClose={() => setShowPerformance(false)} />}
    </div>
  );
}
