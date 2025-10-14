"use client"

import { useRef } from 'react'
import { CalendarControls } from './calendar-controls/calendar-controls'
import { CalendarPreview } from './calendar-preview'
import type { WallpaperCanvasHandle } from './wallpaper-canvas'

export function CalendarWallpaperClient() {
  const canvasRef = useRef<WallpaperCanvasHandle>(null)

  const handleDownload = async () => {
    canvasRef.current?.downloadPNG(3840, 2160)
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