"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Type, X } from "lucide-react"
import { useCalendarStore } from "@/lib/calendar-store"

export function TypographySettings() {
  const textColor = useCalendarStore((state) => state.textColor)
  const setTextColor = useCalendarStore((state) => state.setTextColor)
  const fontFamily = useCalendarStore((state) => state.fontFamily)
  const setFontFamily = useCalendarStore((state) => state.setFontFamily)
  const customFontName = useCalendarStore((state) => state.customFontName)
  const setCustomFontName = useCalendarStore((state) => state.setCustomFontName)
  const applyFontToAll = useCalendarStore((state) => state.applyFontToAll)
  const setApplyFontToAll = useCalendarStore((state) => state.setApplyFontToAll)
  const fontInputRef = useRef<HTMLInputElement | null>(null)
  const [localColor, setLocalColor] = useState(textColor)
  const commitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setLocalColor(textColor)
  }, [textColor])

  const scheduleCommit = (next: string) => {
    setLocalColor(next)
    if (commitTimerRef.current !== null) {
      window.clearTimeout(commitTimerRef.current)
    }
    commitTimerRef.current = window.setTimeout(() => {
      setTextColor(next)
    }, 400)
  }

  useEffect(() => {
    return () => {
      if (commitTimerRef.current !== null) {
        window.clearTimeout(commitTimerRef.current)
      }
    }
  }, [])

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const buf = await file.arrayBuffer()
      const name = file.name.replace(/\.(ttf|otf|woff2?)$/i, "") || "CustomFont"
      const face = new FontFace(name, buf)
      const loaded = await face.load()
      document.fonts.add(loaded)
      setCustomFontName(name)
    } catch (err) {
      console.error("Failed to load font:", err)
      alert("Could not load that font. Please upload a valid TTF/OTF/WOFF file.")
    }
  }

  const removeCustomFont = () => {
    setCustomFontName(null)
    if (fontInputRef.current) {
      fontInputRef.current.value = ""
    }
  }

  return (
    <div className="py-1">
      <div className="flex items-center gap-2 mb-3">
        <Type className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Typography</h2>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="textColor" className="text-sm">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="textColor"
              type="color"
              value={localColor}
              onInput={(e) => scheduleCommit((e.target as HTMLInputElement).value)}
              onChange={(e) => scheduleCommit(e.target.value)}
              className="w-12 h-8 p-1 cursor-pointer"
            />
            <div className="flex-1">
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="fontSelect" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Montserrat">Montserrat (Default)</SelectItem>
                  <SelectItem value="Serif">Serif</SelectItem>
                  <SelectItem value="Mono">Monospace</SelectItem>
                  <SelectItem value="Playwrite CA">Playwrite CA</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <p className="text-xs text-muted-foreground">If unchecked, only the month name changes; days and dates use Montserrat.</p>
        </div>

        {customFontName && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-xs font-medium">Custom: {customFontName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={removeCustomFont} className="h-5 w-5 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="fontUpload" className="text-sm">Upload Custom Font</Label>
          <Input
            id="fontUpload"
            ref={fontInputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleFontUpload}
            className="h-8 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
          />
          <p className="text-xs text-muted-foreground">Supports TTF, OTF, WOFF files</p>
        </div>
      </div>
    </div>
  )
}