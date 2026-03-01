"use client";

import * as React from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import { cn } from "./utils";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: "horizontal" | "vertical";
  label?: string;
  className?: string;
  disabled?: boolean;
  color?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  orientation = "vertical",
  label,
  className,
  disabled = false,
  color = "var(--color-accent-purple)",
}: SliderProps) {
  return (
    <RadixSlider.Root
      value={[value]}
      onValueChange={([v]) => v !== undefined && onChange(v)}
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "relative flex touch-none select-none",
        orientation === "vertical"
          ? "h-full w-4 flex-col items-center"
          : "h-4 w-full flex-row items-center",
        className
      )}
    >
      <RadixSlider.Track
        className={cn(
          "relative grow rounded-full bg-[var(--color-studio-500)]",
          orientation === "vertical" ? "w-1.5" : "h-1.5"
        )}
      >
        <RadixSlider.Range
          className="absolute rounded-full"
          style={{ backgroundColor: color }}
        />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className={cn(
          "block h-3 w-3 rounded-full border-2 bg-white transition-all",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-purple)]",
          "hover:scale-125",
          disabled ? "cursor-not-allowed opacity-40" : "cursor-ns-resize"
        )}
        style={{ borderColor: color }}
      />
    </RadixSlider.Root>
  );
}

// Vertical fader variant – used in Mixer channel strips
export function Fader({
  value,
  onChange,
  className,
  disabled,
  label,
}: {
  value: number; // dB: -60 to +6
  onChange: (db: number) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}) {
  // Map dB to 0-1 (using log scale feel)
  const normalize = (db: number) => Math.max(0, Math.min(1, (db + 60) / 66));
  const denormalize = (n: number) => n * 66 - 60;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Slider
        value={normalize(value)}
        onChange={(n) => onChange(denormalize(n))}
        orientation="vertical"
        color="var(--color-accent-cyan)"
        disabled={disabled}
        label={label}
        className="h-28"
      />
      <span className="daw-readout text-[9px] text-[var(--color-studio-200)]">
        {value === -60 ? "-∞" : value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
      </span>
    </div>
  );
}
