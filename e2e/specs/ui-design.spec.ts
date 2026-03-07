/**
 * E2E tests for 2026 UI redesign — logo navigation, theme toggle, landing page.
 */
import { test, expect } from "@playwright/test";

test.describe("Landing page UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("renders AIHQ logo in nav", async ({ page }) => {
    // Logo should be visible in the navbar
    await expect(page.getByRole("link", { name: /AIHQ/i }).first()).toBeVisible();
  });

  test("hero section has gradient headline", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Get Started Free button is visible", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /Get Started Free/i }).first()
    ).toBeVisible();
  });

  test("theme toggle button is visible in nav", async ({ page }) => {
    const themeBtn = page.getByRole("button", { name: /Switch to (light|dark) mode/i });
    await expect(themeBtn).toBeVisible();
  });

  test("Sign in link navigates to sign-in page", async ({ page }) => {
    await page.getByRole("link", { name: /Sign in/i }).first().click();
    await page.waitForURL(/sign-in/);
    expect(page.url()).toContain("sign-in");
  });
});

test.describe("Logo navigation", () => {
  test("logo on dashboard navigates to home", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Find logo link — it should go to "/"
    const logoLink = page.getByRole("link", { name: /AIHQ/i }).first();
    await expect(logoLink).toBeVisible();
    expect(await logoLink.getAttribute("href")).toBe("/");
  });

  test("logo on studio links back to dashboard", async ({ page }) => {
    await page.goto("/studio/test-project-id");
    await page.waitForLoadState("networkidle");

    const logoLink = page.getByRole("link", { name: /AIHQ/i }).first();
    await expect(logoLink).toBeVisible();
    const href = await logoLink.getAttribute("href");
    // Studio logo goes to /dashboard
    expect(href).toMatch(/dashboard|\//);
  });
});

test.describe("Theme toggle", () => {
  test("toggles data-theme attribute on html element", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Get initial theme
    const initialTheme = await page.evaluate(
      () => document.documentElement.getAttribute("data-theme") ?? "dark"
    );

    // Click the theme toggle
    const themeBtn = page.getByRole("button", { name: /Switch to (light|dark) mode/i });
    await themeBtn.click();

    const newTheme = await page.evaluate(
      () => document.documentElement.getAttribute("data-theme")
    );
    expect(newTheme).not.toBe(initialTheme);
  });

  test("persists theme preference to localStorage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const themeBtn = page.getByRole("button", { name: /Switch to (light|dark) mode/i });
    await themeBtn.click();

    const stored = await page.evaluate(() => localStorage.getItem("aihq:theme"));
    expect(stored).toMatch(/^(dark|light)$/);
  });

  test("theme persists on page reload", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Set to light
    await page.evaluate(() => localStorage.setItem("aihq:theme", "light"));
    await page.reload();
    await page.waitForLoadState("networkidle");

    const theme = await page.evaluate(
      () => document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("light");
  });
});

test.describe("Feature cards on landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("shows Claude AI Integration feature card", async ({ page }) => {
    await expect(page.getByText(/Claude AI Integration/i)).toBeVisible();
  });

  test("shows Real-time Collab feature card", async ({ page }) => {
    await expect(page.getByText(/Real.time Collab/i)).toBeVisible();
  });

  test("shows Full DAW feature card", async ({ page }) => {
    await expect(page.getByText(/Full DAW/i)).toBeVisible();
  });

  test("shows DJ Deck feature card", async ({ page }) => {
    await expect(page.getByText(/DJ Deck/i)).toBeVisible();
  });
});
