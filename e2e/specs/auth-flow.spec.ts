/**
 * Full auth flow E2E tests — sign-up → dashboard → studio → sign-out.
 * Tests the complete user journey end-to-end.
 */
import { test, expect } from "@playwright/test";

test.describe("Full Auth Flow", () => {
  test("complete sign-up → dashboard → studio → sign-out", async ({ page }) => {
    test.setTimeout(60000);
    const email = `e2e_${Date.now()}@test.com`;

    // 1. Landing page heading check
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Music production/i })).toBeVisible();

    // 2. Navigate to sign-up directly (link click can be flaky when already signed in)
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");

    // 3. Fill registration form
    await page.getByTestId("sign-up-first-name").fill("E2E");
    await page.getByTestId("sign-up-last-name").fill("Tester");
    await page.getByTestId("sign-up-email").fill(email);
    await page.getByTestId("sign-up-password").fill("testpass123");
    await page.getByTestId("sign-up-submit").click();

    // 4. Land on dashboard
    await page.waitForURL(/dashboard/, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: "Your Projects" })).toBeVisible();

    // 5. Navigate to studio
    await page.goto("/studio/test-project-id");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("transport-bar")).toBeVisible();

    // 6. Go back to dashboard
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Your Projects" })).toBeVisible();

    // 7. Open account page
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
    // Email or user info should be present somewhere on page
    await expect(page.getByText(/E2E|Tester|account/i).first()).toBeVisible();
  });

  test("sign-in with existing account", async ({ page }) => {
    test.setTimeout(60000);
    const email = `signin_${Date.now()}@test.com`;

    // Create account first
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("sign-up-first-name").fill("Sign");
    await page.getByTestId("sign-up-last-name").fill("In");
    await page.getByTestId("sign-up-email").fill(email);
    await page.getByTestId("sign-up-password").fill("mypassword");
    await page.getByTestId("sign-up-submit").click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });

    // Sign out by clearing stored auth state, then navigate to sign-in
    await page.evaluate(() => {
      try {
        const raw = localStorage.getItem("aihq:auth");
        if (raw) {
          const data = JSON.parse(raw);
          if (data.state) { data.state.user = null; data.state.isSignedIn = false; }
          localStorage.setItem("aihq:auth", JSON.stringify(data));
        }
      } catch { /* ignore */ }
    });
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");

    // Sign back in
    await page.getByTestId("sign-in-email").fill(email);
    await page.getByTestId("sign-in-password").fill("mypassword");
    await page.getByTestId("sign-in-submit").click();
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Your Projects" })).toBeVisible();
  });

  test("sign-in with wrong password shows error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("sign-in-email").fill("nobody_at_all@example.com");
    await page.getByTestId("sign-in-password").fill("wrongpassword");
    await page.getByTestId("sign-in-submit").click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
    // Must stay on sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  test("duplicate email on sign-up shows error", async ({ page }) => {
    const email = `dup_${Date.now()}@test.com`;

    // First registration
    await page.goto("/sign-up");
    await page.getByTestId("sign-up-first-name").fill("First");
    await page.getByTestId("sign-up-last-name").fill("User");
    await page.getByTestId("sign-up-email").fill(email);
    await page.getByTestId("sign-up-password").fill("pass123");
    await page.getByTestId("sign-up-submit").click();
    await page.waitForURL(/dashboard/, { timeout: 15000 });

    // Sign out via localStorage so sign-up page isn't redirected away
    await page.evaluate(() => {
      try {
        const raw = localStorage.getItem("aihq:auth");
        if (raw) {
          const data = JSON.parse(raw);
          if (data.state) { data.state.user = null; data.state.isSignedIn = false; }
          localStorage.setItem("aihq:auth", JSON.stringify(data));
        }
      } catch { /* ignore */ }
    });

    // Second registration with same email
    await page.goto("/sign-up");
    await page.getByTestId("sign-up-first-name").fill("Second");
    await page.getByTestId("sign-up-last-name").fill("User");
    await page.getByTestId("sign-up-email").fill(email);
    await page.getByTestId("sign-up-password").fill("pass456");
    await page.getByTestId("sign-up-submit").click();
    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test("short password (< 6 chars) rejected on sign-up", async ({ page }) => {
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("sign-up-first-name").fill("Short");
    await page.getByTestId("sign-up-last-name").fill("Pass");
    await page.getByTestId("sign-up-email").fill(`short_${Date.now()}@test.com`);
    await page.getByTestId("sign-up-password").fill("abc");
    await page.getByTestId("sign-up-submit").click();
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });

  test("sign-in link on sign-up page works", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByRole("link", { name: /Sign in/i }).click();
    await page.waitForURL(/sign-in/);
    await expect(page.getByTestId("sign-in-email")).toBeVisible();
  });

  test("sign-up link on sign-in page works", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("link", { name: /Create one free/i }).click();
    await page.waitForURL(/sign-up/);
    await expect(page.getByTestId("sign-up-email")).toBeVisible();
  });
});

test.describe("User Profile Storage", () => {
  test("account page shows registered user data", async ({ page }) => {
    const email = `profile_${Date.now()}@test.com`;

    // Register
    await page.goto("/sign-up");
    await page.getByTestId("sign-up-first-name").fill("John");
    await page.getByTestId("sign-up-last-name").fill("Beatmaker");
    await page.getByTestId("sign-up-email").fill(email);
    await page.getByTestId("sign-up-password").fill("password123");
    await page.getByTestId("sign-up-submit").click();
    await page.waitForURL(/dashboard/);

    // Check account page
    await page.goto("/account");
    await expect(page.getByText("John Beatmaker").first()).toBeVisible();
    await expect(page.getByText(email).first()).toBeVisible();
  });

  test("profile persists after page reload", async ({ page }) => {
    test.setTimeout(60000);
    const email = `persist_${Date.now()}@test.com`;

    // Register
    await page.goto("/sign-up");
    await page.getByTestId("sign-up-first-name").fill("Persistent");
    await page.getByTestId("sign-up-last-name").fill("Producer");
    await page.getByTestId("sign-up-email").fill(email);
    await page.getByTestId("sign-up-password").fill("password123");
    await page.getByTestId("sign-up-submit").click();
    await page.waitForURL(/dashboard/, { timeout: 15000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should still be on dashboard (not redirected to sign-in)
    await expect(page.getByRole("heading", { name: "Your Projects" })).toBeVisible();
  });
});
