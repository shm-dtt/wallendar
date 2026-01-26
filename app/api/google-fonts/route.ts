import { NextResponse } from "next/server"

export const runtime = "edge"
export const revalidate = 86_400 // Cache for 24 hours

type GoogleFont = {
  family: string
  variants: string[]
  subsets: string[]
  category: string
  kind: string
  version: string
  lastModified: string
  files: Record<string, string>
}

type GoogleFontsResponse = {
  kind: string
  items: GoogleFont[]
}

// API key from environment variables (falls back to provided key for testing)
const GOOGLE_FONTS_API_KEY =
  process.env.GOOGLE_FONTS_API_KEY || "AIzaSyCCNnAT7Grm5W4ooYvc2jypq25AfECOwI9"

export async function GET() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`,
      {
        next: {
          revalidate,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Google Fonts API error: ${response.status}`)
    }

    const data: GoogleFontsResponse = await response.json()

    const fonts = data.items.map((font) => ({
      family: font.family,
      category: font.category,
      variants: font.variants,
      files: font.files,
      // Get regular or first available variant URL for preview
      previewUrl: font.files["regular"] || font.files["400"] || font.files[font.variants[0]],
    }))

    return NextResponse.json({ fonts })
  } catch (error) {
    console.error("Failed to fetch Google Fonts", error)
    return NextResponse.json({ error: "Failed to fetch Google Fonts" }, { status: 500 })
  }
}
