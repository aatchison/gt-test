/**
 * Playwright config for testing against the kind-deployed app.
 * Uses the NodePort at localhost:30000 — no webServer is started.
 * Run via: make kind-test-e2e
 */
import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.KIND_URL ?? "http://localhost:30000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  globalSetup: "./tests/e2e/kind-global-setup.ts",
  // No webServer — the app runs in the kind cluster
});
