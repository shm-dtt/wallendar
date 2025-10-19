"use client";

import { useRef } from "react";
import { CalendarControls } from "@/components/controls/calendar-controls";
import { CalendarPreview } from "@/components/calendar-preview";
import type { WallpaperCanvasHandle } from "@/components/wallpaper-canvas";
import { useCalendarStore, getResolutionDimensions, DownloadResolution } from "@/lib/calendar-store";

export function CalendarWallpaperClient() {
  const canvasRef = useRef<WallpaperCanvasHandle>(null);
  const viewMode = useCalendarStore((state) => state.viewMode);
  const downloadResolution = useCalendarStore((state) => state.downloadResolution);
  const setIsDownloading = useCalendarStore((state) => state.setIsDownloading);

  const handleDownload = async (resolution: DownloadResolution) => {
    setIsDownloading(true);
    try {
      const { width, height } = getResolutionDimensions(resolution, viewMode);
      canvasRef.current?.downloadPNG(width, height);
      await fetch("/api/track-download", { method: "POST" });
      console.log("Download tracked");
    } catch (error) {
      console.error("Failed to track download:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between">
      <CalendarControls />
      <CalendarPreview ref={canvasRef} onDownload={handleDownload} />
    </div>
  );
}
