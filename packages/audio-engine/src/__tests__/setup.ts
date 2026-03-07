// Mock Tone.js globally — jsdom has no Web Audio API
import { vi } from "vitest";

vi.mock("tone", () => {
  const mockTransport = {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    scheduleRepeat: vi.fn(),
    clear: vi.fn(),
    bpm: { value: 120 },
    timeSignature: [4, 4] as [number, number],
    position: "0:0:0" as string,
    state: "stopped" as string,
  };

  return {
    getTransport: vi.fn(() => mockTransport),
    start: vi.fn().mockResolvedValue(undefined),
    getContext: vi.fn(() => ({
      resume: vi.fn().mockResolvedValue(undefined),
    })),
    Sequence: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      dispose: vi.fn(),
    })),
    PolySynth: vi.fn().mockImplementation(() => ({
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      triggerAttackRelease: vi.fn(),
      set: vi.fn(),
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    Sampler: vi.fn().mockImplementation(() => ({
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      loaded: Promise.resolve(),
      dispose: vi.fn(),
    })),
    Reverb: vi.fn().mockImplementation(() => ({
      wet: { value: 0.5 },
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    FeedbackDelay: vi.fn().mockImplementation(() => ({
      wet: { value: 0.3 },
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    EQ3: vi.fn().mockImplementation(() => ({
      low: { value: 0 },
      mid: { value: 0 },
      high: { value: 0 },
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    Compressor: vi.fn().mockImplementation(() => ({
      threshold: { value: -24 },
      ratio: { value: 4 },
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    Distortion: vi.fn().mockImplementation(() => ({
      distortion: 0.4,
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    Filter: vi.fn().mockImplementation(() => ({
      frequency: { rampTo: vi.fn(), value: 20000 },
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    Player: vi.fn().mockImplementation(() => ({
      loaded: true,
      playbackRate: 1,
      loop: false,
      buffer: { duration: 60, loaded: true },
      load: vi.fn().mockResolvedValue(undefined),
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      dispose: vi.fn(),
    })),
    Analyser: vi.fn().mockImplementation(() => ({
      getValue: vi.fn().mockReturnValue(new Float32Array(128)),
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    loaded: vi.fn().mockResolvedValue(undefined),
    now: vi.fn().mockReturnValue(0),
    Channel: vi.fn().mockImplementation(() => ({
      volume: { value: 0 },
      pan: { value: 0 },
      mute: false,
      solo: false,
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    Gain: vi.fn().mockImplementation(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    Limiter: vi.fn().mockImplementation(() => ({
      connect: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    MetalSynth: vi.fn().mockImplementation(() => ({
      triggerAttackRelease: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
    Synth: vi.fn().mockImplementation(() => ({
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      triggerAttackRelease: vi.fn(),
      set: vi.fn(),
      toDestination: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
  };
});
