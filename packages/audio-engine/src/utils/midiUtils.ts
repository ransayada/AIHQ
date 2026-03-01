const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

/**
 * Converts a MIDI note number (0-127) to its name (e.g., 60 → "C4")
 */
export function noteNumberToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  const name = NOTE_NAMES[noteIndex];
  if (name === undefined) throw new RangeError(`Invalid MIDI note: ${midi}`);
  return `${name}${octave}`;
}

/**
 * Converts a note name (e.g., "C4") to its MIDI number
 */
export function noteNameToNumber(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note name: ${name}`);
  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr!, 10);
  const noteIndex = NOTE_NAMES.indexOf(noteName as (typeof NOTE_NAMES)[number]);
  if (noteIndex === -1) throw new Error(`Invalid note: ${noteName}`);
  return (octave + 1) * 12 + noteIndex;
}

/**
 * Quantizes a beat position to the nearest grid value.
 * @param beat - The raw beat position
 * @param division - Grid division (e.g. 4 = quarter note, 16 = 16th note, 32 = 32nd note)
 */
export function quantizeToGrid(beat: number, division: number): number {
  const gridSize = 1 / division * 4; // Convert division to beats (4 beats per bar)
  return Math.round(beat / gridSize) * gridSize;
}

/**
 * Returns the frequency (Hz) for a given MIDI note number.
 * A4 = MIDI 69 = 440Hz
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Returns whether a MIDI note is a black key on the piano
 */
export function isBlackKey(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}

/**
 * Get all MIDI notes in a scale starting from a root note
 */
export const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
} as const;

export function getScaleNotes(root: number, scale: keyof typeof SCALE_INTERVALS): number[] {
  const intervals = SCALE_INTERVALS[scale];
  const notes: number[] = [];
  for (let octave = 0; octave <= 10; octave++) {
    for (const interval of intervals) {
      const note = root + interval + octave * 12;
      if (note >= 0 && note <= 127) notes.push(note);
    }
  }
  return notes;
}
