"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

export type WallpaperCanvasHandle = {
  downloadPNG: (width: number, height: number) => void
}

type Props = {
  month: number // 0-11
  year: number
  weekStart: "sunday" | "monday"
  textColor: string
  fontFamily: string
  imageSrc?: string
}

// Day labels
const DOW_SUN = ["S", "M", "T", "W", "T", "F", "S"]
const DOW_MON = ["M", "T", "W", "T", "F", "S", "S"]

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function firstDayOffset(year: number, monthIndex: number, weekStart: "sunday" | "monday") {
  // JS getDay: 0=Sun ... 6=Sat
  const jsDay = new Date(year, monthIndex, 1).getDay()
  if (weekStart === "sunday") return jsDay
  return (jsDay - 1 + 7) % 7
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous" // ensure canvas export works
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawWallpaper(
  canvas: HTMLCanvasElement,
  opts: Omit<Props, "imageSrc"> & { image?: HTMLImageElement; scaleForExport?: boolean },
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Enable smoothing explicitly for crisp typography and scaled images
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  // Background fill first
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, width, height)

  // Draw image cover with subtle vignette
  if (opts.image) {
    const img = opts.image
    const scale = Math.max(width / img.width, height / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    const dx = (width - dw) / 2
    const dy = (height - dh) / 2
    ctx.drawImage(img, dx, dy, dw, dh)

    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.25,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.9,
    )
    grad.addColorStop(0, "rgba(0,0,0,0.10)")
    grad.addColorStop(1, "rgba(0,0,0,0.40)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // slight bottom fade to help numbers over dark silhouettes
    const bottom = ctx.createLinearGradient(0, height * 0.7, 0, height)
    bottom.addColorStop(0, "rgba(0,0,0,0.0)")
    bottom.addColorStop(1, "rgba(0,0,0,0.18)")
    ctx.fillStyle = bottom
    ctx.fillRect(0, height * 0.7, width, height * 0.3)
  }

  function drawTrackedCentered(text: string, x: number, y: number, trackingPx: number) {
    const chars = Array.from(text)
    const widths = chars.map((ch) => ctx.measureText(ch).width)
    const total = widths.reduce((a, b) => a + b, 0) + trackingPx * Math.max(0, chars.length - 1)
    let cursor = x - total / 2
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]
      const w = widths[i]
      ctx.fillText(ch, cursor + w / 2, y)
      cursor += w + trackingPx
    }
  }

  // Helper to measure tracked width for fit-to-grid logic
  function measureTrackedWidth(text: string, trackingPx: number) {
    const chars = Array.from(text)
    const widths = chars.map((ch) => ctx.measureText(ch).width)
    return widths.reduce((a, b) => a + b, 0) + trackingPx * Math.max(0, chars.length - 1)
  }

  // Tuned proportions; weekdays and dates share the same size
  let monthSize = Math.round(height * 0.05)
  const labelDaySize = Math.round(height * 0.02) // same size for weekday labels and dates

  const gridWidth = width * 0.25
  const startX = (width - gridWidth) / 2
  const colW = gridWidth / 7
  const baseY = height * 0.34

  // Common text styles
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"
  ctx.fillStyle = opts.textColor

  ctx.shadowColor = "rgba(0,0,0,0.25)"
  ctx.shadowBlur = Math.max(1, Math.round(height * 0.004))
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Default to Montserrat and sanitize CSS vars (canvas can't resolve them)
  const monthName = new Date(opts.year, opts.month, 1).toLocaleString("en-US", { month: "long" }).toLowerCase()

  const incoming = (opts.fontFamily || "").trim()
  const resolved =
    !incoming ||
    incoming.toLowerCase() === "default" ||
    incoming.toLowerCase() === "default (montserrat)" ||
    incoming === "__default__"
      ? "Montserrat, ui-sans-serif, system-ui"
      : incoming
  const safeFamily = resolved.replace(/var$$[^)]+$$\s*,?/g, "").trim()

  // Ensure month width never exceeds calendar width (with a little margin)
  let tracking = monthSize * 0.055
  ctx.font = `700 ${monthSize}px ${safeFamily}`
  let measured = measureTrackedWidth(monthName, tracking)
  const maxMonthWidth = gridWidth * 0.96
  while (measured > maxMonthWidth && monthSize > Math.round(height * 0.06)) {
    monthSize -= 2
    tracking = monthSize * 0.055
    ctx.font = `700 ${monthSize}px ${safeFamily}`
    measured = measureTrackedWidth(monthName, tracking)
  }
  drawTrackedCentered(monthName, width / 2, baseY, tracking)

  // Day-of-week labels (same size as dates, slightly faint)
  const labels = opts.weekStart === "sunday" ? DOW_SUN : DOW_MON
  ctx.font = `500 ${labelDaySize}px ${safeFamily}`
  const dowY = baseY + Math.round(height * 0.08)
  labels.forEach((label, i) => {
    const x = startX + i * colW + colW / 2
    ctx.globalAlpha = 0.8
    ctx.fillText(label, x, dowY)
  })

  // Dates (same size as weekday labels)
  ctx.font = `500 ${labelDaySize}px ${safeFamily}`
  const totalDays = daysInMonth(opts.year, opts.month)
  const offset = firstDayOffset(opts.year, opts.month, opts.weekStart)
  const rowsTop = dowY + Math.round(height * 0.055)
  const rowH = Math.round(height * 0.055)

  ctx.globalAlpha = 1
  for (let d = 1; d <= totalDays; d++) {
    const idx = offset + (d - 1)
    const col = idx % 7
    const row = Math.floor(idx / 7)
    const x = startX + col * colW + colW / 2
    const y = rowsTop + row * rowH
    ctx.fillText(String(d), x, y)
  }

  // Optional credit line kept blank intentionally, but spacing preserved
  ctx.globalAlpha = 0.8
  ctx.font = `500 ${Math.round(height * 0.018)}px ${safeFamily}`
  ctx.fillText("", width / 2, rowsTop + rowH * 6.1)
}

