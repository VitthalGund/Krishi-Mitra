import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

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
      // User exists, return the existing user (Login)
      return NextResponse.json(
        { user, message: "User logged in existing" },
        { status: 200 }
      );
    }

    // Create new user
    user = await User.create({
      name,
      mobileNumber,
      language: language || "Hindi",
    });

    return NextResponse.json(
      { user, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
