import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { mobileNumber, name } = body;

    if (!mobileNumber) {
      return NextResponse.json(
        { message: "Mobile number is required" },
        { status: 400 }
      );
    }

    // Find or Create User
    let user = await User.findOne({ mobileNumber });
    if (!user) {
      user = await User.create({
        mobileNumber,
        name: name || "Farmer", // Default name if not provided
      });
    }

    // Generate Tokens
    const payload = {
      userId: user._id.toString(),
      mobileNumber: user.mobileNumber,
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Set Refresh Token in HttpOnly Cookie
    const cookieSerialized = serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json(
      { accessToken, user: { name: user.name, mobile: user.mobileNumber } },
      {
        status: 200,
        headers: { "Set-Cookie": cookieSerialized },
      }
    );
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
