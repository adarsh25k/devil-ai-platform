import { NextRequest, NextResponse } from "next/server";
import { verifyToken, saveIntroMeta } from "@/lib/db";
import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const INTRO_VIDEO_PATH = path.join(STORAGE_DIR, "intro.mp4");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only videos are allowed." },
        { status: 400 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(INTRO_VIDEO_PATH, buffer);

    // Save metadata
    saveIntroMeta(user.username);

    return NextResponse.json({
      success: true,
      message: "Intro video uploaded successfully",
    });
  } catch (error) {
    console.error("Upload intro error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
