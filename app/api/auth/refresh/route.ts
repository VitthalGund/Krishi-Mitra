import { NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken");

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Unauthorized: No Refresh Token" },
      { status: 401 }
    );
  }

  try {
    const payload = verifyRefreshToken(refreshToken.value);

    // Issue new Access Token
    const newAccessToken = signAccessToken({
      userId: payload.userId,
      mobileNumber: payload.mobileNumber,
    });

    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid Refresh Token" },
      { status: 401 }
    );
  }
}
