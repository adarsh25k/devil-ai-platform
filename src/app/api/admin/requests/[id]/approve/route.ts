import { NextRequest, NextResponse } from "next/server";
import { verifyToken, updateRequestStatus, getAccessRequests, createUser } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const requestId = params.id;
    const requests = getAccessRequests();
    const accessRequest = requests.find((r) => r.id === requestId);

    if (!accessRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Update request status
    updateRequestStatus(requestId, "approved");

    // Create user account
    const username = accessRequest.email.split("@")[0];
    const password = `devil_${Math.random().toString(36).slice(2, 10)}`;
    
    try {
      createUser(username, password, false);
      console.log(`✅ User created for approved request: ${username} / ${password}`);
    } catch (err) {
      console.error("Failed to create user:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Request approved and user created",
      credentials: {
        username,
        password,
      },
    });
  } catch (error) {
    console.error("Approve request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
