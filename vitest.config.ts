import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    env: {
      DATABASE_URL: process.env.VITEST_WORKER_ID ? `./test-${process.env.VITEST_WORKER_ID}.db` : "./test.db",
      AUTH_SECRET: "test-secret-for-vitest-only",
      NEXTAUTH_URL: "http://localhost:3000",
    },
    include: ["tests/api/**/*.test.ts"],
    pool: "forks",
  },
});
