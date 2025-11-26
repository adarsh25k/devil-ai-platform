import { NextRequest, NextResponse } from "next/server";
import { getIntroMeta } from "@/lib/db";
import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const INTRO_VIDEO_PATH = path.join(STORAGE_DIR, "intro.mp4");

export async function GET(request: NextRequest) {
  try {
    // Check if intro video exists
    if (!fs.existsSync(INTRO_VIDEO_PATH)) {
      return new NextResponse("Video not found", { status: 404 });
    }

    const meta = getIntroMeta();
    const videoBuffer = fs.readFileSync(INTRO_VIDEO_PATH);

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": videoBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
        "Last-Modified": meta?.uploadedAt || new Date().toUTCString(),
      },
    });
  } catch (error) {
    console.error("Get intro video error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
