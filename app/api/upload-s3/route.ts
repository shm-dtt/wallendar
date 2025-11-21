import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please login to continue." }, { status: 401 });
    }

    const body = await request.json();
    const { month: monthStr, year: yearStr, filename: originalFilename } = body;
    const bucket = process.env.AWS_S3_BUCKET_NAME;

    if (!monthStr || !yearStr) {
      return NextResponse.json(
        { error: "Month and year are required" },
        { status: 400 }
      );
    }

    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid month. Must be between 1 and 12" },
        { status: 400 }
      );
    }

    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: "Invalid year" },
        { status: 400 }
      );
    }

    if (!bucket) {
      return NextResponse.json(
        { error: "S3 bucket not configured" },
        { status: 500 }
      );
    }

    // Generate unique filename with month-year folder structure
    const monthYearFolder = `${month}-${year}`;
    const timestamp = Date.now();
    const s3Key = `wallpapers/${session.user.id}/${monthYearFolder}/${timestamp}-${originalFilename || "wallpaper.png"}`;

    // Generate presigned POST URL
    // Note: The file field name in the form must match what S3 expects
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucket,
      Key: s3Key,
      Conditions: [
        ["content-length-range", 0, 16 * 1024 * 1024], // Max 16MB
        ["starts-with", "$Content-Type", "image/"],
      ],
      Fields: {
        "Content-Type": "image/png",
      },
      Expires: 300, // 5 minutes
    });

    // Log for debugging (remove in production)
    console.log("Presigned POST URL generated:", { url, s3Key });

    // Construct the public URL
    const region = process.env.AWS_REGION || "us-east-1";
    const publicUrl = process.env.AWS_S3_PUBLIC_URL 
      ? `${process.env.AWS_S3_PUBLIC_URL}/${s3Key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

    // Store upload record in database (will be created after successful upload)
    // We return the data so client can save it after upload completes
    return NextResponse.json({
      success: true,
      url,
      fields,
      publicUrl,
      s3Key,
      month,
      year,
      userId: session.user.id, // Include for client to save to DB
    });
  } catch (error) {
    console.error("S3 presigned POST error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

