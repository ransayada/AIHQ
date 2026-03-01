"use client";

import * as React from "react";
import { cn } from "./utils";

interface MeterProps {
  analyserNode: AnalyserNode | null;
  orientation?: "vertical" | "horizontal";
  showPeak?: boolean;
  className?: string;
}

export function Meter({
  analyserNode,
  orientation = "vertical",
  showPeak = true,
  className,
}: MeterProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number>(0);
  const peakRef = React.useRef({ level: -Infinity, holdTime: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    function draw() {
      if (!canvas || !analyserNode) return;
      rafRef.current = requestAnimationFrame(draw);

      analyserNode.getFloatTimeDomainData(dataArray);

      // RMS calculation
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i] ?? 0;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / bufferLength);
      const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

      // Peak hold
      const now = performance.now();
      if (db > peakRef.current.level) {
        peakRef.current = { level: db, holdTime: now };
      } else if (now - peakRef.current.holdTime > 1500) {
        peakRef.current.level = Math.max(peakRef.current.level - 0.5, -60);
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Normalize dB to 0-1 (-60dB = 0, 0dB = 1)
      const level = Math.max(0, Math.min(1, (db + 60) / 60));
      const peak = Math.max(0, Math.min(1, (peakRef.current.level + 60) / 60));

      if (orientation === "vertical") {
        const h = height * level;
        // Draw segments
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "#00e676");
        gradient.addColorStop(0.7, "#00e676");
        gradient.addColorStop(0.85, "#ffea00");
        gradient.addColorStop(1, "#ff1744");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height - h, width, h);

        if (showPeak && peakRef.current.level > -60) {
          const peakY = height - height * peak;
          ctx.fillStyle = peakRef.current.level > -6 ? "#ff1744" : "#fff";
          ctx.fillRect(0, peakY - 1, width, 2);
        }
      } else {
        const w = width * level;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "#00e676");
        gradient.addColorStop(0.7, "#00e676");
        gradient.addColorStop(0.85, "#ffea00");
        gradient.addColorStop(1, "#ff1744");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, height);

        if (showPeak && peakRef.current.level > -60) {
          const peakX = width * peak;
          ctx.fillStyle = peakRef.current.level > -6 ? "#ff1744" : "#fff";
          ctx.fillRect(peakX - 1, 0, 2, height);
        }
      }
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserNode, orientation, showPeak]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "rounded-sm",
        orientation === "vertical" ? "w-2 h-28" : "h-2 w-full",
        className
      )}
    />
  );
}
