"use client";

import { HeaderFormat, ViewMode } from "@/lib/calendar-store";
import { formatMonthHeader } from "@/lib/calendar-utils";
import { getAverageLuminance, getContrastColor } from "@/lib/color-utils";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type WallpaperCanvasHandle = {
  downloadPNG: (width: number, height: number) => void;
  exportPNGBlob: (width: number, height: number) => Promise<Blob | null>;
};

type Props = {
  month: number; // 0-11
  year: number;
  weekStart: "sunday" | "monday";
  headerFormat: HeaderFormat;
  textColor: string;
  fontFamily: string;
  imageSrc?: string;
  // Normalized offsets (-1..1) where (0,0) is centered
  offsetX?: number;
  offsetY?: number;
  viewMode?: ViewMode;
  calendarScale?: number;
  setTextColor: (color: string) => void;
  textOverlay?: {
    enabled: boolean;
    content: string;
    fontSize: number;
    font: string;
    useTypographyFont: boolean;
    position: string;
  };
};

// Day labels
const DOW_SUN = ["S", "M", "T", "W", "T", "F", "S"];
const DOW_MON = ["M", "T", "W", "T", "F", "S", "S"];

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function firstDayOffset(
  year: number,
  monthIndex: number,
  weekStart: "sunday" | "monday",
) {
  // JS getDay: 0=Sun ... 6=Sat
  const jsDay = new Date(year, monthIndex, 1).getDay();
  if (weekStart === "sunday") return jsDay;
  return (jsDay - 1 + 7) % 7;
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // ensure canvas export works
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawWallpaperBackground(
  canvas: HTMLCanvasElement,
  opts: Omit<Props, "imageSrc" | "setTextColor"> & {
    image?: HTMLImageElement;
  },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // TypeScript assertion to help with strict null checks
  const context = ctx as CanvasRenderingContext2D;

  // Enable smoothing explicitly for crisp typography and scaled images
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const { width, height } = canvas;

  // Draw image cover with subtle vignette
  if (opts.image) {
    const img = opts.image;
    const scale = Math.max(width / img.width, height / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;
    context.drawImage(img, dx, dy, dw, dh);

    const grad = context.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.25,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.9,
    );
    grad.addColorStop(0, "rgba(0,0,0,0.10)");
    grad.addColorStop(1, "rgba(0,0,0,0.40)");
    context.fillStyle = grad;
    context.fillRect(0, 0, width, height);

    // slight bottom fade to help numbers over dark silhouettes
    const bottom = context.createLinearGradient(0, height * 0.7, 0, height);
    bottom.addColorStop(0, "rgba(0,0,0,0.0)");
    bottom.addColorStop(1, "rgba(0,0,0,0.18)");
    context.fillStyle = bottom;
    context.fillRect(0, height * 0.7, width, height * 0.3);
  }
}

function drawWallpaperCalendar(
  canvas: HTMLCanvasElement,
  opts: Omit<Props, "imageSrc" | "setTextColor">,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const context = ctx as CanvasRenderingContext2D;
  const { width, height } = canvas;

  function drawTrackedCentered(
    text: string,
    x: number,
    y: number,
    trackingPx: number,
  ) {
    const chars = Array.from(text);
    const widths = chars.map((ch) => context.measureText(ch).width);
    const total =
      widths.reduce((a, b) => a + b, 0) +
      trackingPx * Math.max(0, chars.length - 1);
    let cursor = x - total / 2;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const w = widths[i];
      context.fillText(ch, cursor + w / 2, y);
      cursor += w + trackingPx;
    }
  }

  // Helper to measure tracked width for fit-to-grid logic
  function measureTrackedWidth(text: string, trackingPx: number) {
    const chars = Array.from(text);
    const widths = chars.map((ch) => context.measureText(ch).width);
    return (
      widths.reduce((a, b) => a + b, 0) +
      trackingPx * Math.max(0, chars.length - 1)
    );
  }

  // Adjust proportions based on view mode
  const isMobile = opts.viewMode === "mobile";
  const scale = Math.max(0.5, Math.min(1.5, opts.calendarScale ?? 1));

  // Tuned proportions; weekdays and dates share the same size
  let monthSize = Math.round(height * (isMobile ? 0.03 : 0.05) * scale);
  const labelDaySize = Math.round(height * (isMobile ? 0.0115 : 0.02) * scale); // same size for weekday labels and dates

  const gridWidth = width * (isMobile ? 0.35 : 0.25) * scale;
  const startX = (width - gridWidth) / 2;
  const colW = gridWidth / 7;
  const baseY = height * (isMobile ? 0.4 : 0.34);

  // Apply normalized offset to calendar block and month title
  const normX = Math.max(-1, Math.min(1, opts.offsetX ?? 0));
  let normY = Math.max(-1, Math.min(1, opts.offsetY ?? 0));

  // FIX: Adjust vertical position based on scale to keep it centered.
  // At scale 1.0, adjustment is 0. At scale 1.5, adjustment is -0.25.
  const verticalScaleAdjustment = (scale - 1) * -0.5;
  normY += verticalScaleAdjustment;
  normY = Math.max(-1, Math.min(1, normY));

  // Allow shifting the grid all the way until its left/right edges touch the canvas edges.
  // Since the grid is centered, the left margin equals the right margin = startX.
  const maxShiftX = startX;
  const maxShiftY = height * 0.3; // allow up to 30% height shift
  const shiftX = normX * maxShiftX;
  const shiftY = normY * maxShiftY;

  // Common text styles
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillStyle = opts.textColor;

  // context.shadowColor = "rgba(0,0,0,0.25)"
  context.shadowBlur = Math.max(1, Math.round(height * 0.004));
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  // Default to Product Sans and sanitize CSS vars (canvas can't resolve them)
  const monthName = formatMonthHeader(opts.month, opts.year, opts.headerFormat);

  const incoming = (opts.fontFamily || "").trim();
  const MONTH_ONLY_DELIM = "|||MONTH_ONLY|||";
  let monthFamily = incoming;
  let bodyFamily = incoming || "Product Sans, ui-sans-serif, system-ui";
  if (incoming.includes(MONTH_ONLY_DELIM)) {
    const parts = incoming.split(MONTH_ONLY_DELIM);
    monthFamily = (parts[0] || "Product Sans, ui-sans-serif, system-ui").trim();
    bodyFamily = (parts[1] || "Product Sans, ui-sans-serif, system-ui").trim();
  }

  function sanitizeFamily(fam: string) {
    if (
      !fam ||
      fam.toLowerCase() === "default" ||
      fam.toLowerCase() === "default (product sans)" ||
      fam === "__default__"
    ) {
      return "Product Sans, ui-sans-serif, system-ui";
    }
    return fam.replace(/var\([^)]*\)\s*,?/g, "").trim();
  }

  function getFontWeight(fontFamily: string) {
    // Use specific weights for certain fonts
    if (fontFamily.includes("Montserrat")) return "500";
    if (fontFamily.includes("Doto")) return "700";
    return "400";
  }

  const safeMonthFamily = sanitizeFamily(monthFamily);
  const safeBodyFamily = sanitizeFamily(bodyFamily);

  // Ensure month width never exceeds calendar width (with a little margin)
  let tracking = monthSize * 0.055;
  const monthWeight = getFontWeight(monthFamily);
  context.font = `${monthWeight} ${monthSize}px ${safeMonthFamily}`;
  let measured = measureTrackedWidth(monthName, tracking);
  const maxMonthWidth = gridWidth * 0.96;
  while (measured > maxMonthWidth && monthSize > Math.round(height * 0.06)) {
    monthSize -= 2;
    tracking = monthSize * 0.055;
    context.font = `${monthWeight} ${monthSize}px ${safeMonthFamily}`;
    measured = measureTrackedWidth(monthName, tracking);
  }
  drawTrackedCentered(monthName, width / 2 + shiftX, baseY + shiftY, tracking);

  // Day-of-week labels (same size as dates, slightly faint)
  const labels = opts.weekStart === "sunday" ? DOW_SUN : DOW_MON;
  const bodyWeight = getFontWeight(bodyFamily);
  context.font = `${bodyWeight} ${labelDaySize}px ${safeBodyFamily}`;
  const dowY =
    baseY + Math.round(height * (isMobile ? 0.05 : 0.08) * scale) + shiftY;
  labels.forEach((label, i) => {
    const x = startX + i * colW + colW / 2 + shiftX;
    context.globalAlpha = 0.8;
    context.fillText(label, x, dowY);
  });

  // Dates (same size as weekday labels)
  context.font = `${bodyWeight} ${labelDaySize}px ${safeBodyFamily}`;
  const totalDays = daysInMonth(opts.year, opts.month);
  const offset = firstDayOffset(opts.year, opts.month, opts.weekStart);
  const rowsTop = dowY + Math.round(height * (isMobile ? 0.03 : 0.055) * scale);
  const rowH = Math.round(height * (isMobile ? 0.027 : 0.055) * scale);

  context.globalAlpha = 1;
  for (let d = 1; d <= totalDays; d++) {
    const idx = offset + (d - 1);
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const x = startX + col * colW + colW / 2 + shiftX;
    const y = rowsTop + row * rowH;
    context.fillText(String(d), x, y);
  }

  // Optional credit line kept blank intentionally, but spacing preserved
  context.globalAlpha = 0.8;
  context.font = `${bodyWeight} ${Math.round(
    height * 0.018,
  )}px ${safeBodyFamily}`;
  context.fillText("", width / 2 + shiftX, rowsTop + rowH * 6.1);

  // Helper function to wrap text to fit within a maximum width
  function wrapText(
    text: string,
    maxWidth: number,
    context: CanvasRenderingContext2D,
  ): string[] {
    const paragraphs = text.split("\n");
    const wrappedLines: string[] = [];

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        wrappedLines.push("");
        continue;
      }

      const words = paragraph.split(" ");
      let currentLine = "";

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && currentLine) {
          // Line is too long, push current line and start a new one
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      // Push the last line of the paragraph
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }

    return wrappedLines;
  }

  // Text overlay with 9-position grid support
  if (opts.textOverlay?.enabled && opts.textOverlay.content) {
    context.globalAlpha = 1;
    const overlayFontSize = Math.round(
      height * 0.04 * opts.textOverlay.fontSize * scale,
    );

    // Determine which font to use
    let overlayFontFamily: string;
    let overlayFontWeight: string;

    if (opts.textOverlay.useTypographyFont) {
      // Use main typography font (month font)
      overlayFontFamily = safeMonthFamily;
      overlayFontWeight = monthWeight;
    } else {
      // Use custom overlay font
      const customFont = opts.textOverlay.font || "Product Sans";
      overlayFontFamily = sanitizeFamily(customFont);
      overlayFontWeight = getFontWeight(customFont);
    }

    context.font = `${overlayFontWeight} ${overlayFontSize}px ${overlayFontFamily}`;
    context.fillStyle = opts.textColor;
    // Add shadow for better readability
    context.shadowColor = "rgba(0,0,0,0.5)";
    context.shadowBlur = Math.max(2, Math.round(height * 0.008));

    // Calculate position based on 9-zone grid
    const paddingX = width * 0.05; // Horizontal safe margin
    const paddingY = height * 0.05; // Vertical safe margin
    const position = opts.textOverlay.position || "center";

    // Determine horizontal alignment and X position
    let x: number;
    let maxTextWidth: number;

    if (position.includes("left")) {
      context.textAlign = "left";
      x = paddingX;
      maxTextWidth = width - 2 * paddingX;
    } else if (position.includes("right")) {
      context.textAlign = "right";
      x = width - paddingX;
      maxTextWidth = width - 2 * paddingX;
    } else {
      context.textAlign = "center";
      x = width / 2;
      maxTextWidth = width - 2 * paddingX;
    }

    // Wrap text to fit within available width
    const lines = wrapText(opts.textOverlay.content, maxTextWidth, context);
    const lineHeight = overlayFontSize * 1.2; // 1.2x line spacing
    const totalHeight = lines.length * lineHeight;

    // Determine vertical alignment and starting Y position
    // Use 'top' baseline for all positions to ensure consistent downward expansion (like month name)
    context.textBaseline = "top";
    let startY: number;
    if (position.startsWith("top-")) {
      startY = paddingY;
    } else if (position.startsWith("bottom-")) {
      startY = height - paddingY - totalHeight;
    } else {
      // middle-* or center
      startY = (height - totalHeight) / 2;
    }

    // Draw each line
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      context.fillText(line, x, y);
    });

    // Reset shadow
    context.shadowColor = "rgba(0,0,0,0.25)";
    context.shadowBlur = Math.max(1, Math.round(height * 0.004));
  }
}

