"use client"

import { useRef } from 'react'
import { CalendarControls } from '@/components/calendar-controls/calendar-controls'
import { CalendarPreview } from '@/components/calendar-preview'
import type { WallpaperCanvasHandle } from '@/components/wallpaper-canvas'
import { useCalendarStore } from '@/lib/calendar-store'

export function CalendarWallpaperClient() {
  const canvasRef = useRef<WallpaperCanvasHandle>(null)
  const viewMode = useCalendarStore((state: any) => state.viewMode);

  const handleDownload = async () => {
    if (viewMode === "mobile") {
      canvasRef.current?.downloadPNG(1080, 1920)
    } else {
      canvasRef.current?.downloadPNG(3840, 2160)
    }
    try {
      await fetch("/api/track-download", { method: "POST" });
      console.log("Download tracked");
    } catch (error) {
      console.error("Failed to track download:", error);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <CalendarControls/>
      <CalendarPreview ref={canvasRef} onDownload={handleDownload} />
    </div>
  )
}