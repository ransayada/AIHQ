/**
 * Feature flags — env-var-driven, zero-cost, zero-dependency.
 *
 * Set flags in .env:
 *   NEXT_PUBLIC_FLAG_COLLAB=true
 *   NEXT_PUBLIC_FLAG_DJ=true
 *
 * Usage:
 *   import { flags } from "@/lib/flags";
 *   if (flags.collab) { ... }
 *
 * All flags are read-only at startup and never mutate at runtime, which
 * means Next.js can statically optimize components gated behind them.
 */

function env(key: string, fallback = false): boolean {
  const val = process.env[key];
  if (val === undefined) return fallback;
  return val === "true" || val === "1";
}

export const flags = {
  /** Real-time collaboration via Yjs WebSocket */
  collab:      env("NEXT_PUBLIC_FLAG_COLLAB",      true),
  /** DJ dual-deck mode */
  dj:          env("NEXT_PUBLIC_FLAG_DJ",          true),
  /** Sample library + S3 upload */
  samples:     env("NEXT_PUBLIC_FLAG_SAMPLES",     true),
  /** MIDI controller mapping */
  midi:        env("NEXT_PUBLIC_FLAG_MIDI",        true),
  /** Stem export via MediaRecorder */
  stemExport:  env("NEXT_PUBLIC_FLAG_STEM_EXPORT", true),
  /** AI Mastering panel */
  mastering:   env("NEXT_PUBLIC_FLAG_MASTERING",   true),
  /** Live performance 8-pad mode */
  performance: env("NEXT_PUBLIC_FLAG_PERFORMANCE", true),
  /** Public share links */
  sharing:     env("NEXT_PUBLIC_FLAG_SHARING",     true),
  /** Plugin browser */
  plugins:     env("NEXT_PUBLIC_FLAG_PLUGINS",     true),
  /** Version history snapshots */
  history:     env("NEXT_PUBLIC_FLAG_HISTORY",     true),
  /** Show Storybook link in dev toolbar */
  storybook:   env("NEXT_PUBLIC_FLAG_STORYBOOK",   process.env.NODE_ENV === "development"),
} as const;

export type Flags = typeof flags;
