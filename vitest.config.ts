import { defineConfig } from "vitest/config";
// No need for vite-tsconfig-paths plugin – Vite resolves tsconfig paths natively

export default defineConfig({
  plugins: [], // tsconfig paths resolved natively
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    env: {
      DATABASE_URL: "./test.db",
      AUTH_SECRET: "test-secret-for-vitest-only",
      NEXTAUTH_URL: "http://localhost:3000",
    },
    include: ["tests/api/**/*.test.ts"],
    pool: "forks",       // required: better-sqlite3 is not thread-safe
// poolOptions removed per Vitest 4 migration – no longer needed
  },
});
