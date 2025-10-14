import { NextRequest, NextResponse } from "next/server";
import { incrementDownloadCount } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    await incrementDownloadCount();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track download error:", error);
    // Return 200 anyway - we don't want to fail the client request
    return NextResponse.json({ success: false }, { status: 200 });
  }
}