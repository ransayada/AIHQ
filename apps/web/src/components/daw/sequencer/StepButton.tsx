"use client";

import * as React from "react";
import { cn } from "@aihq/ui";

interface StepButtonProps {
  isActive: boolean;
  isCurrentStep: boolean;
  step: number;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  color?: string;
}

/**
 * Memoized step button — only re-renders when its own state changes.
 * With 9 tracks × 16 steps = 144 buttons, this is critical for performance.
 */
export const StepButton = React.memo(function StepButton({
  isActive,
  isCurrentStep,
  step,
  onClick,
  onContextMenu,
  color = "var(--color-accent-purple)",
}: StepButtonProps) {
  // Group steps visually: dim every 4th boundary
  const isBarStart = step % 4 === 0;
  const isHalfStep = step % 2 !== 0;

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "relative w-8 h-7 rounded-sm border transition-none outline-none",
        "focus-visible:ring-1 focus-visible:ring-[var(--color-accent-purple)]",
        isActive
          ? "border-transparent"
          : isBarStart
          ? "border-[var(--color-studio-400)] bg-[var(--color-studio-700)]"
          : "border-[var(--color-studio-500)] bg-[var(--color-studio-600)]",
        !isActive && "hover:bg-[var(--color-studio-500)]",
        isHalfStep && !isActive && "opacity-70"
      )}
      style={
        isActive
          ? {
              backgroundColor: isCurrentStep ? "white" : color,
              boxShadow: isCurrentStep
                ? `0 0 8px white`
                : `0 0 6px ${color}88`,
            }
          : isCurrentStep
          ? {
              backgroundColor: "var(--color-studio-500)",
              borderColor: "var(--color-accent-cyan)",
              boxShadow: "0 0 4px var(--color-accent-cyan)",
            }
          : undefined
      }
      aria-pressed={isActive}
      aria-label={`Step ${step + 1} ${isActive ? "active" : "inactive"}`}
      data-step={step}
    />
  );
});
