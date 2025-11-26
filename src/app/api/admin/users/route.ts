import { NextRequest, NextResponse } from "next/server";
import { getUsers, verifyToken } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const users = getUsers();
    
    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
