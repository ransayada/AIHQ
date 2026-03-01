import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@aihq/shared": new URL("../../packages/shared/src/index.ts", import.meta.url).pathname,
    },
  },
});
