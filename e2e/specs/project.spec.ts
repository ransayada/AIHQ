import { test, expect } from "../fixtures/auth.fixture";

test.describe("Project Management", () => {
  test("dashboard shows project list", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // Should see the dashboard
    await expect(page.getByText("Your Projects")).toBeVisible();
  });

  test("can navigate to studio", async ({ page }) => {
    await page.goto("/studio/test-project-id");
    await page.waitForLoadState("networkidle");
    // Transport bar should be visible in the studio
    await expect(page.getByTestId("transport-bar")).toBeVisible();
  });

  test("step sequencer panel tab switches", async ({ page }) => {
    await page.goto("/studio/test-project-id");
    await page.waitForLoadState("networkidle");

    // Click Mixer tab
    await page.getByText("Mixer").click();
    await expect(page.getByText("Add Channel")).toBeVisible();
  });
});
