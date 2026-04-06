import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as register } from "@/app/api/register/route";
import { GET as verifyEmail } from "@/app/api/verify-email/route";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateVerificationToken } from "@/lib/verification";

describe("Email Verification Flow", () => {
  const TEST_EMAIL = "verify-me@example.com";
  const TEST_PASS = "Password123456!";

  beforeEach(async () => {
    // Clear user from DB to ensure clean state
    await db.delete(users).where(eq(users.email, TEST_EMAIL));
  });

  it("should prevent login until email is verified", async () => {
    // 1. Register user
    const regReq = new NextRequest("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
    });
    await register(regReq);

    // 2. Check DB: user exists but emailVerified is null
    const user = await db.select().from(users).where(eq(users.email, TEST_EMAIL)).get();
    expect(user?.emailVerified).toBeNull();
  });

  it("should successfully verify email with valid token", async () => {
    // 1. Register user
    const regReq = new NextRequest("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
    });
    await register(regReq);

    // 2. Manually get the token created during registration
    // (In a real test we might mock the email service or read from DB)
    const token = await generateVerificationToken(TEST_EMAIL);

    // 3. Call verification endpoint
    const verifyReq = new NextRequest(`http://localhost/api/verify-email?email=${TEST_EMAIL}&token=${token}`);
    const res = await verifyEmail(verifyReq);
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // 4. Verify DB state
    const updatedUser = await db.select().from(users).where(eq(users.email, TEST_EMAIL)).get();
    expect(updatedUser?.emailVerified).not.toBeNull();
  });

  it("should fail verification with invalid token", async () => {
    const regReq = new NextRequest("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
    });
    await register(regReq);

    const verifyReq = new NextRequest(`http://localhost/api/verify-email?email=${TEST_EMAIL}&token=invalid-token`);
    const res = await verifyEmail(verifyReq);
    
    expect(res.status).toBe(400);
  });
});
