import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { s3Url, s3Key, month, year } = body;

    if (!s3Url || !s3Key || !month || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save upload record to database
    try {
      const wallpaperUpload = (prisma as any).wallpaperUpload;
      if (wallpaperUpload) {
        await wallpaperUpload.create({
          data: {
            userId: session.user.id,
            month: parseInt(month, 10),
            year: parseInt(year, 10),
            s3Url,
            s3Key,
          },
        });
      }
    } catch (error) {
      console.error("Failed to save wallpaper record:", error);
      // Don't fail the request if DB save fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save wallpaper error:", error);
    return NextResponse.json(
      {
        error: "Failed to save wallpaper",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

