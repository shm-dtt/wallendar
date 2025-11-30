
"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CaseSensitive,  X } from "lucide-react"
import { useCalendarStore } from "@/lib/calendar-store"
import { ModernColorPicker } from "@/components/misc/color-picker"
import { localFonts } from '@/lib/calendar-utils'

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
  const [uploadedFonts, setUploadedFonts] = useState<{name: string, displayName: string}[]>([])
  const [installedFonts, setInstalledFonts] = useState<{name: string, displayName: string}[]>([])
  const [isUploading, setIsUploading] = useState(false)


  // Preinstalled fonts shipped in public/fonts
  useEffect(() => {
    const fonts = localFonts

    let canceled = false
    async function registerAll() {
      for (const f of fonts) {
        try {
          // Use specific weights for certain fonts
          let weight = "400"
          if (f.name === "Montserrat") weight = "500"
          else if (f.name === "Doto") weight = "700"
          
          const face = new FontFace(f.name, `url(${f.path})`, { weight })
          const loaded = await face.load()
          if (!canceled) {
            document.fonts.add(loaded)
          }
        } catch {
          // ignore failures; font will just not be selectable if it can't load
        }
      }
      if (!canceled) {
        setInstalledFonts(fonts.map(({ name, displayName }) => ({ name, displayName })))
      }
    }
    registerAll()
    return () => {
      canceled = true
    }
  }, [])

  // Load custom fonts from localStorage on mount
  useEffect(() => {
    const savedFonts = localStorage.getItem('uploadedFonts')
    if (savedFonts) {
      try {
        const fonts = JSON.parse(savedFonts)
        setUploadedFonts(fonts)
        
        // Re-register fonts in document.fonts
        fonts.forEach((font: {name: string}) => {
          // Check if font is already loaded
          const fontFaces = Array.from(document.fonts.values())
          const isLoaded = fontFaces.some(face => face.family === font.name)
          if (!isLoaded) {
            // Font data would need to be re-loaded from storage if we want to persist across sessions
            // For now, we'll just keep the font names in the list but they won't work until re-uploaded
          }
        })
      } catch (e) {
        console.error('Failed to load saved fonts:', e)
      }
    }
  }, [])

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const fileName = file.name.replace(/\.(ttf|otf|woff2?)$/i, "") || "CustomFont"
      
      // Check if a font with the same display name already exists
      const existingFont = uploadedFonts.find(font => font.displayName === fileName)
      if (existingFont) {
        // If font already exists, just select it instead of adding a duplicate
        setCustomFontName(existingFont.name)
        setFontFamily(existingFont.name)
        if (fontInputRef.current) {
          fontInputRef.current.value = ""
        }
        setIsUploading(false)
        return
      }
      
      // Create unique name to avoid conflicts
      const timestamp = Date.now()
      const uniqueName = `${fileName}_${timestamp}`
      
      const fontFace = new FontFace(uniqueName, arrayBuffer)
      const loadedFont = await fontFace.load()
      
      document.fonts.add(loadedFont)
      
      const newFont = { name: uniqueName, displayName: fileName }
      const updatedFonts = [...uploadedFonts, newFont]
      
      setUploadedFonts(updatedFonts)
      setCustomFontName(uniqueName)
      setFontFamily(uniqueName)
      
      // Save to localStorage
      localStorage.setItem('uploadedFonts', JSON.stringify(updatedFonts))
      
      // Clear input
      if (fontInputRef.current) {
        fontInputRef.current.value = ""
      }
      
    } catch (err) {
      console.error("Failed to load font:", err)
      alert("Could not load that font. Please upload a valid TTF/OTF/WOFF file.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeCustomFont = (fontName: string) => {
    // Remove from document.fonts
    const fontFaces = Array.from(document.fonts.values())
    fontFaces.forEach(face => {
      if (face.family === fontName) {
        document.fonts.delete(face)
      }
    })
    
    // Update state
    const updatedFonts = uploadedFonts.filter(font => font.name !== fontName)
    setUploadedFonts(updatedFonts)
    
    // Reset font if it was selected
    if (fontFamily === fontName) {
      setFontFamily("Product Sans")
      setCustomFontName(null)
    }
    
    if (customFontName === fontName) {
      setCustomFontName(null)
    }
    
    // Update localStorage
    localStorage.setItem('uploadedFonts', JSON.stringify(updatedFonts))
  }

  const allFontOptions = [
    ...installedFonts.map(font => ({ value: font.name, label: font.displayName })),
    ...uploadedFonts.map(font => ({ value: font.name, label: font.displayName })),
  ]

  const handleColorChange = (color: string) => {
    // This will be called during dragging/interaction
    // We can choose to update immediately or not
  }

  const handleColorChangeComplete = (color: string) => {
    // This will be called when user finishes selecting color
    setTextColor(color)
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
          <div className="flex flex-wrap items-center gap-2">
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
            
            <div className="flex-1 w-full">
              <Select value={fontFamily === "Product Sans" ? undefined : fontFamily} onValueChange={(value) => {
                setFontFamily(value)
                if (uploadedFonts.some(font => font.name === value)) {
                  setCustomFontName(value)
                } else {
                  setCustomFontName(null)
                }
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Product Sans" />
                </SelectTrigger>
                <SelectContent>
                  {allFontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative basis-full">
              <Input
                ref={fontInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFontUpload}
                className="sr-only"
                id="font-upload"
                disabled={isUploading}
              />
              <Button
                asChild
                variant="outline"
                disabled={isUploading}
                className="px-3 w-full cursor-pointer"
              >
                <label htmlFor="font-upload" className="cursor-pointer">
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <p>Upload Custom Font</p>
                  )}
                </label>
              </Button>
            </div>
          </div>
        </div>

        {uploadedFonts.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Custom Fonts</Label>
            <div className="flex flex-wrap gap-1">
              {uploadedFonts.map((font) => (
                <div key={font.name} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  <span>{font.displayName}</span>
                  <button
                    onClick={() => removeCustomFont(font.name)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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