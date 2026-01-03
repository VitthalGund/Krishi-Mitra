import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const PROTECTED_ROUTES = ["/dashboard", "/apply"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) return NextResponse.next();

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (accessToken) {
    try {
      await verifyToken(accessToken);
      return NextResponse.next();
    } catch {
      // Access token invalid, fall through to refresh logic
    }
  }

  // If no access token but valid refresh token exists, redirect to refresh API
  // middleware.ts partial update
  if (refreshToken) {
    try {
      await verifyToken(refreshToken);
      // If the access token is dead but refresh is alive,
      // we redirect to the refresh route to get a new one.
      const refreshUrl = new URL("/api/auth/refresh", req.url);
      refreshUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(refreshUrl);
    } catch {
      // Refresh token also invalid
    }
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/apply/:path*"],
};
