/**
 * Docker entrypoint — runs DB migrations then starts Next.js.
 * Node is PID 1 so SIGTERM/SIGINT from Kubernetes are handled correctly.
 */
import { execSync, spawn } from "node:child_process";

function runMigrations() {
  try {
    execSync("node scripts/migrate.mjs", { stdio: "inherit" });
  } catch (err) {
    console.error("Database migration failed:", err);
    process.exit(typeof err.status === "number" ? err.status : 1);
  }
}

function startNext() {
  const child = spawn("node_modules/.bin/next", ["start"], {
    stdio: "inherit",
  });

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => child.pid && child.kill(signal));
  }

  child.on("error", (err) => {
    console.error("Failed to start Next.js:", err);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
}

runMigrations();
startNext();
