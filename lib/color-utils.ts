/**
 * Converts a single sRGB color channel value to its linear equivalent.
 * @param colorChannel The sRGB channel value (0-255).
 * @returns The linearized channel value (0-1).
 */
function sRGBtoLin(colorChannel: number): number {
  const c = colorChannel / 255;
  if (c <= 0.03928) {
    return c / 12.92;
  }
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the average WCAG relative luminance of a specific area of a canvas.
 * This version is optimized to sample a subset of pixels for performance.
 * @param ctx The 2D rendering context of the canvas.
 * @param x The horizontal coordinate of the top-left corner of the area to analyze.
 * @param y The vertical coordinate of the top-left corner of the area to analyze.
 * @param width The width of the area to analyze.
 * @param height The height of the area to analyze.
 * @returns A number between 0 (darkest) and 1 (lightest) representing the average relative luminance.
 */
export function getAverageLuminance(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): number {
  if (width === 0 || height === 0) {
    return 0;
  }

  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  let totalLuminance = 0;
  let pixelCount = 0;

  // For performance, sample every 4th pixel (i.e., jump 16 bytes at a time).
  const sampleRate = 4;

  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = sRGBtoLin(data[i]);
    const g = sRGBtoLin(data[i + 1]);
    const b = sRGBtoLin(data[i + 2]);

    // WCAG relative luminance formula
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    totalLuminance += luminance;
    pixelCount++;
  }

  if (pixelCount === 0) {
    return 0;
  }

  // The result is already normalized between 0 and 1.
  return totalLuminance / pixelCount;
}
