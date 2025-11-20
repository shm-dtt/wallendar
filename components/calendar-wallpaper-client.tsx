"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarControls } from "@/components/controls/calendar-controls";
import { CalendarPreview } from "@/components/calendar-preview";
import type { WallpaperCanvasHandle } from "@/components/wallpaper-canvas";
import {
  useCalendarStore,
  getResolutionDimensions,
  DownloadResolution,
} from "@/lib/calendar-store";

export function CalendarWallpaperClient() {
  const canvasRef = useRef<WallpaperCanvasHandle>(null);
  const router = useRouter();
  const viewMode = useCalendarStore((state) => state.viewMode);
  const setIsDownloading = useCalendarStore((state) => state.setIsDownloading);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handleDownload = async (resolution: DownloadResolution) => {
    setIsDownloading(true);
    try {
      const { width, height } = getResolutionDimensions(resolution, viewMode);
      canvasRef.current?.downloadPNG(width, height);
      await fetch("/api/track", { method: "POST" });
      console.log("Download tracked");
    } catch (error) {
      console.error("Failed to track download:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePublish = async () => {
    setPublishError(null);
    setIsPublishing(true);

    try {
      const state = useCalendarStore.getState();

      if (state.month === null) {
        setPublishError("Please select a month");
        toast.error("Please select a month before publishing.");
        return;
      }

      const canvasHandle = canvasRef.current;
      if (!canvasHandle) {
        setPublishError(
          "Canvas is not ready. Please wait a moment and try again."
        );
        toast.error("Canvas not ready. Please try again in a moment.");
        return;
      }

      // Export canvas as blob
      const publishResolution: DownloadResolution = "4k";
      const { width, height } = getResolutionDimensions(
        publishResolution,
        state.viewMode
      );
      const blob = await canvasHandle.exportPNGBlob(width, height);

      if (!blob) {
        toast.error("Failed to export canvas image");
        return;
      }

      // Create file from blob
      const filename = `wallendar-${state.year}-${String(
        state.month + 1
      ).padStart(2, "0")}${state.viewMode === "mobile" ? "-mobile" : ""}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      // Step 1: Get presigned POST URL from API
      const presignedResponse = await fetch("/api/upload-s3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: state.month + 1, // month is 0-11, we need 1-12
          year: state.year,
          filename,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        toast.error(errorData.error || "Failed to get upload URL");
        return;
      }

      const { url, fields, publicUrl, s3Key, month, year } =
        await presignedResponse.json();

      // Step 2: Upload file directly to S3 using presigned POST
      const formData = new FormData();

      // Add all fields from presigned POST (order matters for S3)
      // These fields include the signature, policy, etc.
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      // Add the file last (must be last field for presigned POST)
      // The field name "file" must match what's expected by the presigned POST
      formData.append("file", file);

      console.log("Uploading to S3:", url);

      let uploadResponse: Response;
      try {
        uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
          // Don't set Content-Type header - let browser set it with boundary
        });
      } catch (fetchError) {
        // Network error or CORS issue
        console.error("Fetch error:", fetchError);
        toast.error(
          `Failed to upload to S3. This might be a CORS issue. Please ensure your S3 bucket has CORS configured. Error: ${
            fetchError instanceof Error ? fetchError.message : "Unknown error"
          }`
        );
        return;
      }

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed:", uploadResponse.status, errorText);
        toast.error(
          `Upload failed with status ${uploadResponse.status}. ${
            errorText || "Check S3 bucket CORS configuration."
          }`
        );
        return;
      }

      console.log("Upload successful:", publicUrl);

      // Save to database
      try {
        await fetch("/api/wallpapers/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            s3Url: publicUrl,
            s3Key,
            month,
            year,
          }),
        });
      } catch (dbError) {
        console.warn("Failed to save to database:", dbError);
        toast.warning("Uploaded, but failed to record publish in database.");
        // Continue even if DB save fails
      }

      // Success toast, cleanup, and redirect
      toast.success("Wallpaper published successfully!");
      try {
        // Clear persisted Zustand state for the canvas
        window.localStorage.removeItem("calendar-wallpaper-store");
        await fetch("/api/track", { method: "POST" });
        console.log("Publishing tracked");
      } catch (_e) {
        // ignore cleanup errors
      }

      router.push("/community");
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Failed to publish wallpaper"
      );
      toast.error(publishError);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between">
      <CalendarControls />
      <CalendarPreview
        ref={canvasRef}
        onDownload={handleDownload}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        publishError={publishError}
      />
    </div>
  );
}
