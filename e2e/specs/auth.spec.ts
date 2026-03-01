import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AIHQ/);
    await expect(page.getByText("Music production")).toBeVisible();
  });

  test("sign-in page renders", async ({ page }) => {
    await page.goto("/sign-in");
    // Clerk renders its own UI
    await page.waitForLoadState("networkidle");
    // Should be on sign-in page
    await expect(page).toHaveURL(/sign-in/);
  });

  test("pricing page renders all plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Pro")).toBeVisible();
    await expect(page.getByText("Studio")).toBeVisible();
  });

  test("unauthenticated access to dashboard redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to sign-in
    await page.waitForURL(/sign-in/);
  });
});
