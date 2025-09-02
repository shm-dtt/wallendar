"use client"

import { useState, useRef } from 'react'
import { CalendarControls } from './calendar-controls/calendar-controls'
import { CalendarPreview } from './calendar-preview'
import type { WallpaperCanvasHandle } from './wallpaper-canvas'

interface InitialData {
  currentMonth: number
  currentYear: number
  monthNames: string[]
  sampleImagePath: string
}

export function CalendarWallpaperClient({ initialData }: { initialData: InitialData }) {
  const canvasRef = useRef<WallpaperCanvasHandle>(null)
  
  // State management
  const [month, setMonth] = useState(initialData.currentMonth)
  const [year, setYear] = useState(initialData.currentYear)
  const [weekStart, setWeekStart] = useState<"sunday" | "monday">("sunday")
  const [textColor, setTextColor] = useState("#ffffff")
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined)
  const [fontFamily, setFontFamily] = useState("Montserrat")
  const [customFontName, setCustomFontName] = useState<string | null>(null)

  const handleSampleImage = () => {
    setImageSrc(initialData.sampleImagePath)
  }

  const handleDownload = () => {
    canvasRef.current?.downloadPNG(3840, 2160)
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-8">
      <CalendarControls
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
        weekStart={weekStart}
        setWeekStart={setWeekStart}
        textColor={textColor}
        setTextColor={setTextColor}
        imageSrc={imageSrc}
        setImageSrc={setImageSrc}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        customFontName={customFontName}
        setCustomFontName={setCustomFontName}
        monthNames={initialData.monthNames}
        onSampleImage={handleSampleImage}
        onDownload={handleDownload}
      />
      <CalendarPreview
        ref={canvasRef}
        month={month}
        year={year}
        weekStart={weekStart}
        textColor={textColor}
        fontFamily={fontFamily}
        customFontName={customFontName}
        imageSrc={imageSrc}
        monthNames={initialData.monthNames}
      />
    </div>
  )
}