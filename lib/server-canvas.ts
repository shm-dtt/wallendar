import { createCanvas, loadImage, registerFont } from "canvas";
// Use an alias to avoid conflict with the DOM interface
import type { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from "canvas";
import path from "path";
// Import HeaderFormat from calendar-store directly to avoid intermediate export issues
import { HeaderFormat } from "./calendar-store";
import { daysInMonth, firstDayOffset, formatMonthHeader } from "./calendar-utils";
import { imageSize } from "image-size";

// Register fonts
const fontsDir = path.join(process.cwd(), "public", "fonts");

// Helper to safely register fonts
const register = (file: string, family: string, weight?: string) => {
  try {
    registerFont(path.join(fontsDir, file), { family, weight });
  } catch (e) {
    console.error(`Failed to register font ${family}:`, e);
  }
};

// Register all available fonts
register("ProductSans.ttf", "Product Sans");
register("Montserrat.ttf", "Montserrat", "500");
register("Doto.ttf", "Doto", "700");
register("CraftyGirls.ttf", "Crafty Girls");
register("FreckleFace.ttf", "Freckle Face");
register("PlaywriteCA.ttf", "Playwrite CA");
register("SegoeScript.TTF", "Segoe Script");
register("InstrumentSerif.ttf", "Instrument Serif");
register("Ultra.ttf", "Ultra");

// Canvas rendering constants
const VIGNETTE_GRADIENT_START = 0.0;
const VIGNETTE_GRADIENT_MID = 0.45;
const VIGNETTE_GRADIENT_END = 1.0;
const VIGNETTE_OPACITY_CENTER = 0.0;
const VIGNETTE_OPACITY_EDGE = 0.65;

const BOTTOM_FADE_HEIGHT_RATIO = 0.2;
const BOTTOM_FADE_OPACITY = 0.65;

// Calendar layout constants
const MOBILE_WIDTH_THRESHOLD = 600;
const DESKTOP_CALENDAR_TOP_RATIO = 0.45;
const MOBILE_CALENDAR_TOP_RATIO = 0.5;
const DESKTOP_CALENDAR_WIDTH = 460;
const MOBILE_CALENDAR_WIDTH_RATIO = 0.9;

const MONTH_LABEL_SIZE_RATIO = 0.15;
const YEAR_LABEL_SIZE_RATIO = 0.11;
const DAY_LABEL_SIZE_RATIO = 0.055;
const DATE_SIZE_RATIO = 0.08;

const MONTH_LABEL_SPACING = 16;
const CALENDAR_GRID_TOP_SPACING = 30;
const DAY_LABELS_BOTTOM_MARGIN = 8;
const DATE_GRID_ROW_SPACING = 10;

const TEXT_OVERLAY_FONT_SIZE = 48;
const TEXT_OVERLAY_LINE_HEIGHT_RATIO = 1.4;
const TEXT_OVERLAY_MARGIN = 40;
const TEXT_OVERLAY_TOP_PADDING = 80;

/**
 * Image size limits to prevent excessive memory consumption.
 * 4K resolution (4096x4096) limits memory usage to ~64MB per image
 * during canvas operations, compared to ~250MB+ for 8K.
 */
const MAX_WIDTH = 4096;
const MAX_HEIGHT = 4096;
const MAX_PIXELS = 16_000_000;

export type WallpaperConfig = {
  month: number;
  year: number;
  weekStart: "sunday" | "monday";
  headerFormat: HeaderFormat;
  textColor: string;
  fontFamily: string;
  offsetX: number;
  offsetY: number;
  viewMode: "desktop" | "mobile";
  calendarScale: number;
  textOverlay?: {
    enabled: boolean;
    content: string;
    fontSize: number;
    font: string;
    useTypographyFont: boolean;
    position: string;
  };
};

export const VALID_HEADER_FORMATS: HeaderFormat[] = [
  "full",
  "short",
  "numeric",
  "numeric-full-year",
  "numeric-short-year",
  "short-short-year",
  "short-full-year",
];

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

function sanitizeFamily(fam: string) {
  if (!fam || typeof fam !== "string") {
    return "Product Sans";
  }
  
  const cleaned = fam.replace(/var\([^)]*\)\s*,?/g, "").trim();
  
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(cleaned)) {
    console.warn(`Invalid font family characters detected: ${fam}`);
    return "Product Sans";
  }
  
  return cleaned;
}

function getFontWeight(family: string) {
  if (family.includes("Montserrat")) return "500";
  if (family.includes("Doto")) return "700";
  return "400";
}

