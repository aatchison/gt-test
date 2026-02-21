import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { createTables, clearTables } from "../helpers/migrate";

const E2E_DB = process.env.E2E_DATABASE_URL ?? "./e2e.db";

export const E2E_USER = {
  email: "e2e@example.com",
  password: "E2ePassword123!",
  name: "E2E User",
};

export default async function globalSetup() {
  const sqlite = new Database(E2E_DB);
  sqlite.pragma("journal_mode = WAL");

  createTables(sqlite);
  clearTables(sqlite);

  // Seed a known user for login tests
  const passwordHash = await bcrypt.hash(E2E_USER.password, 12);
  sqlite.prepare(`
    INSERT INTO users (id, name, email, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    E2E_USER.name,
    E2E_USER.email,
    passwordHash,
    Date.now(),
  );

  sqlite.close();
}
