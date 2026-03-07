"use client";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface BuiltInPlugin {
  id:          string;
  name:        string;
  description: string;
  category:    "dynamics" | "fx" | "utility" | "creative";
  author:      string;
  version:     string;
  tags:        string[];
}

export const BUILTIN_PLUGINS: BuiltInPlugin[] = [
  {
    id:          "analog-warmth",
    name:        "Analog Warmth",
    description: "Gentle tube saturation + soft-knee compression. Adds harmonic richness to any track.",
    category:    "dynamics",
    author:      "AIHQ Labs",
    version:     "1.0.0",
    tags:        ["saturation", "warmth", "vintage"],
  },
  {
    id:          "stereo-widener",
    name:        "Stereo Widener",
    description: "Mid/Side processing with haas-effect spread control. Makes mixes feel wider without causing mono issues.",
    category:    "utility",
    author:      "AIHQ Labs",
    version:     "1.0.0",
    tags:        ["stereo", "width", "spatial"],
  },
  {
    id:          "vintage-tape",
    name:        "Vintage Tape",
    description: "Tape saturation simulation with subtle wow/flutter and a warm high-frequency rolloff.",
    category:    "fx",
    author:      "AIHQ Labs",
    version:     "1.0.0",
    tags:        ["tape", "vintage", "lo-fi"],
  },
  {
    id:          "sidechain-pump",
    name:        "Sidechain Pump",
    description: "Rhythmic volume ducking triggered on every beat. Classic EDM and house pump effect.",
    category:    "dynamics",
    author:      "AIHQ Labs",
    version:     "1.1.0",
    tags:        ["sidechain", "pump", "edm"],
  },
  {
    id:          "bit-crusher",
    name:        "Bit Crusher",
    description: "Reduce bit depth and sample rate for classic lo-fi crunch and retro chip-tune textures.",
    category:    "creative",
    author:      "AIHQ Labs",
    version:     "1.0.0",
    tags:        ["lo-fi", "retro", "creative"],
  },
  {
    id:          "auto-pan",
    name:        "Auto Pan",
    description: "Rhythmic panning that moves the signal in the stereo field at a synced rate.",
    category:    "fx",
    author:      "AIHQ Labs",
    version:     "1.0.0",
    tags:        ["pan", "motion", "spatial"],
  },
  {
    id:          "transient-shaper",
    name:        "Transient Shaper",
    description: "Punch up or soften the attack and sustain of percussive sounds independently.",
    category:    "dynamics",
    author:      "AIHQ Labs",
    version:     "1.0.0",
    tags:        ["transient", "drum", "punch"],
  },
  {
    id:          "pitch-shifter",
    name:        "Pitch Shifter",
    description: "Real-time pitch shifting up to ±12 semitones with formant preservation.",
    category:    "creative",
    author:      "AIHQ Labs",
    version:     "1.0.0",
    tags:        ["pitch", "creative", "transform"],
  },
];

interface PluginState {
  activePluginIds: string[];

  activatePlugin:   (id: string) => void;
  deactivatePlugin: (id: string) => void;
  isActive:         (id: string) => boolean;
}

export const usePluginStore = create<PluginState>()(
  devtools(
    persist(
      (set, get) => ({
        activePluginIds: [],

        activatePlugin(id) {
          if (!get().activePluginIds.includes(id)) {
            set((s) => ({ activePluginIds: [...s.activePluginIds, id] }));
          }
        },

        deactivatePlugin(id) {
          set((s) => ({ activePluginIds: s.activePluginIds.filter((x) => x !== id) }));
        },

        isActive(id) { return get().activePluginIds.includes(id); },
      }),
      { name: "aihq-plugins" }
    ),
    { name: "PluginStore" }
  )
);
