import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, mobileNumber, language } = body;

    if (!name || !mobileNumber) {
      return NextResponse.json(
        { error: "Name and Mobile Number are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists
    let user = await User.findOne({ mobileNumber });

    if (user) {
      // Allow "registering" an existing user to act as Login for convenience,
      // OR return 409 Conflict. Based on "Simplicity" goal, acting as login is smoother.
      // User exists, proceed to token generation.
    } else {
      user = await User.create({
        name,
        mobileNumber,
        language: language || "en",
      });
    }

    // Generate Tokens
    const payload = {
      userId: user._id.toString(),
      mobileNumber: user.mobileNumber,
    };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Set Refresh Token in HttpOnly Cookie
    const cookieSerialized = serialize("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json(
      {
        accessToken,
        user: {
          name: user.name,
          mobileNumber: user.mobileNumber,
          language: user.language,
        },
        message: "Registration successful",
      },
      {
        status: 201,
        headers: { "Set-Cookie": cookieSerialized },
      }
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
