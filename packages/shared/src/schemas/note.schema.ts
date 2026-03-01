import { z } from "zod";

export const MidiNoteSchema = z.object({
  id: z.string(),
  pitch: z.number().int().min(0).max(127),
  velocity: z.number().int().min(1).max(127),
  startBeat: z.number().nonnegative(),
  durationBeats: z.number().positive(),
});

export type MidiNote = z.infer<typeof MidiNoteSchema>;
