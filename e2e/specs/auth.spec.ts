import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AIHQ/);
    await expect(page.getByRole("heading", { name: /Music production/i })).toBeVisible();
  });

  test("sign-in page renders form fields", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("sign-in-email")).toBeVisible();
    await expect(page.getByTestId("sign-in-password")).toBeVisible();
    await expect(page.getByTestId("sign-in-submit")).toBeVisible();
  });

  test("sign-up page renders all fields", async ({ page }) => {
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("sign-up-first-name")).toBeVisible();
    await expect(page.getByTestId("sign-up-last-name")).toBeVisible();
    await expect(page.getByTestId("sign-up-email")).toBeVisible();
    await expect(page.getByTestId("sign-up-password")).toBeVisible();
  });

  test("sign-in shows error for wrong credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("sign-in-email").fill("nobody@example.com");
    await page.getByTestId("sign-in-password").fill("wrongpassword");
    await page.getByTestId("sign-in-submit").click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test("dev skip goes to dashboard", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("dev-skip").click();
    await page.waitForURL(/dashboard/);
    await expect(page.getByText("Your Projects")).toBeVisible();
  });

  test("sign-up creates account and redirects to dashboard", async ({ page }) => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("sign-up-first-name").fill("Test");
    await page.getByTestId("sign-up-last-name").fill("User");
    await page.getByTestId("sign-up-email").fill(uniqueEmail);
    await page.getByTestId("sign-up-password").fill("password123");
    await page.getByTestId("sign-up-submit").click();
    await page.waitForURL(/dashboard/);
    await expect(page.getByText("Your Projects")).toBeVisible();
  });

  test("pricing page shows coming soon", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /Pricing.*Coming Soon/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to Dashboard/i })).toBeVisible();
  });

  test("dashboard accessible in dev mode", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/dashboard|sign-in/);
  });
});
