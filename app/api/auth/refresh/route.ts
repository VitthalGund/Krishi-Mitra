import { NextResponse } from "next/server";
import { verifyToken, signAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || "/dashboard"; // Destination after refresh

  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", from);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 1. Await verification of the refresh token
    const payload = await verifyToken(refreshToken);

    // 2. Await generation of a new access token
    const newAccessToken = await signAccessToken({
      userId: payload.userId,
      mobileNumber: payload.mobileNumber,
    });

    // 3. Prepare the redirect response
    const response = NextResponse.redirect(new URL(from, req.url));

    // 4. Set the new Access Token in a secure HttpOnly cookie
    // This allows the middleware to verify the user on the next hop
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh Logic Failure:", error);
    // If refresh fails, the session is dead; force login.
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", from);
    return NextResponse.redirect(loginUrl);
  }
}
