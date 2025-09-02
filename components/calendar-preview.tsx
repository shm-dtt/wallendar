"use client"

import { forwardRef } from 'react'
import { useMemo } from 'react'
import WallpaperCanvas, { type WallpaperCanvasHandle } from './wallpaper-canvas'

interface CalendarPreviewProps {
  month: number
  year: number
  weekStart: "sunday" | "monday"
  textColor: string
  fontFamily: string
  customFontName: string | null
  imageSrc?: string
  monthNames: string[]
}

export const CalendarPreview = forwardRef<WallpaperCanvasHandle, CalendarPreviewProps>(
  function CalendarPreview({ 
    month, year, weekStart, textColor, fontFamily, 
    customFontName, imageSrc, monthNames 
  }, ref) {
    
    const fontFamilyMap = {
      Montserrat: 'Montserrat, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
      Serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      Mono: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }

    const effectiveFont = useMemo(() => {
      const baseFont = fontFamilyMap[fontFamily as keyof typeof fontFamilyMap] || fontFamilyMap.Montserrat
      return customFontName ? `"${customFontName}", ${baseFont}` : baseFont
    }, [customFontName, fontFamily])

    return (
      <div className="space-y-4">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Live Preview</h2>
            <div className="text-sm text-muted-foreground">
              {monthNames[month]} {year}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 shadow-inner">
            <div className="w-full aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 bg-black shadow-2xl">
              <WallpaperCanvas
                ref={ref}
                month={month}
                year={year}
                weekStart={weekStart}
                textColor={textColor}
                fontFamily={effectiveFont}
                imageSrc={imageSrc}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
)