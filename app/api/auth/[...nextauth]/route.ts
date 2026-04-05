import { handlers } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_RATE_LIMIT = 5;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

const { GET, POST: authPOST } = handlers;

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  if (!checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_MS)) {
    return NextResponse.json(
      {
        error:
          "Too many login attempts. Please try again in 15 minutes.",
        code: "RATE_LIMITED",
      },
      { status: 429 }
    );
  }

  return authPOST(req);
}

export { GET };
