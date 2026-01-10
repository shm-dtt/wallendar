import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import { daysInMonth, firstDayOffset, formatMonthHeader, HeaderFormat } from "./calendar-utils";
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
// We register them with standard weights unless they are specific variants
register("ProductSans.ttf", "Product Sans");
register("ProductSans.ttf", "Product Sans", "400"); // Explicit fallback
register("Montserrat.ttf", "Montserrat", "500"); // Used as 500 in code
register("Doto.ttf", "Doto", "700"); // Used as 700 in code
register("CraftyGirls.ttf", "Crafty Girls");
register("FreckleFace.ttf", "Freckle Face");
register("PlaywriteCA.ttf", "Playwrite CA");
register("SegoeScript.TTF", "Segoe Script");
register("InstrumentSerif.ttf", "Instrument Serif");
register("Ultra.ttf", "Ultra");

// Also register standard system fallbacks to avoid crashes if something is missing
register("ProductSans.ttf", "ui-sans-serif");
register("ProductSans.ttf", "system-ui");

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

// Day labels
const DOW_SUN = ["S", "M", "T", "W", "T", "F", "S"];
const DOW_MON = ["M", "T", "W", "T", "F", "S", "S"];

// Constants for image validation
const MAX_WIDTH = 8192; // 8K
const MAX_HEIGHT = 8192; // 8K
const MAX_PIXELS = 50_000_000; // ~50MP

function drawWallpaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: any
) {
  // Enable smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw image cover with subtle vignette
  const scale = Math.max(width / image.width, height / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;
  ctx.drawImage(image, dx, dy, dw, dh);

  // Vignette
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.9
  );
  grad.addColorStop(0, "rgba(0,0,0,0.10)");
  grad.addColorStop(1, "rgba(0,0,0,0.40)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Bottom fade
  const bottom = ctx.createLinearGradient(0, height * 0.7, 0, height);
  bottom.addColorStop(0, "rgba(0,0,0,0.0)");
  bottom.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);
}

