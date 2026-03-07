import type { Meta, StoryObj } from "@storybook/react";
import { DJDeckCard } from "./dj-deck-card";

const meta: Meta<typeof DJDeckCard> = {
  title: "DJ/DJDeckCard",
  component: DJDeckCard,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#060609" }],
    },
  },
  argTypes: {
    deckId:       { control: { type: "select" }, options: ["A", "B", "C", "D"] },
    volume:       { control: { type: "range", min: 0,   max: 100, step: 1 } },
    playbackRate: { control: { type: "range", min: 0.5, max: 2.0, step: 0.05 } },
    bpm:          { control: { type: "range", min: 60,  max: 200, step: 1 } },
    eqLow:        { control: { type: "range", min: -15, max: 6,   step: 0.5 } },
    eqMid:        { control: { type: "range", min: -15, max: 6,   step: 0.5 } },
    eqHigh:       { control: { type: "range", min: -15, max: 6,   step: 0.5 } },
    filter:       { control: { type: "range", min: 0,   max: 1,   step: 0.01 } },
    reverb:       { control: { type: "range", min: 0,   max: 1,   step: 0.01 } },
    delay:        { control: { type: "range", min: 0,   max: 1,   step: 0.01 } },
  },
};

export default meta;
type Story = StoryObj<typeof DJDeckCard>;

// ── Stories ────────────────────────────────────────────────────────────────

export const EmptyDeckA: Story = {
  args: { deckId: "A" },
};

export const LoadedAndPlaying: Story = {
  args: {
    deckId:       "A",
    fileName:     "techno_break_128bpm.wav",
    isLoaded:     true,
    isPlaying:    true,
    volume:       80,
    playbackRate: 1.0,
    bpm:          128,
  },
};

export const WithEQAndFX: Story = {
  args: {
    deckId:       "B",
    fileName:     "bassline_loop.mp3",
    isLoaded:     true,
    isPlaying:    false,
    volume:       65,
    playbackRate: 1.04,
    bpm:          130,
    eqLow:        3,
    eqMid:        -2,
    eqHigh:       1,
    filter:       0.7,
    reverb:       0.2,
    delay:        0.15,
    loop:         true,
  },
};

export const DeckC_Loading: Story = {
  args: {
    deckId:    "C",
    isLoading: true,
  },
};

export const DeckD_FullFX: Story = {
  args: {
    deckId:       "D",
    fileName:     "vocal_chop_96bpm.flac",
    isLoaded:     true,
    isPlaying:    true,
    volume:       90,
    playbackRate: 0.75,
    bpm:          96,
    eqLow:        -8,
    eqMid:        4,
    eqHigh:       6,
    filter:       0.3,
    reverb:       0.6,
    delay:        0.4,
    loop:         true,
  },
};

/** Show all 4 decks side-by-side, like the actual DJMixer layout */
export const AllFourDecks: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
      <DJDeckCard deckId="A" fileName="kick_loop.wav"  isLoaded isPlaying volume={80} bpm={128} eqLow={2} />
      <DJDeckCard deckId="B" fileName="synth_pad.mp3"  isLoaded           volume={60} bpm={128} reverb={0.3} />
      <DJDeckCard deckId="C" fileName="bass_drop.flac" isLoaded isPlaying volume={75} bpm={128} filter={0.6} />
      <DJDeckCard deckId="D"                                               volume={50} bpm={128} />
    </div>
  ),
};
