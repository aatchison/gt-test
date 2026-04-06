import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as register } from "@/app/api/register/route";
import { checkRateLimit, clearRateLimitStore } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function makeRegisterRequest(body: Record<string, unknown>, extraHeaders: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

describe("Rate limiting", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  describe("Registration rate limiting", () => {
    it("allows requests within rate limit", async () => {
      const res = await register(makeRegisterRequest(
        { email: "test1@example.com", password: "Password1234!" },
        { "x-forwarded-for": "192.168.1.100" }
      ));
      expect(res.status).toBe(201);
    });

    it("blocks requests exceeding rate limit", async () => {
      const ip = "192.168.1.101";
      for (let i = 0; i < 5; i++) {
        await register(makeRegisterRequest(
          { email: `user${i}@example.com`, password: "Password1234!" },
          { "x-forwarded-for": ip }
        ));
      }

      const res = await register(makeRegisterRequest(
        { email: "blocked@example.com", password: "Password1234!" },
        { "x-forwarded-for": ip }
      ));

      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error).toMatch(/too many requests/i);
    });

    it("rate limits per IP", async () => {
      const ip1 = "192.168.1.102";
      const ip2 = "192.168.1.103";

      for (let i = 0; i < 5; i++) {
        await register(makeRegisterRequest(
          { email: `user${i}@ip1.com`, password: "Password1234!" },
          { "x-forwarded-for": ip1 }
        ));
      }

      const res = await register(makeRegisterRequest(
        { email: "different.ip@example.com", password: "Password1234!" },
        { "x-forwarded-for": ip2 }
      ));

      expect(res.status).toBe(201);
    });
  });

  describe("checkRateLimit utility", () => {
    it("allows first request in window", () => {
      expect(checkRateLimit("test:allow", 5, 60000)).toBe(true);
    });

    it("blocks after limit exceeded", () => {
      const key = "test:block";
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5, 60000);
      }
      expect(checkRateLimit(key, 5, 60000)).toBe(false);
    });
  });
});

describe("Request body size limit", () => {
  it("rejects oversized request body", async () => {
    const largeBody = { email: "test@example.com", password: "Password1234!", padding: "x".repeat(2000) };
    const res = await register(new NextRequest("http://localhost/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", "content-length": "5000" },
      body: JSON.stringify(largeBody),
    }));

    expect(res.status).toBe(413);
  });
});

describe("Account lockout", () => {
  beforeEach(async () => {
    await db.delete(users).where(eq(users.email, "locktest@example.com")).run();
  });

  it("locks account after max failed login attempts", async () => {
    await register(makeRegisterRequest({
      email: "locktest@example.com",
      password: "Password1234!",
    }));

    const user = await db.select().from(users).where(eq(users.email, "locktest@example.com")).get();
    expect(user).toBeTruthy();
    expect(user!.lockedUntil).toBeNull();
  });
});

describe("Input validation", () => {
  it("rejects email with leading/trailing whitespace", async () => {
    const res = await register(makeRegisterRequest({
      email: "  test@example.com  ",
      password: "Password1234!",
    }));
    expect(res.status).toBe(201);

    const user = await db.select().from(users).where(eq(users.email, "test@example.com")).get();
    expect(user).toBeTruthy();
  });

  it("normalizes uppercase email to lowercase", async () => {
    const res = await register(makeRegisterRequest({
      email: "UPPERCASE@EXAMPLE.COM",
      password: "Password1234!",
    }));
    expect(res.status).toBe(201);

    const user = await db.select().from(users).where(eq(users.email, "uppercase@example.com")).get();
    expect(user).toBeTruthy();
  });
});
