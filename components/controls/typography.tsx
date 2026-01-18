"use client"

import { ModernColorPicker } from "@/components/misc/color-picker"
import { Label } from "@/components/ui/label"
import { useCalendarStore } from "@/lib/calendar-store"
import { CaseSensitive } from "lucide-react"
import { FontPicker } from "./font-picker"

export function TypographySettings() {
  const textColor = useCalendarStore((state) => state.textColor)
  const setTextColor = useCalendarStore((state) => state.setTextColor)
  const fontFamily = useCalendarStore((state) => state.fontFamily)
  const setFontFamily = useCalendarStore((state) => state.setFontFamily)
  const uploadedFonts = useCalendarStore((state) => state.uploadedFonts)
  const setCustomFontName = useCalendarStore((state) => state.setCustomFontName)
  const applyFontToAll = useCalendarStore((state) => state.applyFontToAll)
  const setApplyFontToAll = useCalendarStore((state) => state.setApplyFontToAll)

  const handleColorChange = (color: string) => {
    // This will be called during dragging/interaction
  }

  const handleColorChangeComplete = (color: string) => {
    setTextColor(color)
  }

  const handleFontChange = (value: string) => {
    setFontFamily(value)
    // Check if it's a custom uploaded font
    if (uploadedFonts.some(font => font.name === value)) {
      setCustomFontName(value)
    } else {
      setCustomFontName(null)
    }
  }

  return (
    <div className="py-1">
      <div className="items-center gap-2 mb-3 hidden lg:flex">
        <CaseSensitive className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Typography</h2>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm">Text Color & Font</Label>
          <div className="flex items-center gap-3">
            <ModernColorPicker
              value={textColor}
              onChange={handleColorChange}
              onChangeComplete={handleColorChangeComplete}
              trigger={
                <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div
                    className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: textColor }}
                  />
                </button>
              }
            />

            <div className="flex-1">
              <FontPicker
                value={fontFamily}
                onChange={handleFontChange}
                variant="select-only"
              />
            </div>
          </div>
          
          {/* Custom Font Upload - Separate Row */}
          <div>
            <FontPicker
                value={fontFamily}
                onChange={handleFontChange}
                allowUpload={true}
                variant="upload-only"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="applyAll" className="flex items-center gap-2 text-sm">
            <input
              id="applyAll"
              type="checkbox"
              checked={applyFontToAll}
              onChange={(e) => setApplyFontToAll(e.target.checked)}
              className="h-3 w-3 accent-primary"
            />
            <span>Apply selected font to all text</span>
          </Label>
        </div>
      </div>
    </div>
  )
}
