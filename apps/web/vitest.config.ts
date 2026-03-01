import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@aihq/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
      "@aihq/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@aihq/audio-engine": path.resolve(__dirname, "../../packages/audio-engine/src/index.ts"),
      // Stub out the Magenta WASM module so Vite doesn't try to resolve it in tests
      "@magenta/music/es6/music_rnn": path.resolve(__dirname, "src/__tests__/stubs/magenta-music-rnn.ts"),
    },
  },
});
