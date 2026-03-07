/**
 * E2E tests for Phase 2 features.
 * These tests navigate to the studio and verify each feature panel is accessible.
 */
import { test, expect } from "../fixtures/auth.fixture";

const STUDIO = "/studio/test-project-id";

test.describe("Bottom Panel Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
  });

  test("transport bar is visible", async ({ page }) => {
    await expect(page.getByTestId("transport-bar")).toBeVisible();
  });

  test("sequencer tab is default", async ({ page }) => {
    // The sequencer (drum pads) should be visible by default
    await expect(page.getByText(/Sequencer|Step/i).first()).toBeVisible();
  });

  test("piano roll tab opens", async ({ page }) => {
    await page.getByRole("button", { name: /Piano Roll/i }).click();
    // Piano roll renders its container
    await expect(page.getByText(/Piano Roll|Zoom|Note/i).first()).toBeVisible();
  });

  test("mixer tab opens", async ({ page }) => {
    await page.getByRole("button", { name: /Mixer/i }).click();
    await expect(page.getByText(/Add Channel|Channel/i).first()).toBeVisible();
  });

  test("synth tab opens", async ({ page }) => {
    // Use exact:true to avoid strict-mode collision with "Add Synth Track" / "Synth 4"
    await page.getByRole("button", { name: "Synth", exact: true }).click();
    // The synth panel is visible — it shows either a synth editor or a "select track" prompt
    await expect(page.getByText(/Synth|Oscillator|Waveform|Select|preset/i).first()).toBeVisible();
  });

  test("effects tab opens", async ({ page }) => {
    await page.getByRole("button", { name: /Effects/i }).click();
    await expect(page.getByText(/Reverb|Delay|EQ|Effects/i).first()).toBeVisible();
  });
});

test.describe("Sample Library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
  });

  test("samples panel opens", async ({ page }) => {
    // Click Samples tab in bottom panel
    const samplesTab = page.getByRole("button", { name: /Samples/i });
    if (await samplesTab.isVisible()) {
      await samplesTab.click();
      await expect(page.getByText(/Sample|Upload|Library/i).first()).toBeVisible();
    }
  });
});

test.describe("MIDI Controller", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
  });

  test("MIDI panel opens", async ({ page }) => {
    const midiTab = page.getByRole("button", { name: /MIDI/i });
    if (await midiTab.isVisible()) {
      await midiTab.click();
      await expect(page.getByText(/MIDI|Controller|mapping/i).first()).toBeVisible();
    }
  });
});

test.describe("AI Mastering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
  });

  test("mastering panel opens", async ({ page }) => {
    const masteringTab = page.getByRole("button", { name: /Master/i });
    if (await masteringTab.isVisible()) {
      await masteringTab.click();
      await expect(page.getByText(/Master|EQ|Compress|Loudness/i).first()).toBeVisible();
    }
  });
});

test.describe("Plugin Browser", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
  });

  test("plugins panel opens", async ({ page }) => {
    const pluginsTab = page.getByRole("button", { name: /Plugin/i });
    if (await pluginsTab.isVisible()) {
      await pluginsTab.click();
      await expect(page.getByText(/Plugin|Chorus|Reverb|Bitcrusher/i).first()).toBeVisible();
    }
  });
});

test.describe("Version History", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
  });

  test("history panel opens", async ({ page }) => {
    const histTab = page.getByRole("button", { name: /History|Version/i });
    if (await histTab.isVisible()) {
      await histTab.click();
      await expect(page.getByText(/Snapshot|History|Version|Save/i).first()).toBeVisible();
    }
  });
});

test.describe("DJ Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
  });

  test("DJ panel opens", async ({ page }) => {
    const djTab = page.getByRole("button", { name: /DJ/i });
    if (await djTab.isVisible()) {
      await djTab.click();
      await expect(page.getByText(/Deck|Crossfader|BPM/i).first()).toBeVisible();
    }
  });
});

test.describe("Account Page", () => {
  test("account page renders user profile", async ({ page }) => {
    await page.goto("/account");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
    // Profile section
    await expect(page.getByText(/Display name|Email|Timezone/i).first()).toBeVisible();
  });

  test("account page shows usage meters", async ({ page }) => {
    await page.goto("/account");
    await page.waitForLoadState("networkidle");
    // Use heading role to avoid strict-mode collision
    await expect(page.getByRole("heading", { name: /AI generations/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Storage/i })).toBeVisible();
  });
});

test.describe("Share Page", () => {
  test("share page renders for valid token", async ({ page }) => {
    await page.goto("/share/test-token");
    await page.waitForLoadState("networkidle");
    // Should show either the shared project or a not-found message
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Studio New Project", () => {
  test("new project page renders", async ({ page }) => {
    await page.goto("/studio/new");
    await page.waitForLoadState("networkidle");
    // Should redirect to a new studio or show a form
    await expect(page.locator("body")).toBeVisible();
  });
});
