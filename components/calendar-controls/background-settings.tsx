"use client"

import { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette, X } from "lucide-react"

interface BackgroundSettingsProps {
  imageSrc?: string
  setImageSrc: (src?: string) => void
  onSampleImage: () => void
}

export function BackgroundSettings({ imageSrc, setImageSrc, onSampleImage }: BackgroundSettingsProps) {
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
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-primary" />
        <h2 className="font-semibold">Background</h2>
      </div>

      <div className="space-y-4">
        {imageSrc && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm font-medium">Background image active</span>
              </div>
              <Button variant="ghost" size="sm" onClick={removeImage} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="imageUpload">Upload Image</Label>
          <Input
            id="imageUpload"
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <p className="text-xs text-muted-foreground">
            Images are automatically scaled to fit 16:9 aspect ratio
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={onSampleImage} className="w-full">
          Try Sample Background
        </Button>
      </div>
    </div>
  )
}