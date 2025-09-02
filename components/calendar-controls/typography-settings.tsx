"use client"

import { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Type, X } from "lucide-react"

interface TypographySettingsProps {
  textColor: string
  setTextColor: (color: string) => void
  fontFamily: string
  setFontFamily: (family: string) => void
  customFontName: string | null
  setCustomFontName: (name: string | null) => void
}

export function TypographySettings({
  textColor, setTextColor, fontFamily, setFontFamily, 
  customFontName, setCustomFontName
}: TypographySettingsProps) {
  const fontInputRef = useRef<HTMLInputElement | null>(null)

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
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Type className="w-4 h-4 text-primary" />
        <h2 className="font-semibold">Typography</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="textColor">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="textColor"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-16 h-9 p-1 cursor-pointer"
            />
            <Input
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontSelect">Font Family</Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger id="fontSelect">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Montserrat">Montserrat (Default)</SelectItem>
              <SelectItem value="Serif">Serif</SelectItem>
              <SelectItem value="Mono">Monospace</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {customFontName && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm font-medium">Custom: {customFontName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={removeCustomFont} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fontUpload">Upload Custom Font</Label>
          <Input
            id="fontUpload"
            ref={fontInputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleFontUpload}
            className="file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <p className="text-xs text-muted-foreground">Supports TTF, OTF, WOFF files</p>
        </div>
      </div>
    </div>
  )
}