import { test as base, type BrowserContext } from "@playwright/test";

export const test = base.extend<object, { authedContext: BrowserContext }>({
  // Authenticated context — sets Clerk session cookie
  context: async ({ browser }, use) => {
    const context = await browser.newContext();

    const sessionToken = process.env.E2E_CLERK_SESSION_TOKEN;
    if (sessionToken) {
      await context.addCookies([
        {
          name: "__session",
          value: sessionToken,
          domain: new URL(process.env.BASE_URL ?? "http://localhost:3000").hostname,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        },
      ]);
    }

    await use(context);
    await context.close();
  },
});

export { expect } from "@playwright/test";
