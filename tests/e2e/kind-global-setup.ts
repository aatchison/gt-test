/**
 * Playwright global setup for kind deployments.
 * Seeds the E2E test user by running the seed script inside the running pod.
 */
import { execSync } from "child_process";

export default async function globalSetup() {
  console.log("Seeding E2E user into kind deployment...");
  execSync(
    "kubectl exec -n gttest deployment/gttest-app -- node /app/scripts/kind-seed.mjs",
    { stdio: "inherit" },
  );
}
