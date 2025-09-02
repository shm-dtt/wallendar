"use client"

import { CalendarSettings } from './calendar-settings'
import { TypographySettings } from './typography-settings'
import { BackgroundSettings } from './background-settings'
import { ExportSettings } from './export-settings'

interface CalendarControlsProps {
  month: number
  setMonth: (month: number) => void
  year: number
  setYear: (year: number) => void
  weekStart: "sunday" | "monday"
  setWeekStart: (weekStart: "sunday" | "monday") => void
  textColor: string
  setTextColor: (color: string) => void
  imageSrc?: string
  setImageSrc: (src?: string) => void
  fontFamily: string
  setFontFamily: (family: string) => void
  customFontName: string | null
  setCustomFontName: (name: string | null) => void
  monthNames: string[]
  onSampleImage: () => void
  onDownload: () => void
}

export function CalendarControls(props: CalendarControlsProps) {
  return (
    <div className="space-y-6">
      <CalendarSettings {...props} />
      <TypographySettings {...props} />
      <BackgroundSettings {...props} />
      <ExportSettings onDownload={props.onDownload} />
    </div>
  )
}