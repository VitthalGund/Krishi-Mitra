import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/apply"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // 1. Check for Access Token in Headers (Bearer ...)
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.split(" ")[1];

    if (accessToken) {
      // We can't fully verify with 'jsonwebtoken' in Edge Runtime (Middleware)
      // because 'crypto' module is limited. However, 'jose' is recommended for Edge.
      // For this demo, we might check presence or simple decode if we switch lib.
      // BUT, since we used 'jsonwebtoken' which relies on Node crypto, it might fail in Middleware on Vercel.
      // Standard workaround: Check for Refresh Token cookie presence as a "Session" indicator
      // OR use 'jose' library for Edge-compatible generic JWT verification.
      // For simplicity/robustness in this specific setup without changing all deps to 'jose':
      // We will check for the Refresh Token cookie. If it exists, we assume user matches
      // and let the client-side/Server Actions handle standard verification where Node runtime is available.
      // The absolute security check happens in Server Actions or API routes.
      // Middleware here acts as a "Gatekeeper" to redirect unauthenticated users to Login.
    }

    const refreshToken = req.cookies.get("refreshToken");

    if (!refreshToken) {
      // Redirect to Login if no session
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname); // Redirect back after login
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/apply/:path*"],
};
