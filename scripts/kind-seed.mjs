/**
 * Seeds the E2E test user into the running kind deployment's database.
 * Run via: kubectl exec -n gttest deployment/gttest-app -- node /app/scripts/kind-seed.mjs
 */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const path = process.env.DATABASE_URL ?? "/data/app.db";
const db = new Database(path);
db.pragma("journal_mode = WAL");

// Clear any stale E2E data
db.exec(`
  DELETE FROM accounts;
  DELETE FROM sessions;
  DELETE FROM verification_tokens;
  DELETE FROM users;
`);

// Insert the known E2E test user (matches tests/e2e/global-setup.ts)
const passwordHash = await bcrypt.hash("E2ePassword123!", 12);
db.prepare(`
  INSERT INTO users (id, name, email, password_hash, created_at)
  VALUES (?, ?, ?, ?, ?)
`).run(
  crypto.randomUUID(),
  "E2E User",
  "e2e@example.com",
  passwordHash,
  Date.now(),
);

db.close();
console.log("E2E seed complete.");
