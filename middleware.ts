import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken } from "./lib/auth";

const PROTECTED_ROUTES = ["/dashboard", "/apply"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check Authorization Header
    const authHeader = req.headers.get("authorization");
    let accessToken = authHeader?.split(" ")[1];

    // Check Cookie if header missing
    if (!accessToken) {
      accessToken = req.cookies.get("accessToken")?.value;
    }

    if (accessToken) {
      try {
        await verifyAccessToken(accessToken);
        return NextResponse.next();
      } catch (err) {
        // Access token invalid/expired, fall through to refresh token check
      }
    }

    // Since we are validating in middleware, we need to be careful.
    // Real validation happens with the refresh token cookie mainly for session presence.
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await verifyRefreshToken(refreshToken);
      // Valid session
    } catch (err) {
      // Invalid session
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/apply/:path*"],
};
