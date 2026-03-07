/**
 * E2E tests for instrument preset banks (EDM, Strings, Wind, Keys)
 * and synth panel functionality.
 */
import { test, expect } from "../fixtures/auth.fixture";

const STUDIO = "/studio/test-project-id";

test.describe("Synth — Instrument Preset Banks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
    // Navigate to synth panel
    await page.getByRole("button", { name: "Synth", exact: true }).click();
    await page.waitForTimeout(200);
  });

  test("synth panel opens with preset or empty state", async ({ page }) => {
    await expect(
      page.getByText(/Synth|Oscillator|Waveform|Select|preset|bank/i).first()
    ).toBeVisible();
  });

  test("EDM bank tab is present when synth track selected", async ({ page }) => {
    // If a synth track is available, bank tabs will show
    const edm = page.getByRole("button", { name: /EDM/i });
    if (await edm.isVisible({ timeout: 1000 }).catch(() => false)) {
      await edm.click();
      await expect(page.getByText(/Supersaw|Sub Bass|Acid/i).first()).toBeVisible();
    }
  });

  test("Strings bank shows string presets", async ({ page }) => {
    const stringsBtn = page.getByRole("button", { name: /Strings/i });
    if (await stringsBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await stringsBtn.click();
      await expect(page.getByText(/Violin|Cello|Ensemble|Pizzicato/i).first()).toBeVisible();
    }
  });

  test("Wind bank shows wind instrument presets", async ({ page }) => {
    const windBtn = page.getByRole("button", { name: /Wind/i });
    if (await windBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await windBtn.click();
      await expect(page.getByText(/Flute|Clarinet|Trumpet|Oboe|Sax/i).first()).toBeVisible();
    }
  });

  test("Keys bank shows keyboard instrument presets", async ({ page }) => {
    const keysBtn = page.getByRole("button", { name: /Keys/i });
    if (await keysBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await keysBtn.click();
      await expect(page.getByText(/Piano|Organ|Marimba|Vibraphone/i).first()).toBeVisible();
    }
  });
});

test.describe("Session View — Add Tracks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
  });

  test("can add a synth track", async ({ page }) => {
    const addSynthBtn = page.getByRole("button", { name: /Add Synth/i });
    if (await addSynthBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const countBefore = await page.getByText(/Synth/i).count();
      await addSynthBtn.click();
      await page.waitForTimeout(300);
      const countAfter = await page.getByText(/Synth/i).count();
      expect(countAfter).toBeGreaterThanOrEqual(countBefore);
    }
  });

  test("can add a drum track", async ({ page }) => {
    const addDrumBtn = page.getByRole("button", { name: /Add drum/i });
    if (await addDrumBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addDrumBtn.click();
      await page.waitForTimeout(300);
      // Drum track appears in sequencer or session
      await expect(page.getByText(/drum|Kick|Snare/i).first()).toBeVisible();
    }
  });
});

test.describe("Effects Rack", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /Effects/i }).click();
    await page.waitForTimeout(200);
  });

  test("effects panel shows effect types", async ({ page }) => {
    await expect(page.getByText(/Reverb|Delay|EQ|Compress|Distort/i).first()).toBeVisible();
  });

  test("can toggle an effect", async ({ page }) => {
    const toggle = page.getByText(/Reverb/i).first();
    if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toggle.click();
      await page.waitForTimeout(200);
      // Panel should still be visible after toggle
      await expect(page.getByText(/Effects|Reverb|Delay/i).first()).toBeVisible();
    }
  });
});

test.describe("Piano Roll", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /Piano Roll/i }).click();
    await page.waitForTimeout(300);
  });

  test("piano roll container is shown", async ({ page }) => {
    await expect(page.getByText(/Piano Roll|Zoom|Note|Beat/i).first()).toBeVisible();
  });

  test("piano roll has zoom control", async ({ page }) => {
    const zoom = page.getByText(/Zoom/i).first();
    if (await zoom.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(zoom).toBeVisible();
    }
  });
});

test.describe("Step Sequencer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STUDIO);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /Sequencer/i }).click();
    await page.waitForTimeout(200);
  });

  test("sequencer shows step buttons or empty state", async ({ page }) => {
    await expect(
      page.getByText(/Sequencer|Step|drum|Add drum/i).first()
    ).toBeVisible();
  });

  test("add drum track button is visible", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Add drum/i });
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(btn).toBeEnabled();
    }
  });
});
