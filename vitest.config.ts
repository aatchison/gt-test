import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
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
    poolOptions: {
      forks: { singleFork: true }, // serialize all test files
    },
  },
});
