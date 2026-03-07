import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom stubs for File/Blob APIs missing in test environment
global.URL.createObjectURL = vi.fn(() => "blob:mock-url-" + Math.random().toString(36).slice(2));
global.URL.revokeObjectURL = vi.fn();

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: "test-project-id" }),
  usePathname: () => "/studio/test-project-id",
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("mock-token"),
    isSignedIn: true,
    userId: "test-user",
  }),
  useUser: () => ({
    user: { firstName: "Test", emailAddresses: [{ emailAddress: "test@example.com" }] },
    isLoaded: true,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Pure mock for @aihq/audio-engine — never runs real Tone.js in jsdom.
// getDeck returns a STABLE mock per deckId so spy assertions work correctly.
vi.mock("@aihq/audio-engine", () => {
  const makeDeck = (id: string) => ({
    id,
    isLoaded: false,
    isPlaying: false,
    duration: 60,
    currentPosition: 0,
    load:            vi.fn().mockResolvedValue(undefined),
    play:            vi.fn(),
    pause:           vi.fn(),
    stop:            vi.fn(),
    cue:             vi.fn(),
    setVolume:       vi.fn(),
    setPlaybackRate: vi.fn(),
    setLoop:         vi.fn(),
    setEQLow:        vi.fn(),
    setEQMid:        vi.fn(),
    setEQHigh:       vi.fn(),
    setFilter:       vi.fn(),
    setReverb:       vi.fn(),
    setDelay:        vi.fn(),
    getWaveformData: vi.fn().mockReturnValue(new Float32Array(128)),
    dispose:         vi.fn(),
  });

  // Stable per-ID deck mocks so spy assertions are consistent across calls
  const deckCache: Record<string, ReturnType<typeof makeDeck>> = {
    A: makeDeck("A"),
    B: makeDeck("B"),
    C: makeDeck("C"),
    D: makeDeck("D"),
  };

  const djEngine = {
    getDeck:         vi.fn((id: string) => deckCache[id] ?? makeDeck(id)),
    setMasterVolume: vi.fn(),
    ensureStarted:   vi.fn().mockResolvedValue(undefined),
    dispose:         vi.fn(),
    deckIds:         ["A", "B", "C", "D"],
  };

  const audioEngine = {
    initialize: vi.fn().mockResolvedValue(undefined),
    isInitialized: false,
    transport: {
      play: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      setBpm: vi.fn(),
      setTimeSignature: vi.fn(),
      enableMetronome: vi.fn(),
      getPosition: vi.fn().mockReturnValue("0:0:0"),
      getState: vi.fn().mockReturnValue("stopped"),
      onPositionChange: vi.fn().mockReturnValue(() => {}),
      dispose: vi.fn(),
    },
    sequencer: {
      addTrack: vi.fn(),
      setStep: vi.fn(),
      setPattern: vi.fn(),
      dispose: vi.fn(),
    },
    mixer: {
      createChannel: vi.fn(),
      setChannelVolume: vi.fn(),
      setChannelPan: vi.fn(),
      setChannelMuted: vi.fn(),
      setSolo: vi.fn(),
      dispose: vi.fn(),
    },
    magenta: {
      init: vi.fn().mockResolvedValue(undefined),
      isLoaded: false,
      generateDrums: vi.fn().mockResolvedValue({
        steps: new Array(16).fill(false),
        velocities: new Array(16).fill(100),
      }),
      generateMelody: vi.fn().mockResolvedValue({
        pitches: [60, 64, 67],
        durations: [0.25, 0.25, 0.5],
        velocities: [80, 80, 80],
      }),
    },
    setBpm: vi.fn(),
    setTimeSignature: vi.fn(),
    reset: vi.fn(),
  };

  // Utility re-exports used by TransportBar and other components
  const formatPosition = vi.fn((pos: string) => pos ?? "0:0:0");
  const getTrackColor  = vi.fn((_idx: number) => "#7c3aed");

  return { djEngine, audioEngine, formatPosition, getTrackColor };
});
