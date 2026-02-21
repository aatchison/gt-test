import { defineConfig, devices } from "@playwright/test";

const PORT = 3001; // offset from dev to avoid conflicts
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // SQLite doesn't handle concurrent writes well
  retries: process.env.CI ? 2 : 0,
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
  globalSetup: "./tests/e2e/global-setup.ts",
  webServer: {
    command: `DATABASE_URL=./e2e.db AUTH_SECRET=e2e-test-secret NEXTAUTH_URL=${BASE_URL} PORT=${PORT} npm run dev`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
