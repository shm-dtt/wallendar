import { NextRequest, NextResponse } from "next/server";
import { generateWallpaper } from "@/lib/server-canvas";

const DEFAULT_CONFIG = {
  weekStart: "sunday",
  headerFormat: "full",
  textColor: "#ffffff",
  fontFamily: "Product Sans",
  offsetX: 0,
  offsetY: 0,
  viewMode: "desktop",
  calendarScale: 1,
  textOverlay: {
    enabled: false,
    content: "",
    fontSize: 1,
    font: "Product Sans",
    useTypographyFont: true,
    position: "center",
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageEntry = formData.get("image");
    const configStr = formData.get("config") as string;

    if (!imageEntry) {
      return NextResponse.json(
        { error: "Missing image (file or URL)" },
        { status: 400 }
      );
    }

    // 1. Prepare Configuration
    const now = new Date();
    const defaults = {
      ...DEFAULT_CONFIG,
      month: now.getMonth(),
      year: now.getFullYear(),
    };

    let userConfig = {};
    if (configStr) {
      try {
        userConfig = JSON.parse(configStr);
      } catch (e) {
        console.warn("Invalid config JSON, using defaults");
      }
    }

    const config = { ...defaults, ...userConfig };

    // 2. Prepare Image Buffer
    let imageBuffer: Buffer;

    if (imageEntry instanceof File) {
      // Handle File Upload
      const arrayBuffer = await imageEntry.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (typeof imageEntry === "string") {
      // Handle Image URL
      try {
        const res = await fetch(imageEntry);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } catch (e) {
        return NextResponse.json(
          { error: "Failed to load image from URL" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    // 3. Generate Wallpaper
    const resultBuffer = await generateWallpaper(imageBuffer, config as any);

    // 4. Return Result
    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="wallendar-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    console.error("Error generating wallpaper:", error);
    return NextResponse.json(
      { error: "Failed to generate wallpaper" },
      { status: 500 }
    );
  }
}
