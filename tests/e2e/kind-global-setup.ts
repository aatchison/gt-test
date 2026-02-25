/**
 * Playwright global setup for kind deployments.
 * Seeds the E2E test user by running the seed script inside the running pod.
 */
import { execSync } from "child_process";

export default async function globalSetup() {
  const namespace = process.env.KIND_NS ?? "gttest";
  const deployment = process.env.KIND_RELEASE ?? "gttest-app";

  console.log("Seeding E2E user into kind deployment...");
  try {
    execSync(
      `kubectl exec -n ${namespace} deployment/${deployment} -- node /app/scripts/kind-seed.mjs`,
      { stdio: "inherit", timeout: 60_000 },
    );
  } catch (error) {
    console.error(
      `Failed to seed E2E user via 'kubectl exec -n ${namespace} deployment/${deployment}'. ` +
        "The command may have failed or timed out.",
    );
    throw error;
  }
}
