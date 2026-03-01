"use client";

import * as React from "react";
import { Plus, X, Power } from "lucide-react";
import { Knob, cn } from "@aihq/ui";
import { useTracksStore } from "@/stores/tracksStore";
import { getEffectsChain } from "@/hooks/useAudioSync";

type EffectType = "reverb" | "delay" | "eq3" | "compressor" | "distortion";

interface EffectState {
  id: string;
  type: EffectType;
  enabled: boolean;
  params: Record<string, number>;
}

const EFFECT_DEFAULTS: Record<EffectType, Record<string, number>> = {
  reverb:     { decay: 1.5, wet: 0.3 },
  delay:      { delayTime: 0.25, feedback: 0.3, wet: 0.3 },
  eq3:        { low: 0, mid: 0, high: 0 },
  compressor: { threshold: -24, ratio: 4, attack: 0.003, release: 0.25, knee: 10 },
  distortion: { distortion: 0.4, wet: 0.3 },
};

const PARAM_RANGES: Record<string, [number, number, number]> = {
  // [min, max, decimals]
  decay:      [0.1, 10,    1],
  wet:        [0,   1,     2],
  delayTime:  [0.01, 1,    2],
  feedback:   [0,   0.95,  2],
  low:        [-24, 24,    1],
  mid:        [-24, 24,    1],
  high:       [-24, 24,    1],
  threshold:  [-60, 0,     1],
  ratio:      [1,   20,    1],
  attack:     [0.001, 0.5, 3],
  release:    [0.01, 2,    2],
  knee:       [0,   40,    1],
  distortion: [0,   1,     2],
};

const EFFECT_NAMES: Record<EffectType, string> = {
  reverb:     "Reverb",
  delay:      "Delay",
  eq3:        "EQ",
  compressor: "Comp",
  distortion: "Dist",
};

// ---------- Sub-components ----------

function ParamKnob({
  label,
  value,
  min,
  max,
  decimals,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  decimals: number;
  onChange: (v: number) => void;
}) {
  const norm = (value - min) / (max - min);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Knob
        value={norm}
        onChange={(n) => onChange(min + n * (max - min))}
        size="sm"
        color="var(--color-accent-cyan)"
        defaultValue={norm}
      />
      <span className="text-[8px] text-[var(--color-studio-300)] tabular-nums">
        {value.toFixed(decimals)}
      </span>
      <span className="text-[7px] text-[var(--color-studio-500)] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function EffectCard({
  effect,
  onToggle,
  onParamChange,
  onRemove,
}: {
  effect: EffectState;
  onToggle: () => void;
  onParamChange: (key: string, value: number) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 rounded-lg border transition-colors",
        effect.enabled
          ? "border-[var(--color-studio-500)] bg-[var(--color-studio-750)]"
          : "border-[var(--color-studio-700)] bg-[var(--color-studio-800)] opacity-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center transition-colors",
              effect.enabled
                ? "bg-[var(--color-accent-cyan)] text-black"
                : "bg-[var(--color-studio-600)] text-[var(--color-studio-400)]"
            )}
            aria-label={effect.enabled ? "Disable effect" : "Enable effect"}
          >
            <Power className="w-2.5 h-2.5" />
          </button>
          <span className="text-xs font-semibold text-white">{EFFECT_NAMES[effect.type]}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-[var(--color-studio-500)] hover:text-[var(--color-accent-red)] transition-colors"
          aria-label="Remove effect"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Params */}
      <div className="flex items-end gap-3 flex-wrap">
        {Object.entries(effect.params).map(([key, value]) => {
          const range = PARAM_RANGES[key];
          if (!range) return null;
          const [min, max, decimals] = range;
          return (
            <ParamKnob
              key={key}
              label={key}
              value={value}
              min={min}
              max={max}
              decimals={decimals}
              onChange={(v) => onParamChange(key, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ---------- Main component ----------

export function EffectsRack() {
  const { tracks, selectedTrackId } = useTracksStore();
  const [effects, setEffects] = React.useState<EffectState[]>([]);
  const prevTrackRef = React.useRef<string | null>(null);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);

  // Reset effects when track changes
  React.useEffect(() => {
    if (selectedTrackId !== prevTrackRef.current) {
      prevTrackRef.current = selectedTrackId;
      setEffects([]); // Fresh chain per track
    }
  }, [selectedTrackId]);

  if (!selectedTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--color-studio-400)] select-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="8" width="18" height="8" rx="2" />
          <path d="M7 12h2m4 0h2" />
        </svg>
        <p className="text-sm">Select a track to edit effects</p>
      </div>
    );
  }

  function addEffect(type: EffectType) {
    const id = crypto.randomUUID();
    const params = { ...EFFECT_DEFAULTS[type] };
    const newSlot: EffectState = { id, type, enabled: true, params };

    setEffects((prev) => {
      const next = [...prev, newSlot];
      // Sync to audio engine
      const fx = getEffectsChain(selectedTrackId!);
      if (fx) fx.addEffect(id, type, params);
      return next;
    });
  }

  function removeEffect(id: string) {
    setEffects((prev) => {
      const next = prev.filter((e) => e.id !== id);
      getEffectsChain(selectedTrackId!)?.removeEffect(id);
      return next;
    });
  }

  function toggleEffect(id: string) {
    setEffects((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e, enabled: !e.enabled };
        getEffectsChain(selectedTrackId!)?.setEnabled(id, next.enabled);
        return next;
      })
    );
  }

  function setParam(id: string, key: string, value: number) {
    setEffects((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e, params: { ...e.params, [key]: value } };
        getEffectsChain(selectedTrackId!)?.setParam(id, key, value);
        return next;
      })
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-studio-800)] p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-sm font-semibold text-white">{selectedTrack.name}</p>
          <p className="text-[10px] text-[var(--color-studio-400)]">
            {effects.length} effect{effects.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Add effect buttons */}
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {(Object.keys(EFFECT_DEFAULTS) as EffectType[]).map((type) => (
            <button
              key={type}
              onClick={() => addEffect(type)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold border border-[var(--color-studio-600)] text-[var(--color-studio-300)] hover:text-white hover:border-[var(--color-accent-cyan)] hover:text-[var(--color-accent-cyan)] transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              {EFFECT_NAMES[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Effects chain */}
      {effects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--color-studio-500)]">
          <p className="text-xs">No effects added</p>
          <p className="text-[10px]">Click an effect button above to add one</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {effects.map((effect) => (
            <EffectCard
              key={effect.id}
              effect={effect}
              onToggle={() => toggleEffect(effect.id)}
              onParamChange={(k, v) => setParam(effect.id, k, v)}
              onRemove={() => removeEffect(effect.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
