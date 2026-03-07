/** Project templates — predefined genre starters. */

export interface TemplateStep {
  active:   boolean;
  velocity: number;
}

export interface TemplateTrack {
  name:        string;
  type:        "synth" | "drum";
  instrument:  string;
  color:       string;
  steps:       TemplateStep[];
}

export interface ProjectTemplate {
  id:          string;
  name:        string;
  genre:       string;
  description: string;
  bpm:         number;
  key:         string;
  scale:       string;
  tracks:      TemplateTrack[];
  emoji:       string;
}

const OFF: TemplateStep = { active: false, velocity: 100 };
const ON:  TemplateStep = { active: true,  velocity: 100 };
const SFT: TemplateStep = { active: true,  velocity: 70  };

function steps(...pattern: TemplateStep[]): TemplateStep[] {
  const out: TemplateStep[] = [];
  while (out.length < 16) out.push(...pattern.slice(0, 16 - out.length));
  return out.slice(0, 16);
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "edm",
    name: "EDM Drop",
    genre: "Electronic",
    description: "4-on-the-floor kick, punchy snare, driving bass, and a soaring lead",
    bpm: 140,
    key: "A",
    scale: "minor",
    emoji: "⚡",
    tracks: [
      {
        name: "Kick",
        type: "drum",
        instrument: "kick",
        color: "#ef4444",
        steps: steps(ON, OFF, OFF, OFF, ON, OFF, OFF, OFF, ON, OFF, OFF, OFF, ON, OFF, OFF, OFF),
      },
      {
        name: "Snare",
        type: "drum",
        instrument: "snare",
        color: "#f97316",
        steps: steps(OFF, OFF, OFF, OFF, ON, OFF, OFF, OFF, OFF, OFF, OFF, OFF, ON, OFF, OFF, OFF),
      },
      {
        name: "Hi-Hat",
        type: "drum",
        instrument: "hihat",
        color: "#eab308",
        steps: steps(SFT, OFF, ON, OFF, SFT, OFF, ON, OFF, SFT, OFF, ON, OFF, SFT, OFF, ON, OFF),
      },
      {
        name: "Bass",
        type: "synth",
        instrument: "bass",
        color: "#7c3aed",
        steps: Array(16).fill(OFF),
      },
    ],
  },
  {
    id: "lofi",
    name: "Lo-Fi Study",
    genre: "Lo-Fi Hip-Hop",
    description: "Chill boom-bap drums, dusty piano, and a warm bass line",
    bpm: 85,
    key: "F",
    scale: "major",
    emoji: "☕",
    tracks: [
      {
        name: "Kick",
        type: "drum",
        instrument: "kick",
        color: "#78716c",
        steps: steps(ON, OFF, OFF, OFF, OFF, OFF, ON, OFF, ON, OFF, OFF, ON, OFF, OFF, OFF, OFF),
      },
      {
        name: "Snare",
        type: "drum",
        instrument: "snare",
        color: "#a8a29e",
        steps: steps(OFF, OFF, OFF, OFF, ON, OFF, OFF, SFT, OFF, OFF, OFF, OFF, ON, OFF, SFT, OFF),
      },
      {
        name: "Piano",
        type: "synth",
        instrument: "keys",
        color: "#06b6d4",
        steps: Array(16).fill(OFF),
      },
      {
        name: "Bass",
        type: "synth",
        instrument: "bass",
        color: "#10b981",
        steps: Array(16).fill(OFF),
      },
    ],
  },
  {
    id: "hiphop",
    name: "Hip-Hop Banger",
    genre: "Hip-Hop",
    description: "Punchy 808s, aggressive snare, shakers, and a melodic top-line",
    bpm: 95,
    key: "C",
    scale: "minor",
    emoji: "🎤",
    tracks: [
      {
        name: "808 Kick",
        type: "drum",
        instrument: "kick",
        color: "#dc2626",
        steps: steps(ON, OFF, OFF, SFT, OFF, OFF, ON, OFF, ON, OFF, SFT, OFF, OFF, ON, OFF, OFF),
      },
      {
        name: "Snare",
        type: "drum",
        instrument: "snare",
        color: "#9333ea",
        steps: steps(OFF, OFF, OFF, OFF, ON, OFF, OFF, OFF, OFF, OFF, OFF, OFF, ON, OFF, OFF, OFF),
      },
      {
        name: "Hi-Hat",
        type: "drum",
        instrument: "hihat",
        color: "#f59e0b",
        steps: steps(ON, OFF, ON, OFF, ON, ON, ON, OFF, ON, OFF, ON, OFF, ON, ON, ON, OFF),
      },
      {
        name: "Melody",
        type: "synth",
        instrument: "lead",
        color: "#06b6d4",
        steps: Array(16).fill(OFF),
      },
    ],
  },
  {
    id: "trap",
    name: "Dark Trap",
    genre: "Trap",
    description: "Thunderous 808, snappy snare, rapid hi-hat rolls, and a sinister arp",
    bpm: 140,
    key: "G",
    scale: "minor",
    emoji: "🔥",
    tracks: [
      {
        name: "808 Bass",
        type: "drum",
        instrument: "kick",
        color: "#7f1d1d",
        steps: steps(ON, OFF, OFF, OFF, OFF, OFF, OFF, SFT, ON, OFF, OFF, OFF, SFT, OFF, OFF, OFF),
      },
      {
        name: "Snare",
        type: "drum",
        instrument: "snare",
        color: "#450a0a",
        steps: steps(OFF, OFF, OFF, OFF, ON, OFF, OFF, OFF, OFF, OFF, OFF, OFF, ON, OFF, SFT, OFF),
      },
      {
        name: "Hi-Hat",
        type: "drum",
        instrument: "hihat",
        color: "#a16207",
        steps: steps(SFT, ON, SFT, ON, SFT, ON, ON, SFT, ON, SFT, ON, SFT, ON, SFT, ON, SFT),
      },
      {
        name: "Arp",
        type: "synth",
        instrument: "lead",
        color: "#581c87",
        steps: Array(16).fill(OFF),
      },
    ],
  },
  {
    id: "house",
    name: "Chicago House",
    genre: "House",
    description: "Classic 4/4 kick, open hi-hat, piano chords, and a deep bass",
    bpm: 126,
    key: "E",
    scale: "minor",
    emoji: "🏠",
    tracks: [
      {
        name: "Kick",
        type: "drum",
        instrument: "kick",
        color: "#1d4ed8",
        steps: steps(ON, OFF, OFF, OFF, ON, OFF, OFF, OFF, ON, OFF, OFF, OFF, ON, OFF, OFF, OFF),
      },
      {
        name: "Open HH",
        type: "drum",
        instrument: "openhat",
        color: "#0369a1",
        steps: steps(OFF, OFF, ON, OFF, OFF, OFF, ON, OFF, OFF, OFF, ON, OFF, OFF, OFF, ON, OFF),
      },
      {
        name: "Piano",
        type: "synth",
        instrument: "keys",
        color: "#7c3aed",
        steps: Array(16).fill(OFF),
      },
      {
        name: "Bass",
        type: "synth",
        instrument: "bass",
        color: "#059669",
        steps: Array(16).fill(OFF),
      },
    ],
  },
  {
    id: "ambient",
    name: "Ambient Drift",
    genre: "Ambient",
    description: "Sparse textures, evolving pads, and a gentle atmospheric melody",
    bpm: 70,
    key: "D",
    scale: "major",
    emoji: "🌊",
    tracks: [
      {
        name: "Pad",
        type: "synth",
        instrument: "pad",
        color: "#4f46e5",
        steps: Array(16).fill(OFF),
      },
      {
        name: "Lead",
        type: "synth",
        instrument: "lead",
        color: "#0e7490",
        steps: Array(16).fill(OFF),
      },
      {
        name: "Bass",
        type: "synth",
        instrument: "bass",
        color: "#064e3b",
        steps: Array(16).fill(OFF),
      },
    ],
  },
];

export function getTemplate(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}
