"use client"

import { useRef } from 'react'
import { CalendarControls } from './calendar-controls/calendar-controls'
import { CalendarPreview } from './calendar-preview'
import type { WallpaperCanvasHandle } from './wallpaper-canvas'

export function CalendarWallpaperClient() {
  const canvasRef = useRef<WallpaperCanvasHandle>(null)

  const handleDownload = () => {
    canvasRef.current?.downloadPNG(3840, 2160)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <CalendarControls/>
      <CalendarPreview ref={canvasRef} onDownload={handleDownload} />
    </div>
  )
}