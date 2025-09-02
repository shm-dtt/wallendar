"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportSettingsProps {
  onDownload: () => void
}

export function ExportSettings({ onDownload }: ExportSettingsProps) {
  return (
    <>
      <Button onClick={onDownload} size="lg" className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download 4K Wallpaper
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Exports at 3840×2160 resolution
      </p>
    </>
  )
}