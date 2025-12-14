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