function drawBackground(ctx: NodeCanvasRenderingContext2D, width: number, height: number, img: any): void {
  ctx.drawImage(img, 0, 0, width, height);
  
  const vignetteGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * VIGNETTE_GRADIENT_MID
  );
  vignetteGradient.addColorStop(VIGNETTE_GRADIENT_START, `rgba(0,0,0,${VIGNETTE_OPACITY_CENTER})`);
  vignetteGradient.addColorStop(VIGNETTE_GRADIENT_END, `rgba(0,0,0,${VIGNETTE_OPACITY_EDGE})`);
  ctx.fillStyle = vignetteGradient;
  ctx.fillRect(0, 0, width, height);
  
  const fadeHeight = height * BOTTOM_FADE_HEIGHT_RATIO;
  const fadeGradient = ctx.createLinearGradient(0, height - fadeHeight, 0, height);
  fadeGradient.addColorStop(0, `rgba(0,0,0,0)`);
  fadeGradient.addColorStop(1, `rgba(0,0,0,${BOTTOM_FADE_OPACITY})`);
  ctx.fillStyle = fadeGradient;
  ctx.fillRect(0, height - fadeHeight, width, fadeHeight);
}

function calculateLayout(width: number, height: number, config: WallpaperConfig) {
  const isMobile = width <= MOBILE_WIDTH_THRESHOLD;
  const viewMode = config.viewMode || (isMobile ? "mobile" : "desktop");
  const scale = config.calendarScale || 1;
  
  const calW = width * (isMobile ? 0.35 : 0.25) * scale;
  
  return { isMobile, viewMode, scale, calW };
}

function drawMonthHeader(
  ctx: NodeCanvasRenderingContext2D,
  config: WallpaperConfig,
  calW: number,
  calH: number,
  yPos: number
): number {
  const { month, year, headerFormat, textColor, fontFamily } = config;
  const monthName = formatMonthHeader(month, year, headerFormat);
  
  function measureTrackedWidth(text: string, trackingPx: number) {
    const chars = Array.from(text);
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    return (
      widths.reduce((a, b) => a + b, 0) +
      trackingPx * Math.max(0, chars.length - 1)
    );
  }

  function drawTrackedCentered(
    text: string,
    x: number,
    y: number,
    trackingPx: number
  ) {
    const chars = Array.from(text);
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const total =
      widths.reduce((a, b) => a + b, 0) +
      trackingPx * Math.max(0, chars.length - 1);
    let cursor = x - total / 2;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const w = widths[i];
      ctx.fillText(ch, cursor + w / 2, y);
      cursor += w + trackingPx;
    }
  }

  const family = sanitizeFamily(fontFamily);
  const weight = getFontWeight(family);

  const isMobile = config.viewMode === "mobile";
  const scale = config.calendarScale;
  
  let monthSize = Math.round(calH * (isMobile ? 0.03 : 0.05) * scale);
  const minMonthSize = Math.round(monthSize * 0.5);

  let tracking = monthSize * 0.055;
  ctx.font = `${weight} ${monthSize}px "${family}"`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  
  let measured = measureTrackedWidth(monthName, tracking);
  const maxMonthWidth = calW * 0.96;
  
  while (measured > maxMonthWidth && monthSize > minMonthSize) {
    monthSize -= 2;
    tracking = monthSize * 0.055;
    ctx.font = `${weight} ${monthSize}px "${family}"`;
    measured = measureTrackedWidth(monthName, tracking);
  }
  
  drawTrackedCentered(monthName, 0, yPos, tracking);
  
  return yPos; 
}

function drawDayLabels(
  ctx: NodeCanvasRenderingContext2D,
  config: WallpaperConfig,
  calW: number,
  calH: number,
  yPos: number,
  weekStart: "sunday" | "monday"
): number {
  const dayLabels = weekStart === "sunday" 
    ? ["S", "M", "T", "W", "T", "F", "S"]
    : ["M", "T", "W", "T", "F", "S", "S"];
    
  const colW = calW / 7;
  const isMobile = config.viewMode === "mobile";
  const scale = config.calendarScale;
  
  const labelDaySize = Math.round(calH * (isMobile ? 0.0115 : 0.02) * scale);
  const family = sanitizeFamily(config.fontFamily);
  const weight = getFontWeight(family);

  ctx.font = `${weight} ${labelDaySize}px "${family}"`;
  ctx.fillStyle = config.textColor;
  ctx.textAlign = "center";
  
  const spacing = Math.round(calH * (isMobile ? 0.05 : 0.08) * scale);
  const drawY = yPos + spacing;

  const startX = -calW / 2 + colW / 2;

  ctx.save();
  ctx.globalAlpha = 0.8;
  dayLabels.forEach((label, i) => {
    ctx.fillText(label, startX + i * colW, drawY);
  });
  ctx.restore();
  
  return drawY;
}

function drawDateGrid(
  ctx: NodeCanvasRenderingContext2D,
  config: WallpaperConfig,
  calW: number,
  calH: number,
  yPos: number
): void {
  const { month, year, weekStart, textColor, fontFamily } = config;
  const isMobile = config.viewMode === "mobile";
  const scale = config.calendarScale;

  const totalDays = daysInMonth(year, month);
  const offset = firstDayOffset(year, month, weekStart);
  
  const labelDaySize = Math.round(calH * (isMobile ? 0.0115 : 0.02) * scale);
  const family = sanitizeFamily(fontFamily);
  const weight = getFontWeight(family);

  ctx.font = `${weight} ${labelDaySize}px "${family}"`;
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 1;

  const colW = calW / 7;
  const rowsTop = yPos + Math.round(calH * (isMobile ? 0.03 : 0.055) * scale);
  const rowH = Math.round(calH * (isMobile ? 0.027 : 0.055) * scale);
  
  const startX = -calW / 2 + colW / 2;

  for (let d = 1; d <= totalDays; d++) {
    const idx = offset + (d - 1);
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const x = startX + col * colW;
    const y = rowsTop + row * rowH;
    ctx.fillText(String(d), x, y);
  }
}

