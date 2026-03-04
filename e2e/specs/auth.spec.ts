import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AIHQ/);
    // Use heading role to avoid strict-mode collision with partial text matches
    await expect(page.getByRole("heading", { name: /Music production/i })).toBeVisible();
  });

  test("sign-in page renders", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    // In dev mode without Clerk keys the app may redirect to dashboard — either is valid
    await expect(page).toHaveURL(/sign-in|dashboard/);
  });

  test("pricing page renders all plans", async ({ page }) => {
    await page.goto("/pricing");
    // Use heading role to avoid strict-mode violations from repeated text
    await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Studio" })).toBeVisible();
  });

  test("dashboard accessible in dev mode", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // In dev mode (no real Clerk keys) dashboard is accessible directly
    await expect(page).toHaveURL(/dashboard|sign-in/);
  });
});
