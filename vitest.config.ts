import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
// No need for vite-tsconfig-paths plugin – Vite resolves tsconfig paths natively
 
export default defineConfig({
  plugins: [viteTsConfigPaths()], // tsconfig paths resolved natively
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