function drawTextOverlay(
  ctx: NodeCanvasRenderingContext2D,
  config: WallpaperConfig,
  width: number,
  height: number
): void {
  if (!config.textOverlay?.enabled || !config.textOverlay.content) return;
  
  const { content, position = "center", fontSize, font, useTypographyFont } = config.textOverlay;
  const scale = config.calendarScale;
  
  ctx.globalAlpha = 1;
  const overlayFontSize = Math.round(height * 0.04 * fontSize * scale);

  let overlayFamily = useTypographyFont ? sanitizeFamily(config.fontFamily) : sanitizeFamily(font);
  const weight = getFontWeight(overlayFamily);

  ctx.font = `${weight} ${overlayFontSize}px "${overlayFamily}"`;
  ctx.fillStyle = config.textColor;
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = Math.max(2, Math.round(height * 0.008));

  const paddingX = width * 0.05;
  const paddingY = height * 0.05;
  
  let x: number;
  let maxTextWidth: number;

  if (position.includes("left")) {
    ctx.textAlign = "left";
    x = paddingX;
    maxTextWidth = width - 2 * paddingX;
  } else if (position.includes("right")) {
    ctx.textAlign = "right";
    x = width - paddingX;
    maxTextWidth = width - 2 * paddingX;
  } else {
    ctx.textAlign = "center";
    x = width / 2;
    maxTextWidth = width - 2 * paddingX;
  }

  const paragraphs = content.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  const lineHeight = overlayFontSize * 1.2;
  const totalHeight = lines.length * lineHeight;

  ctx.textBaseline = "top";
  let startY: number;
  
  if (position.startsWith("top-")) {
    startY = paddingY;
  } else if (position.startsWith("bottom-")) {
    startY = height - paddingY - totalHeight;
  } else {
    startY = (height - totalHeight) / 2;
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * lineHeight);
  });
  
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = Math.max(1, Math.round(height * 0.004));
}

function drawWallpaperCalendar(
  ctx: NodeCanvasRenderingContext2D,
  width: number,
  height: number,
  config: WallpaperConfig
): void {
  const { offsetX = 0, offsetY = 0, viewMode = "desktop", calendarScale = 1 } = config;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = config.textColor;
  ctx.imageSmoothingEnabled = true;
  // Type assertion used here because imageSmoothingQuality is supported at runtime
  // by node-canvas but is missing from its Type Definitions
  (ctx as any).imageSmoothingQuality = "high";
  
  ctx.shadowBlur = Math.max(1, Math.round(height * 0.004));
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = "rgba(0,0,0,0.25)";

  const layout = calculateLayout(width, height, config);
  const { isMobile, calW } = layout;
  
  const normX = Math.max(-1, Math.min(1, offsetX));
  let normY = Math.max(-1, Math.min(1, offsetY));
  
  const verticalScaleAdjustment = (calendarScale - 1) * -0.5;
  normY += verticalScaleAdjustment;
  normY = Math.max(-1, Math.min(1, normY));

  const startX = width / 2;
  const startY = height * (isMobile ? 0.4 : 0.34);
  
  const shiftX = normX * ((width - calW) / 2);
  const shiftY = normY * (height * 0.3);

  ctx.save();
  ctx.translate(startX + shiftX, startY + shiftY);
  
  let currentY = 0;
  
  currentY = drawMonthHeader(ctx, config, calW, height, currentY);
  currentY = drawDayLabels(ctx, config, calW, height, currentY, config.weekStart);
  drawDateGrid(ctx, config, calW, height, currentY);
  
  ctx.restore();

  drawTextOverlay(ctx, config, width, height);
}

export async function generateWallpaper(
  imageBuffer: Buffer,
  config: WallpaperConfig
): Promise<Buffer> {
  try {
    const dimensions = imageSize(imageBuffer);
    if (!dimensions.width || !dimensions.height) {
      throw new ImageValidationError("Could not determine image dimensions");
    }

    if (dimensions.width > MAX_WIDTH || dimensions.height > MAX_HEIGHT) {
      throw new ImageValidationError(`Image dimensions exceed maximum limits (${MAX_WIDTH}x${MAX_HEIGHT})`);
    }

    if (dimensions.width * dimensions.height > MAX_PIXELS) {
      throw new ImageValidationError(`Image resolution exceeds maximum limit (${MAX_PIXELS} pixels)`);
    }
  } catch (e) {
    if (e instanceof ImageValidationError) throw e;
    throw new ImageValidationError("Invalid image data");
  }

  const image = await loadImage(imageBuffer);
  
  const width = image.width;
  const height = image.height;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx, width, height, image);
  drawWallpaperCalendar(ctx, width, height, config);

  return canvas.toBuffer("image/png");
}
