"use client";

import * as React from "react";
import { cn } from "./utils";

interface KnobProps {
  value: number; // 0-1 normalized
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  defaultValue?: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

const SIZES = {
  sm: { outer: 28, stroke: 3 },
  md: { outer: 40, stroke: 4 },
  lg: { outer: 52, stroke: 5 },
} as const;

// Maps 0-1 to -135deg..+135deg arc (270 degrees total)
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

function valueToAngle(value: number): number {
  return MIN_ANGLE + value * (MAX_ANGLE - MIN_ANGLE);
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function Knob({
  value,
  onChange,
  label,
  unit,
  defaultValue = 0.5,
  size = "md",
  color = "var(--color-accent-purple)",
  className,
  disabled = false,
  "data-testid": testId,
}: KnobProps) {
  const { outer, stroke } = SIZES[size];
  const cx = outer / 2;
  const cy = outer / 2;
  const r = cx - stroke - 2;

  const dragging = React.useRef(false);
  const startY = React.useRef(0);
  const startValue = React.useRef(0);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (disabled) return;
      e.preventDefault();
      dragging.current = true;
      startY.current = e.clientY;
      startValue.current = value;
      (e.target as SVGSVGElement).setPointerCapture(e.pointerId);
    },
    [disabled, value]
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragging.current) return;
      const delta = (startY.current - e.clientY) / 200;
      // Shift key = fine control
      const multiplier = e.shiftKey ? 0.1 : 1;
      const next = Math.max(0, Math.min(1, startValue.current + delta * multiplier));
      onChange(next);
    },
    [onChange]
  );

  const handlePointerUp = React.useCallback(() => {
    dragging.current = false;
  }, []);

  const handleDoubleClick = React.useCallback(() => {
    if (!disabled) onChange(defaultValue);
  }, [disabled, defaultValue, onChange]);

  const angle = valueToAngle(value);
  const trackPath = arcPath(cx, cy, r, MIN_ANGLE, MAX_ANGLE);
  const valuePath = arcPath(cx, cy, r, MIN_ANGLE, angle);
  // Indicator dot position
  const dot = polarToCartesian(cx, cy, r - stroke / 2, angle);

  return (
    <div
      className={cn("flex flex-col items-center gap-0.5", className)}
      data-testid={testId}
    >
      <svg
        width={outer}
        height={outer}
        className={cn("cursor-ns-resize touch-none select-none", disabled && "cursor-not-allowed")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        style={{ overflow: "visible" }}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        aria-label={label}
      >
        {/* Track arc */}
        <path
          d={trackPath}
          fill="none"
          stroke="var(--color-studio-500)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={valuePath}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}66)` }}
        />
        {/* Indicator dot */}
        <circle cx={dot.x} cy={dot.y} r={stroke} fill={color} />
      </svg>
      {label && (
        <span className="daw-readout text-[var(--color-studio-200)] select-none" style={{ fontSize: "9px" }}>
          {label}
        </span>
      )}
    </div>
  );
}
