"use client"

import { useRef, useEffect } from 'react'
import { CalendarControls } from './calendar-controls/calendar-controls'
import { CalendarPreview } from './calendar-preview'
import type { WallpaperCanvasHandle } from './wallpaper-canvas'
import { useCalendarStore } from '@/lib/calendar-store'

interface InitialData {
  currentMonth: number
  currentYear: number
  monthNames: string[]
  sampleImagePath: string
}

interface CalendarWallpaperClientProps {
  initialData: InitialData
}

export function CalendarWallpaperClient({ initialData }: CalendarWallpaperClientProps) {
  const canvasRef = useRef<WallpaperCanvasHandle>(null)
  
  // Initialize store with initial data
  const setInitialData = useCalendarStore((state) => state.setInitialData)
  useEffect(() => {
    setInitialData(initialData)
  }, [initialData, setInitialData])

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