const WallpaperCanvas = forwardRef<WallpaperCanvasHandle, Props>(function WallpaperCanvas(
  { month, year, weekStart, textColor, fontFamily, imageSrc },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      downloadPNG: (w: number, h: number) => {
        const exportCanvas = document.createElement("canvas")
        exportCanvas.width = w
        exportCanvas.height = h
        drawWallpaper(exportCanvas, {
          month,
          year,
          weekStart,
          textColor,
          fontFamily,
          image: imgRef.current || undefined,
          scaleForExport: true,
        })
        const link = document.createElement("a")
        link.download = `calendar-${year}-${String(month + 1).padStart(2, "0")}.png`
        link.href = exportCanvas.toDataURL("image/png")
        link.click()
        exportCanvas.remove()
      },
    }),
    [month, year, weekStart, textColor, fontFamily],
  )

  // Render preview
  useEffect(() => {
    let canceled = false
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.max(320, Math.floor(rect.width * dpr))
    canvas.height = Math.max(180, Math.floor(rect.height * dpr))

    async function render() {
      let img: HTMLImageElement | undefined = undefined
      if (imageSrc) {
        try {
          img = await loadImage(imageSrc)
          if (!canceled) imgRef.current = img
        } catch (e) {
          console.error("[v0] image load failed", e)
        }
      }
      if (!canceled) {
        drawWallpaper(canvas, {
          month,
          year,
          weekStart,
          textColor,
          fontFamily,
          image: imgRef.current || img,
        })
      }
    }
    render()

    return () => {
      canceled = true
    }
  }, [month, year, weekStart, textColor, fontFamily, imageSrc])

  return <canvas ref={canvasRef} aria-label="Wallpaper preview canvas" className="h-full w-full block" />
})

export default WallpaperCanvas
