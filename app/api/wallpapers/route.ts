import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Default to current month/year if not specified
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month, 10) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();

    if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return NextResponse.json(
        { error: "Invalid month" },
        { status: 400 }
      );
    }

    if (isNaN(targetYear)) {
      return NextResponse.json(
        { error: "Invalid year" },
        { status: 400 }
      );
    }

    // Fetch wallpapers for the specified month/year with optimized select
    const wallpapers = await (prisma as any).wallpaperUpload?.findMany({
      where: {
        month: targetMonth,
        year: targetYear,
      },
      select: {
        id: true,
        s3Url: true,
        createdAt: true,
        month: true,
        year: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }) || [];

    // Add cache headers for better performance
    return NextResponse.json(
      {
        success: true,
        wallpapers,
        month: targetMonth,
        year: targetYear,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch wallpapers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch wallpapers",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

