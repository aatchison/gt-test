import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Enforce HTTPS in production
function enforceHttps(req: any) {
  if (process.env.NODE_ENV === "production") {
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    if (proto !== "https") {
      const url = req.nextUrl.clone();
      url.protocol = "https";
      return NextResponse.redirect(url);
    }
  }
  return null;
}

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

export default auth((req) => {
  // HTTPS redirect before auth check
  const httpsRedirect = enforceHttps(req);
  if (httpsRedirect) return httpsRedirect;

  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
