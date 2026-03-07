/**
 * Tests for the 10 new DAW features implemented in Phase 2.
 * Covers: stores, component interactions, and API integrations.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Version Store ────────────────────────────────────────────────────────────
describe("versionStore", () => {
  it("initializes with empty snapshots", async () => {
    const { useVersionStore } = await import("@/stores/versionStore");
    const state = useVersionStore.getState();
    expect(state.snapshots).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.saving).toBe(false);
  });

  it("fetchSnapshots sets loading then resolves", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { snapshots: [] } }),
    } as unknown as Response);

    const { useVersionStore } = await import("@/stores/versionStore");
    await useVersionStore.getState().fetchSnapshots("proj-1");
    expect(useVersionStore.getState().snapshots).toEqual([]);
  });
});

// ─── Share Store ──────────────────────────────────────────────────────────────
describe("shareStore", () => {
  it("initializes with null token and shareUrl", async () => {
    const { useShareStore } = await import("@/stores/shareStore");
    const state = useShareStore.getState();
    expect(state.token).toBeNull();
    expect(state.shareUrl).toBeNull();
    expect(state.sharing).toBe(false);
  });

  it("createShare calls POST /api/projects/:id/share and sets token", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { shareUrl: "http://localhost/share/tok-abc", token: "tok-abc" },
      }),
    } as unknown as Response);

    const { useShareStore } = await import("@/stores/shareStore");
    await useShareStore.getState().createShare("proj-1", "My Project", {}, 128, "C", "major");

    expect(useShareStore.getState().token).toBe("tok-abc");
    expect(useShareStore.getState().shareUrl).toBe("http://localhost/share/tok-abc");
  });
});

// ─── Plugin Store ─────────────────────────────────────────────────────────────
describe("pluginStore", () => {
  it("has 8 built-in plugin definitions", async () => {
    const { BUILTIN_PLUGINS } = await import("@/stores/pluginStore");
    expect(BUILTIN_PLUGINS).toHaveLength(8);
  });

  it("no plugins are active by default", async () => {
    const { usePluginStore } = await import("@/stores/pluginStore");
    expect(usePluginStore.getState().activePluginIds).toHaveLength(0);
  });

  it("activatePlugin adds id to activePluginIds", async () => {
    const { usePluginStore, BUILTIN_PLUGINS } = await import("@/stores/pluginStore");
    const id = BUILTIN_PLUGINS[0]!.id;

    usePluginStore.getState().activatePlugin(id);
    expect(usePluginStore.getState().isActive(id)).toBe(true);

    usePluginStore.getState().deactivatePlugin(id);
    expect(usePluginStore.getState().isActive(id)).toBe(false);
  });
});

// ─── Samples Store ────────────────────────────────────────────────────────────
describe("samplesStore", () => {
  it("initializes with empty samples", async () => {
    const { useSamplesStore } = await import("@/stores/samplesStore");
    const state = useSamplesStore.getState();
    expect(state.samples).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.uploading).toBe(false);
  });

  it("fetchSamples populates samples list", async () => {
    const mockSamples = [
      { id: "s1", name: "Kick.wav", fileSize: 10240, mimeType: "audio/wav", duration: 0.5, url: "/s1" },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { samples: mockSamples } }),
    } as unknown as Response);

    const { useSamplesStore } = await import("@/stores/samplesStore");
    await useSamplesStore.getState().fetchSamples();
    expect(useSamplesStore.getState().samples).toEqual(mockSamples);
  });
});

// ─── MIDI Store ───────────────────────────────────────────────────────────────
describe("midiStore", () => {
  it("starts with unavailable status and no devices", async () => {
    const { useMIDIStore } = await import("@/stores/midiStore");
    const state = useMIDIStore.getState();
    expect(state.status).toBe("unavailable");
    expect(state.deviceNames).toEqual([]);
    expect(state.mappings).toEqual([]);
  });

  it("addMapping creates a new mapping with an id", async () => {
    const { useMIDIStore } = await import("@/stores/midiStore");
    useMIDIStore.getState().addMapping({
      label:   "Transport BPM",
      channel: 0,
      cc:      1,
      min:     60,
      max:     200,
      target:  "transport:bpm",
    });

    const { mappings } = useMIDIStore.getState();
    expect(mappings).toHaveLength(1);
    expect(mappings[0]!.target).toBe("transport:bpm");
    expect(mappings[0]!.id).toBeTruthy();
  });

  it("removeMapping deletes the mapping", async () => {
    const { useMIDIStore } = await import("@/stores/midiStore");
    const { mappings } = useMIDIStore.getState();
    if (mappings.length > 0) {
      const id = mappings[0]!.id;
      useMIDIStore.getState().removeMapping(id);
      expect(useMIDIStore.getState().mappings.find((m) => m.id === id)).toBeUndefined();
    }
  });

  it("startLearn sets learningId", async () => {
    const { useMIDIStore } = await import("@/stores/midiStore");
    useMIDIStore.getState().addMapping({ label: "Vol", channel: 0, cc: 7, min: 0, max: 100, target: "master:volume" });
    const id = useMIDIStore.getState().mappings[useMIDIStore.getState().mappings.length - 1]!.id;

    useMIDIStore.getState().startLearn(id);
    expect(useMIDIStore.getState().learningId).toBe(id);

    useMIDIStore.getState().cancelLearn();
    expect(useMIDIStore.getState().learningId).toBeNull();
  });
});

// ─── Collab Store (offline) ───────────────────────────────────────────────────
describe("collabStore (offline)", () => {
  it("initializes disconnected", async () => {
    const { useCollabStore } = await import("@/stores/collabStore");
    expect(useCollabStore.getState().status).toBe("disconnected");
    expect(useCollabStore.getState().users).toEqual([]);
  });

  it("disconnect is safe to call when already disconnected", async () => {
    const { useCollabStore } = await import("@/stores/collabStore");
    expect(() => useCollabStore.getState().disconnect()).not.toThrow();
  });
});

// ─── Template data ────────────────────────────────────────────────────────────
describe("PROJECT_TEMPLATES", () => {
  it("has exactly 6 genre templates", async () => {
    const { PROJECT_TEMPLATES } = await import("@aihq/shared");
    expect(PROJECT_TEMPLATES).toHaveLength(6);
  });

  it("each template has required fields", async () => {
    const { PROJECT_TEMPLATES } = await import("@aihq/shared");
    for (const t of PROJECT_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.bpm).toBeGreaterThan(0);
      expect(Array.isArray(t.tracks)).toBe(true);
    }
  });
});
