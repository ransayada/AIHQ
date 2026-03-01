import { test, expect } from "../fixtures/auth.fixture";

test.describe("Transport Bar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/studio/test-project-id");
    await page.waitForLoadState("networkidle");
  });

  test("renders transport bar", async ({ page }) => {
    await expect(page.getByTestId("transport-bar")).toBeVisible();
  });

  test("shows default BPM of 120", async ({ page }) => {
    await expect(page.getByTestId("bpm-value")).toHaveText("120");
  });

  test("shows position display", async ({ page }) => {
    await expect(page.getByTestId("transport-position")).toBeVisible();
  });

  test("play and stop via button", async ({ page }) => {
    const playStopBtn = page.getByTestId("transport-play-stop");
    await playStopBtn.click();

    // After clicking play, the button should toggle state
    await page.waitForTimeout(200);

    // Click again to stop
    await playStopBtn.click();
    await expect(playStopBtn).toBeVisible();
  });

  test("play and stop via Space key", async ({ page }) => {
    // Focus the page (not an input)
    await page.click("body");

    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    await page.keyboard.press("Space");

    await expect(page.getByTestId("transport-bar")).toBeVisible();
  });

  test("BPM click opens editor", async ({ page }) => {
    await page.getByTestId("bpm-value").click();
    await expect(page.locator("input[type='number']")).toBeVisible();
  });
});
