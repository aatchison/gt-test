import Database from "better-sqlite3";
import { beforeAll, afterEach } from "vitest";
import { createTables, clearTables } from "./helpers/migrate";
import { clearRateLimitStore } from "@/lib/rate-limit";

const sqlite = new Database(process.env.DATABASE_URL!);

beforeAll(() => {
  createTables(sqlite);
});

afterEach(() => {
  clearTables(sqlite);
  // Reset the in-memory rate-limit store so tests don't bleed into each other
  clearRateLimitStore();
});
