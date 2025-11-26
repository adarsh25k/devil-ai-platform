import { NextRequest, NextResponse } from "next/server";
import { findUser, generateToken, initializeAdmin } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Initialize admin on first request
    initializeAdmin();

    const body = await request.json();
    const { username, password, isAdmin } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = findUser(username, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if admin login matches admin flag
    if (isAdmin && !user.isAdmin) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    if (!isAdmin && user.isAdmin) {
      return NextResponse.json(
        { error: "Please use admin login" },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.username, user.isAdmin);

    return NextResponse.json({
      success: true,
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
