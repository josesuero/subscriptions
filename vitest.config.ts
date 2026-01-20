import { defineConfig } from "vitest/config";
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  test: {
    environment: "jsdom",
    include: ["__test__/**/*.test.ts"],
    exclude: ["__test__/pages/**/*.test.ts"],
    restoreMocks: true
  }
});

