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
    const res = await POST(makeRequest({ email: "alice@example.com", password: "password123" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("stores an optional name", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "alice@example.com", password: "password123" }));
    expect(res.status).toBe(201);
  });

  it("rejects missing email", async () => {
    const res = await POST(makeRequest({ password: "password123" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("rejects missing password", async () => {
    const res = await POST(makeRequest({ email: "alice@example.com" }));
    expect(res.status).toBe(400);
  });

  it("rejects password shorter than 8 characters", async () => {
    const res = await POST(makeRequest({ email: "alice@example.com", password: "short" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/8 characters/);
  });

  it("rejects duplicate email with 409", async () => {
    await POST(makeRequest({ email: "alice@example.com", password: "password123" }));
    const res = await POST(makeRequest({ email: "alice@example.com", password: "different123" }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/already exists/);
  });

  it("email is normalised to lowercase on registration so mixed-case duplicates are rejected", async () => {
    await POST(makeRequest({ email: "alice@example.com", password: "password123" }));
    // ALICE@example.com is normalised to alice@example.com → duplicate → 409
    const res = await POST(makeRequest({ email: "ALICE@example.com", password: "password123" }));
    expect(res.status).toBe(409);
  });
});
