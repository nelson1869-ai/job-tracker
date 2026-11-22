import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the pure logic (no browser needed).
// Docs: https://vitest.dev/config/
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }, // same as tsconfig "@/*"
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"], // tests live next to the code they test
  },
});
