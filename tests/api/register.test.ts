import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/register/route";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/register", () => {
  it("creates a user with valid email and password", async () => {
    const res = await POST(makeRequest({ email: "alice@example.com", password: "Password1234!" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("stores an optional name", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "alice@example.com", password: "Password1234!" }));
    expect(res.status).toBe(201);
  });

  it("normalizes email to lowercase before storing", async () => {
    const res = await POST(makeRequest({ email: "Alice@Example.COM", password: "Password1234!" }));
    expect(res.status).toBe(201);
    // Registering with the lowercase form should now be a duplicate
    const dup = await POST(makeRequest({ email: "alice@example.com", password: "Password1234!" }));
    expect(dup.status).toBe(409);
  });

  it("rejects missing email", async () => {
    const res = await POST(makeRequest({ password: "Password1234!" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("rejects missing password", async () => {
    const res = await POST(makeRequest({ email: "alice@example.com" }));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email", password: "Password1234!" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/valid email/i);
  });

  it("rejects password shorter than 12 characters", async () => {
    const res = await POST(makeRequest({ email: "alice@example.com", password: "Short1!" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/12 characters/);
  });

  it("rejects password without uppercase letter", async () => {
    const res = await POST(makeRequest({ email: "alice@example.com", password: "password1234!" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/uppercase/i);
  });

  it("rejects password without a digit", async () => {
    const res = await POST(makeRequest({ email: "alice@example.com", password: "PasswordStrong!" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/number/i);
  });

  it("rejects duplicate email with 409", async () => {
    await POST(makeRequest({ email: "alice@example.com", password: "Password1234!" }));
    const res = await POST(makeRequest({ email: "alice@example.com", password: "DifferentPass1!" }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/already exists/);
  });

  it("rejects duplicate email regardless of case", async () => {
    await POST(makeRequest({ email: "alice@example.com", password: "Password1234!" }));
    // Email is normalised to lowercase, so ALICE@ == alice@ → duplicate
    const res = await POST(makeRequest({ email: "ALICE@example.com", password: "Password1234!" }));
    expect(res.status).toBe(409);
  });
});
