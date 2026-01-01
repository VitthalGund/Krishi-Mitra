import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  // Clear the Refresh Token cookie
  const cookieSerialized = serialize("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return NextResponse.json(
    { message: "Logged Out" },
    {
      status: 200,
      headers: { "Set-Cookie": cookieSerialized },
    }
  );
}
