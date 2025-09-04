"use client"

import { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette, X } from "lucide-react"
import { useCalendarStore } from "@/lib/calendar-store"

export function BackgroundSettings() {
  const imageSrc = useCalendarStore((state) => state.imageSrc)
  const setImageSrc = useCalendarStore((state) => state.setImageSrc)
  const handleSampleImage = useCalendarStore((state) => state.handleSampleImage)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      setImageSrc(url)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageSrc(undefined)
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  return (
    <div className="py-1">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Background</h2>
      </div>

      <div className="space-y-3">
        {imageSrc && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-xs font-medium">Background image active</span>
              </div>
              <Button variant="ghost" size="sm" onClick={removeImage} className="h-5 w-5 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="imageUpload" className="text-sm">Upload Image</Label>
          <Input
            id="imageUpload"
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="h-8 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <p className="text-xs text-muted-foreground">
            Images are automatically scaled to fit 16:9 aspect ratio
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleSampleImage} className="w-full h-8 text-xs">
          Try Sample Background
        </Button>
      </div>
    </div>
  )
}