function drawWallpaper(
  canvas: HTMLCanvasElement,
  opts: Omit<Props, "imageSrc" | "setTextColor"> & {
    image?: HTMLImageElement;
    scaleForExport?: boolean;
  },
) {
  drawWallpaperBackground(canvas, opts);
  drawWallpaperCalendar(canvas, opts);
}

const WallpaperCanvas = forwardRef<WallpaperCanvasHandle, Props>(
  function WallpaperCanvas(
    {
      month,
      year,
      weekStart,
      headerFormat,
      textColor,
      fontFamily,
      imageSrc,
      offsetX = 0,
      offsetY = 0,
      viewMode = "desktop",
      calendarScale = 1,
      setTextColor,
      textOverlay,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const prevImageSrcRef = useRef<string | undefined>(undefined);
    const prevFontKeyRef = useRef<string | undefined>(undefined);

    useImperativeHandle(ref, () => {
      const renderToCanvas = (w: number, h: number) => {
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = w;
        exportCanvas.height = h;

        drawWallpaper(exportCanvas, {
          month,
          year,
          weekStart,
          headerFormat,
          textColor,
          fontFamily,
          image: imgRef.current || undefined,
          scaleForExport: true,
          offsetX,
          offsetY,
          viewMode,
          calendarScale,
          textOverlay,
        });
        return exportCanvas;
      };

      return {
        downloadPNG: (w: number, h: number) => {
          const exportCanvas = renderToCanvas(w, h);
          const link = document.createElement("a");
          const modeSuffix = viewMode === "mobile" ? "-mobile" : "";
          link.download = `calendar-${year}-${String(month + 1).padStart(
            2,
            "0",
          )}${modeSuffix}.png`;
          link.href = exportCanvas.toDataURL("image/png");
          link.click();
          exportCanvas.remove();
        },
        exportPNGBlob: async (w: number, h: number) => {
          const exportCanvas = renderToCanvas(w, h);
          const blob = await new Promise<Blob | null>((resolve) =>
            exportCanvas.toBlob((value) => resolve(value), "image/png"),
          );
          exportCanvas.remove();
          return blob;
        },
      };
    }, [
      month,
      year,
      weekStart,
      headerFormat,
      textColor,
      fontFamily,
      offsetX,
      offsetY,
      imageSrc,
      viewMode,
      calendarScale,
      textOverlay,
    ]);

    function parseFamilies(input: string) {
      const str = (input || "").trim();
      const DELIM = "|||MONTH_ONLY|||";
      let monthFam = str;
      let bodyFam = "Product Sans, ui-sans-serif, system-ui";
      if (str.includes(DELIM)) {
        const parts = str.split(DELIM);
        monthFam = (parts[0] || bodyFam).trim();
        bodyFam = (parts[1] || bodyFam).trim();
      }
      return { monthFam, bodyFam };
    }

    async function ensureFontsLoaded(familyString: string) {
      try {
        const firstToken = (familyString.split(",")[0] || "").trim();
        const cleaned = firstToken.replace(/^\"|\"$/g, "");
        if (!cleaned) return;

        // Narrowly type the Font Loading API to avoid `any`
        const fonts = (
          document as unknown as {
            fonts?: {
              load?: (font: string) => Promise<unknown>;
              ready?: Promise<unknown>;
            };
          }
        ).fonts;

        const loads: Promise<unknown>[] = [
          fonts?.load?.(`400 24px ${JSON.stringify(cleaned)}`) ??
            Promise.resolve(),
          fonts?.load?.(`500 24px ${JSON.stringify(cleaned)}`) ??
            Promise.resolve(),
          fonts?.load?.(`700 24px ${JSON.stringify(cleaned)}`) ??
            Promise.resolve(),
        ];

        await Promise.allSettled(loads);
        await (fonts?.ready ?? Promise.resolve());
      } catch {
        // noop
      }
    }

    // Render preview
    useEffect(() => {
      let canceled = false;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width * dpr));
      canvas.height = Math.max(180, Math.floor(rect.height * dpr));

      const baseDrawOpts = {
        month,
        year,
        weekStart,
        headerFormat,
        textColor,
        fontFamily,
        offsetX,
        offsetY,
        viewMode,
        calendarScale,
        textOverlay,
      };

      if (imgRef.current) {
        drawWallpaper(canvas, { ...baseDrawOpts, image: imgRef.current });
      }

      async function fadeTransition(
        canvas: HTMLCanvasElement,
        oldImg: HTMLImageElement | null,
        newImg: HTMLImageElement,
        duration = 800, // ms
      ) {
        const start = performance.now();

        const animate = (time: number) => {
          const t = Math.min(1, (time - start) / duration);
          const eased = t * t * (3 - 2 * t);

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          if (oldImg) {
            ctx.save();
            ctx.globalAlpha = 1 - eased;
            drawWallpaper(canvas, { ...baseDrawOpts, image: oldImg });
            ctx.restore();
          }

          ctx.save();
          ctx.globalAlpha = eased;
          drawWallpaper(canvas, { ...baseDrawOpts, image: newImg });
          ctx.restore();

          if (t < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }

      async function render() {
        const needImageLoad =
          !!imageSrc && imageSrc !== prevImageSrcRef.current;

        const fontKey = fontFamily;
        const needFontLoad = fontKey !== prevFontKeyRef.current;

        let loadedImg: HTMLImageElement | undefined = undefined;
        if (needImageLoad && imageSrc) {
          try {
            loadedImg = await loadImage(imageSrc);

            // ANALYZE FOR AUTO TEXT COLOR
            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d", {
              willReadFrequently: true,
            });
            if (tempCtx) {
              tempCanvas.width = loadedImg.width;
              tempCanvas.height = loadedImg.height;

              try {
                // Draw the background with effects to the temp canvas
                drawWallpaperBackground(tempCanvas, {
                  ...baseDrawOpts,
                  image: loadedImg,
                });

                // Analyze the result, but only in the center of the canvas where the calendar is.
                // This avoids the dark vignette edges from skewing the result.
                const w = tempCanvas.width;
                const h = tempCanvas.height;
                const analysisW = w * 0.5;
                const analysisH = h * 0.5;
                const analysisX = (w - analysisW) / 2;
                const analysisY = (h - analysisH) / 2;

                const avgLuminance = getAverageLuminance(
                  tempCtx,
                  analysisX,
                  analysisY,
                  analysisW,
                  analysisH,
                );
                const newColor = getContrastColor(avgLuminance);

                if (newColor !== textColor) {
                  setTextColor(newColor);
                }
                // Could not analyze, ignore.
              } catch (e) {
                // Could not analyze image for automatic text color.
              }
              tempCanvas.remove();
            }
            // End analysis

            if (!canceled) {
              await fadeTransition(canvas!, imgRef.current, loadedImg);
              imgRef.current = loadedImg;
              prevImageSrcRef.current = imageSrc;
            }
          } catch (e) {
            // image load failed
          }
        }

        if (needFontLoad) {
          const { monthFam, bodyFam } = parseFamilies(fontFamily);
          await Promise.allSettled([
            ensureFontsLoaded(monthFam),
            ensureFontsLoaded(bodyFam),
          ]);
          if (!canceled) prevFontKeyRef.current = fontKey;
        }

        if (!canceled && !needImageLoad) {
          drawWallpaper(canvas!, {
            ...baseDrawOpts,
            image: imgRef.current || loadedImg,
          });
        }
      }
      render();

      return () => {
        canceled = true;
      };
    }, [
      month,
      year,
      weekStart,
      headerFormat,
      textColor,
      fontFamily,
      imageSrc,
      offsetX,
      offsetY,
      viewMode,
      calendarScale,
      setTextColor,
      textOverlay,
    ]);

    return (
      <canvas
        ref={canvasRef}
        aria-label="Wallpaper preview canvas"
        className="h-full w-full block"
      />
    );
  },
);

export default WallpaperCanvas;
