import { NextRequest, NextResponse } from "next/server";
import { createAccessRequest } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, reason, category } = body;

    if (!name || !email || !reason || !category) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["Student", "Working"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const request_obj = createAccessRequest(name, email, reason, category);

    return NextResponse.json({
      success: true,
      request: request_obj,
    });
  } catch (error) {
    console.error("Access request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
