/**
 * Convert beats to seconds given BPM
 */
export function beatsToSeconds(beats: number, bpm: number): number {
  return (beats / bpm) * 60;
}

/**
 * Convert seconds to beats given BPM
 */
export function secondsToBeats(seconds: number, bpm: number): number {
  return (seconds / 60) * bpm;
}

/**
 * Convert bars to beats (beats per bar defaults to 4)
 */
export function barsToBeats(bars: number, beatsPerBar = 4): number {
  return bars * beatsPerBar;
}

/**
 * Parse a Tone.js transport position string (e.g. "1:2:3") to bar, beat, tick
 */
export function parsePosition(position: string): { bar: number; beat: number; tick: number } {
  const parts = position.split(":").map(Number);
  return {
    bar: parts[0] ?? 0,
    beat: parts[1] ?? 0,
    tick: parts[2] ?? 0,
  };
}

/**
 * Format position for display (1-indexed, musical notation)
 */
export function formatPosition(position: string): string {
  const { bar, beat } = parsePosition(position);
  return `${bar + 1}:${beat + 1}`;
}
