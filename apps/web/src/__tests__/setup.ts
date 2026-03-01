import "@testing-library/jest-dom";
import { vi } from "vitest";

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

// Mock audio engine
vi.mock("@aihq/audio-engine", async () => {
  const actual = await vi.importActual("@aihq/audio-engine");
  return {
    ...actual,
    audioEngine: {
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
        generateDrums: vi.fn().mockResolvedValue({ steps: new Array(16).fill(false), velocities: new Array(16).fill(100) }),
        generateMelody: vi.fn().mockResolvedValue({ pitches: [60, 64, 67], durations: [0.25, 0.25, 0.5], velocities: [80, 80, 80] }),
      },
      setBpm: vi.fn(),
      setTimeSignature: vi.fn(),
      reset: vi.fn(),
    },
  };
});
