"use client"

import { forwardRef } from 'react'
import { useMemo } from 'react'
import WallpaperCanvas, { type WallpaperCanvasHandle } from './wallpaper-canvas'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useCalendarStore } from '@/lib/calendar-store'

interface CalendarPreviewProps {
  onDownload: () => void
}

export const CalendarPreview = forwardRef<WallpaperCanvasHandle, CalendarPreviewProps>(
  function CalendarPreview({ onDownload }, ref) {
    const month = useCalendarStore((state) => state.month)
    const year = useCalendarStore((state) => state.year)
    const weekStart = useCalendarStore((state) => state.weekStart)
    const textColor = useCalendarStore((state) => state.textColor)
    const fontFamily = useCalendarStore((state) => state.fontFamily)
    const applyFontToAll = useCalendarStore((state) => state.applyFontToAll)
    const customFontName = useCalendarStore((state) => state.customFontName)
    const imageSrc = useCalendarStore((state) => state.imageSrc)
    const initialData = useCalendarStore((state) => state.initialData)

    const monthNames = initialData?.monthNames || []
    
    const fontFamilyMap = {
      Montserrat: 'Montserrat, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
      Serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      Mono: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      "Playwrite CA": '"Playwrite CA", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    }

    const effectiveFont = useMemo(() => {
      const baseFont = fontFamilyMap[fontFamily as keyof typeof fontFamilyMap] || fontFamilyMap.Montserrat
      return customFontName ? `"${customFontName}", ${baseFont}` : baseFont
    }, [customFontName, fontFamily])

    const monthOnlyFont = useMemo(() => {
      const selected = fontFamilyMap[fontFamily as keyof typeof fontFamilyMap] || fontFamilyMap.Montserrat
      const withCustom = customFontName ? `"${customFontName}", ${selected}` : selected
      const montserratOnly = fontFamilyMap.Montserrat
      return { monthFont: withCustom, bodyFont: montserratOnly }
    }, [customFontName, fontFamily])

    return (
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Live Preview</h2>
          <div className="text-sm text-muted-foreground">
            {monthNames[month]} {year}
          </div>
        </div>

        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
          <WallpaperCanvas
            ref={ref}
            month={month}
            year={year}
            weekStart={weekStart}
            textColor={textColor}
            fontFamily={applyFontToAll ? effectiveFont : `${monthOnlyFont.monthFont} |||MONTH_ONLY||| ${monthOnlyFont.bodyFont}`}
            imageSrc={imageSrc}
          />
        </div>
        
        <div className="flex-col items-center space-y-2">
          <Button onClick={onDownload} size="lg" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download 4K Wallpaper
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Exports at 3840×2160 resolution
          </p>
        </div>
      </div>
    )
  }
)