function drawWallpaperCalendar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WallpaperConfig
) {
  const {
    month,
    year,
    weekStart,
    headerFormat,
    textColor,
    fontFamily,
    offsetX = 0,
    offsetY = 0,
    viewMode = "desktop",
    calendarScale = 1,
    textOverlay,
  } = config;

  // Helper: drawTrackedCentered
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

  // Helper: measureTrackedWidth
  function measureTrackedWidth(text: string, trackingPx: number) {
    const chars = Array.from(text);
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    return (
      widths.reduce((a, b) => a + b, 0) +
      trackingPx * Math.max(0, chars.length - 1)
    );
  }

  const isMobile = viewMode === "mobile";
  const scale = Math.max(0.5, Math.min(1.5, calendarScale ?? 1));

  let monthSize = Math.round(height * (isMobile ? 0.03 : 0.05) * scale);
  const minMonthSize = Math.round(monthSize * 0.5); // Allow shrinking to 50% of initial size
  const labelDaySize = Math.round(height * (isMobile ? 0.0115 : 0.02) * scale);

  const gridWidth = width * (isMobile ? 0.35 : 0.25) * scale;
  const startX = (width - gridWidth) / 2;
  const colW = gridWidth / 7;
  const baseY = height * (isMobile ? 0.4 : 0.34);

  const normX = Math.max(-1, Math.min(1, offsetX ?? 0));
  let normY = Math.max(-1, Math.min(1, offsetY ?? 0));

  const verticalScaleAdjustment = (scale - 1) * -0.5;
  normY += verticalScaleAdjustment;
  normY = Math.max(-1, Math.min(1, normY));

  const maxShiftX = startX;
  const maxShiftY = height * 0.3;
  const shiftX = normX * maxShiftX;
  const shiftY = normY * maxShiftY;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = textColor;

  ctx.shadowBlur = Math.max(1, Math.round(height * 0.004));
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  // Canvas in node needs explicit shadow color usually, but client defaults to transparent black?
  // Client code: context.shadowColor = "rgba(0,0,0,0.25)" commented out?
  // Wait, line 191 in client code is commented out. But line 348 sets it for overlay.
  // We'll set a default shadow color just in case blur is used.
  ctx.shadowColor = "rgba(0,0,0,0.25)";

  const monthName = formatMonthHeader(month, year, headerFormat);

  const incoming = (fontFamily || "").trim();
  const MONTH_ONLY_DELIM = "|||MONTH_ONLY|||";
  let monthFamily = incoming;
  let bodyFamily = incoming || "Product Sans";

  if (incoming.includes(MONTH_ONLY_DELIM)) {
    const parts = incoming.split(MONTH_ONLY_DELIM);
    monthFamily = (parts[0] || "Product Sans").trim();
    bodyFamily = (parts[1] || "Product Sans").trim();
  }

  function sanitizeFamily(fam: string) {
    if (
      !fam ||
      fam.toLowerCase() === "default" ||
      fam.toLowerCase() === "default (product sans)" ||
      fam === "__default__"
    ) {
      return "Product Sans";
    }
    // Remove var() stuff if present, though unlikely in server request
    return fam.replace(/var\([^)]*\)\s*,?/g, "").trim();
  }

  function getFontWeight(fontFam: string) {
    if (fontFam.includes("Montserrat")) return "500";
    if (fontFam.includes("Doto")) return "700";
    return "400";
  }

  const safeMonthFamily = sanitizeFamily(monthFamily);
  const safeBodyFamily = sanitizeFamily(bodyFamily);

  // Month Title
  let tracking = monthSize * 0.055;
  const monthWeight = getFontWeight(monthFamily);
  ctx.font = `${monthWeight} ${monthSize}px "${safeMonthFamily}"`;
  let measured = measureTrackedWidth(monthName, tracking);
  const maxMonthWidth = gridWidth * 0.96;
  
  // Adjusted shrink loop with dynamic minimum
  while (measured > maxMonthWidth && monthSize > minMonthSize) {
    monthSize -= 2;
    tracking = monthSize * 0.055;
    ctx.font = `${monthWeight} ${monthSize}px "${safeMonthFamily}"`;
    measured = measureTrackedWidth(monthName, tracking);
  }
  drawTrackedCentered(monthName, width / 2 + shiftX, baseY + shiftY, tracking);

  // Day Labels
  const labels = weekStart === "sunday" ? DOW_SUN : DOW_MON;
  const bodyWeight = getFontWeight(bodyFamily);
  ctx.font = `${bodyWeight} ${labelDaySize}px "${safeBodyFamily}"`;
  const dowY =
    baseY + Math.round(height * (isMobile ? 0.05 : 0.08) * scale) + shiftY;
  
  labels.forEach((label, i) => {
    const x = startX + i * colW + colW / 2 + shiftX;
    ctx.globalAlpha = 0.8;
    ctx.fillText(label, x, dowY);
  });

  // Dates
  ctx.font = `${bodyWeight} ${labelDaySize}px "${safeBodyFamily}"`;
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOffset(year, month, weekStart);
  const rowsTop = dowY + Math.round(height * (isMobile ? 0.03 : 0.055) * scale);
  const rowH = Math.round(height * (isMobile ? 0.027 : 0.055) * scale);

  ctx.globalAlpha = 1;
  for (let d = 1; d <= totalDays; d++) {
    const idx = offset + (d - 1);
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const x = startX + col * colW + colW / 2 + shiftX;
    const y = rowsTop + row * rowH;
    ctx.fillText(String(d), x, y);
  }

  // Text Overlay
  if (textOverlay?.enabled && textOverlay.content) {
    ctx.globalAlpha = 1;
    const overlayFontSize = Math.round(
      height * 0.04 * textOverlay.fontSize * scale
    );

    let overlayFontFamily: string;
    let overlayFontWeight: string;

    if (textOverlay.useTypographyFont) {
      overlayFontFamily = safeMonthFamily;
      overlayFontWeight = monthWeight;
    } else {
      const customFont = textOverlay.font || "Product Sans";
      overlayFontFamily = sanitizeFamily(customFont);
      overlayFontWeight = getFontWeight(customFont);
    }

    ctx.font = `${overlayFontWeight} ${overlayFontSize}px "${overlayFontFamily}"`;
    ctx.fillStyle = textColor;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = Math.max(2, Math.round(height * 0.008));

    const paddingX = width * 0.05;
    const paddingY = height * 0.05;
    const position = textOverlay.position || "center";

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

    // Wrap text
    const paragraphs = textOverlay.content.split("\n");
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
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) wrappedLines.push(currentLine);
    }

    const lineHeight = overlayFontSize * 1.2;
    const totalHeight = wrappedLines.length * lineHeight;

    ctx.textBaseline = "top";
    let startY: number;
    if (position.startsWith("top-")) {
      startY = paddingY;
    } else if (position.startsWith("bottom-")) {
      startY = height - paddingY - totalHeight;
    } else {
      startY = (height - totalHeight) / 2;
    }

    wrappedLines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.fillText(line, x, y);
    });

    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = Math.max(1, Math.round(height * 0.004));
  }
}

export async function generateWallpaper(
  imageBuffer: Buffer,
  config: WallpaperConfig
): Promise<Buffer> {
  // Pre-validate dimensions using header-only check (no full decode)
  try {
    const dimensions = imageSize(imageBuffer);
    if (!dimensions.width || !dimensions.height) {
      throw new Error("Could not determine image dimensions");
    }

    if (dimensions.width > MAX_WIDTH || dimensions.height > MAX_HEIGHT) {
      throw new Error(`Image dimensions exceed maximum limits (${MAX_WIDTH}x${MAX_HEIGHT})`);
    }

    if (dimensions.width * dimensions.height > MAX_PIXELS) {
      throw new Error(`Image resolution exceeds maximum limit (${MAX_PIXELS} pixels)`);
    }
  } catch (e) {
    // If checking dimensions fails (e.g. unknown format), or validation fails, propagate error
    // If it's the "could not determine" error, you might want to allow loadImage to try or just fail.
    // For security, we fail.
    throw e;
  }

  // Safe to load
  const image = await loadImage(imageBuffer);
  
  const width = image.width;
  const height = image.height;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  drawWallpaperBackground(ctx, width, height, image);
  drawWallpaperCalendar(ctx, width, height, config);

  return canvas.toBuffer("image/png");
}
